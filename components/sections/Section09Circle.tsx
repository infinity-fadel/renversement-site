"use client";

import { useState, FormEvent } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { SITE_CONFIG } from "@/config/site.config";
import { subscribeToCircle } from "@/lib/formsubmit";

type FormStatus = "idle" | "submitting" | "success" | "error" | "duplicate";

/**
 * Section 09 — Le Cercle (§6.10)
 * L'envoi part du NAVIGATEUR vers FormSubmit (voir lib/formsubmit.ts, qui
 * documente pourquoi le relais serveur a été abandonné : Cloudflare bloque
 * les IP de datacenter). Validation, champ-piège, anti double-soumission et
 * messages d'état sont donc désormais entièrement côté client.
 * Champs nom+e-mail conservés (conforme au texte du cahier des charges :
 * "Nom et prénom obligatoires") même si la maquette de référence ne montre
 * que l'e-mail — décision confirmée explicitement, pas une divergence.
 */
export default function Section09Circle() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return; // anti double-soumission

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const consent = formData.get("consent") === "on";
    const honeypot = String(formData.get("website") ?? "");

    if (!name || !email || !consent) {
      setStatus("error");
      setErrorMsg("Merci de compléter tous les champs et d'accepter le consentement.");
      return;
    }

    // Champ-piège : invisible pour un humain, rempli par les robots qui
    // complètent aveuglément tous les champs. On affiche « succès » sans rien
    // envoyer — un refus explicite apprendrait au robot à le contourner.
    // Ce contrôle était côté serveur ; il suit l'envoi côté client.
    if (honeypot) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    const result = await subscribeToCircle({ name, email, source: "site-v1" });

    if (!result.ok) {
      setStatus("error");
      setErrorMsg("Une erreur technique est survenue. Merci de réessayer.");
      return;
    }

    setStatus("success");
    form.reset();
  };

  return (
    <SectionWrapper id="circle" className="relative overflow-hidden">
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-16 px-2">
        <div className="relative flex-1 text-center flex flex-col items-center">
          <div aria-hidden="true" className="flex flex-col items-center mb-3">
            <span className="font-display text-sm text-terracota">09</span>
            <span className="w-6 h-px bg-terracota/60 mt-2" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl uppercase leading-tight">
            <span className="text-light-grey">Le Cercle des</span>
            <br />
            <span className="text-terracota">premiers observateurs</span>
          </h2>
          <span aria-hidden="true" className="w-10 h-px bg-terracota/40 mt-6 mb-6" />

          <p className="text-sm sm:text-base text-light-grey/70 max-w-md">
            Lorsque le moment viendra, vous serez parmi les premiers à
            découvrir ce qui se cachait derrière cette question.
          </p>
          <p className="mt-3 text-sm sm:text-base text-terracota max-w-md">
            Rejoignez celles et ceux qui souhaitent regarder autrement.
          </p>

          {status === "success" ? (
            <p
              role="status"
              className="mt-10 font-display text-xl text-terracota"
            >
              Vous êtes dans le Cercle. La suite vous parviendra en premier.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 w-full max-w-sm flex flex-col gap-4"
              noValidate
            >
              {/* Champ-piège : invisible, hors tabulation, ignoré des lecteurs
                  d'écran. Un robot qui remplit tout le formulaire le remplira
                  aussi, et la soumission sera écartée avant tout envoi. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="name"
                  className="text-[11px] tracking-widest2 uppercase text-light-grey/60"
                >
                  — Nom et prénom
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="bg-black/40 border border-light-grey/20 px-4 py-3 text-light-grey placeholder:text-light-grey/30 focus:border-terracota outline-none"
                />
              </div>

              <div className="flex flex-col gap-1 text-left">
                <label
                  htmlFor="email"
                  className="text-[11px] tracking-widest2 uppercase text-light-grey/60"
                >
                  — Votre adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nom@entreprise.com"
                  className="bg-black/40 border border-light-grey/20 px-4 py-3 text-light-grey placeholder:text-light-grey/30 focus:border-terracota outline-none"
                />
              </div>

              <label className="flex items-start gap-2 text-left text-xs text-light-grey/60 mt-2">
                <input type="checkbox" name="consent" required className="mt-1" />
                <span>
                  J&apos;accepte de recevoir des informations de{" "}
                  {SITE_CONFIG.name} concernant le lancement.
                </span>
              </label>

              {(status === "error" || status === "duplicate") && (
                <p role="alert" className="text-xs text-terracota">
                  {status === "duplicate"
                    ? "Cette adresse e-mail est déjà inscrite."
                    : errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-4 text-xs tracking-widest2 uppercase bg-terracota text-black py-4 hover:bg-light-grey transition-colors disabled:opacity-50"
              >
                {status === "submitting"
                  ? "Inscription en cours…"
                  : "Rejoindre le Cercle"}
              </button>

            </form>
          )}
        </div>

        {/*
          Panneau latéral (référence maquette) — n'apparaît qu'après une
          inscription réussie, comme demandé au debrief V1. Le rendre
          conditionnel règle du même coup le second retour : tant qu'il occupe
          une colonne, il pousse le formulaire hors de l'axe et la section
          paraît décentrée. Sans lui, la colonne `flex-1` occupe toute la
          largeur et le contenu retombe au centre.
        */}
        {status === "success" && (
          <div className="hidden lg:flex flex-col gap-6 w-72 shrink-0 pt-16">
            <div className="border border-terracota px-6 py-5 flex items-start gap-3">
              <span
                aria-hidden="true"
                className="shrink-0 w-8 h-8 rounded-full border border-terracota flex items-center justify-center"
              >
                <CheckIcon />
              </span>
              <span className="text-xs tracking-widest2 uppercase text-terracota leading-relaxed">
                Vous êtes dans le Cercle.
              </span>
            </div>

            <div className="border border-light-grey/15 px-6 py-6">
              <span className="text-xs tracking-widest2 uppercase text-terracota">
                Prolongez l&apos;expérience.
              </span>
              <span aria-hidden="true" className="block w-8 h-px bg-terracota/40 my-3" />
              <p className="text-sm text-light-grey/60 leading-relaxed">
                D&apos;autres indices vous attendent.
                <br />
                Le moment venu, vous comprendrez.
              </p>
              <p className="mt-3 text-sm text-terracota leading-relaxed">
                En attendant, restez attentif.
              </p>
            </div>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B4742A"
      strokeWidth="2"
    >
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
