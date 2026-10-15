"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MOVEMENT } from "@/config/v2.content";
import { subscribeToCircle } from "@/lib/subscribe";
import SocialLinks from "./SocialLinks";
import { Eyebrow, Field, FormMessage, Honeypot, buttonClass } from "./ui";

type Status = "idle" | "submitting" | "success" | "error" | "duplicate";

/**
 * Fenêtre « Rejoindre le mouvement » (maquette, nœuds `161:55` et, une fois
 * inscrit, `161:107` « SUCCESS MODAL »).
 *
 * C'est la suite directe du Cercle de la V1 : même route, même liste Brevo
 * (§17 : « conserver la base des contacts collectés »), avec en plus le
 * téléphone/WhatsApp demandé par la maquette. Un inscrit de la V1 qui
 * revient est reconnu comme déjà inscrit.
 *
 * Construite sur `<dialog>` : focus piégé, Échap et fond inerte sont fournis
 * par le navigateur.
 */
export default function MovementModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // À la fermeture, on repart du formulaire vierge pour la prochaine
  // ouverture — sauf envoi en cours, dont le résultat doit pouvoir s'afficher.
  useEffect(() => {
    if (open) return;
    setError(null);
    setStatus((s) => (s === "submitting" ? s : "idle"));
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const name = get("name");
    const email = get("email");
    const phone = get("phone");

    if (get("website")) {
      setStatus("success");
      return;
    }
    if (!name || !email || !phone) {
      setStatus("error");
      setError("Merci de compléter tous les champs.");
      return;
    }

    setStatus("submitting");
    setError(null);
    const result = await subscribeToCircle({ name, email, phone, source: "site-v2-mouvement" });

    if (result.ok) {
      setStatus("success");
      form.reset();
      return;
    }
    if (result.reason === "duplicate") {
      setStatus("duplicate");
      return;
    }
    setStatus("error");
    setError(
      result.reason === "invalid"
        ? "Cette adresse e-mail ne semble pas valide. Merci de la vérifier."
        : "L'inscription n'a pas pu aboutir. Merci de réessayer dans un instant."
    );
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Clic sur le fond (hors du panneau) : on ferme.
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby="titre-mouvement"
      className="m-auto max-h-[100svh] w-full max-w-[1514px] overflow-y-auto bg-black p-0 text-light-grey backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      <div className="relative px-6 py-14 sm:px-10 lg:px-24 lg:py-20">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center text-light-grey transition-colors hover:text-terracota sm:right-10 sm:top-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>

        {status === "success" ? (
          <Success />
        ) : (
          <>
            <Eyebrow className="!text-[clamp(1.25rem,3vw,2.375rem)] !leading-[1.4]">
              {MOVEMENT.eyebrow}
            </Eyebrow>
            <div className="mt-10 grid gap-12 lg:mt-[52px] lg:grid-cols-[428px_minmax(0,751px)] lg:gap-12">
              <div className="flex flex-col gap-[11px]">
                <h2
                  id="titre-mouvement"
                  className="font-display text-[28px] leading-[1.2] tracking-[0.05em] sm:text-[36px]"
                >
                  {MOVEMENT.title}
                </h2>
                <p className="text-base leading-[1.6] text-light-grey/65">{MOVEMENT.body}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <p className="font-semibold leading-[1.6] text-light-grey/65">{MOVEMENT.follow}</p>
                  <SocialLinks size={22} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="relative flex flex-col gap-7">
                <Field label="Nom et prénoms" name="name" autoComplete="name" />
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="monmail@email.com"
                  />
                  <Field
                    label="Numero de telephone/ WhatsApp"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
                <Honeypot />
                <div className="flex flex-col items-start gap-4">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className={buttonClass("primary")}
                  >
                    {status === "submitting" ? "Inscription en cours…" : MOVEMENT.submit}
                  </button>
                  {status === "duplicate" && (
                    <FormMessage tone="success">
                      Cette adresse e-mail est déjà inscrite.
                    </FormMessage>
                  )}
                  {status === "error" && error && <FormMessage tone="error">{error}</FormMessage>}
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

/**
 * Message de succès (maquette, nœud `161:107`). Le panneau de gauche y est un
 * composant animé (`success animation`, `161:343`) dont le contenu n'a pas été
 * transmis par l'export : PROVISOIRE, un simple cercle or qui se dessine.
 */
function Success() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[422px_1fr] lg:gap-20">
      <div aria-hidden="true" className="flex justify-center">
        <svg viewBox="0 0 120 120" className="h-32 w-32 lg:h-40 lg:w-40">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#B4742A"
            strokeWidth="2"
            pathLength={1}
            className="origin-center -rotate-90 [stroke-dasharray:1] motion-safe:animate-[trace_1.2s_ease-out]"
          />
          <path
            d="M40 62l14 14 28-30"
            fill="none"
            stroke="#B4742A"
            strokeWidth="2.5"
            pathLength={1}
            className="[stroke-dasharray:1] motion-safe:animate-[trace_0.6s_ease-out_0.9s_both]"
          />
        </svg>
      </div>
      <div className="flex max-w-[440px] flex-col gap-3">
        <h2
          id="titre-mouvement"
          className="font-display text-[28px] leading-[1.2] tracking-[0.05em] sm:text-[36px]"
        >
          {MOVEMENT.successTitle}
        </h2>
        <p className="text-base leading-[1.6] text-light-grey/65">{MOVEMENT.successBody}</p>
        <div className="mt-2">
          <SocialLinks size={30} />
        </div>
      </div>
    </div>
  );
}
