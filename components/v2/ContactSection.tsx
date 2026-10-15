"use client";

import { useState, type FormEvent } from "react";
import { ANCHORS, CONTACT } from "@/config/v2.content";
import { submitForm } from "@/lib/submit-form";
import { Container, Eyebrow, Field, FormMessage, Honeypot, buttonClass } from "./ui";

type Status = "idle" | "submitting" | "success" | "error";

/** « Contact » (maquette, nœud `40:794`). */
export default function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const contact = {
      name: get("name"),
      email: get("email"),
      organization: get("organization"),
      subject: get("subject"),
      phone: get("phone"),
      message: get("message"),
    };

    if (get("website")) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setError(null);
    const result = await submitForm({
      endpoint: "/api/contact",
      payload: { ...contact, website: get("website") },
      logLabel: "Contact",
      fallback: {
        subject: `RENVERSEMENT — contact : ${contact.subject}`,
        fields: {
          "Nom et prénoms": contact.name,
          "E-mail": contact.email,
          "Organisation / entreprise": contact.organization,
          Téléphone: contact.phone,
          Objet: contact.subject,
          Message: contact.message,
        },
      },
    });

    if (result.ok) {
      setStatus("success");
      form.reset();
      return;
    }
    setStatus("error");
    setError(
      result.reason === "invalid"
        ? "Merci de compléter tous les champs et de vérifier l'adresse e-mail."
        : "Le message n'a pas pu être envoyé. Merci de réessayer, ou d'écrire directement à l'adresse ci-contre."
    );
  };

  return (
    <section
      id={ANCHORS.contact}
      aria-labelledby="titre-contact"
      className="bg-black py-16 md:py-20"
    >
      <Container className="flex flex-col gap-10 md:gap-[52px]">
        <Eyebrow>{CONTACT.eyebrow}</Eyebrow>
        <div className="grid gap-12 lg:grid-cols-[428px_minmax(0,751px)] lg:justify-between lg:gap-7">
          <div className="flex flex-col gap-[11px]">
            <h2
              id="titre-contact"
              className="font-display text-[26px] leading-[1.2] tracking-[0.05em] text-light-grey sm:text-[32px]"
            >
              {CONTACT.title}
            </h2>
            <p className="mb-2 text-base leading-[1.6] text-light-grey/65">{CONTACT.body}</p>
            <p className="font-semibold leading-[1.6] text-light-grey/65">
              Email:{" "}
              <a href={`mailto:${CONTACT.email}`} className="hover:text-terracota">
                {CONTACT.email}
              </a>
            </p>
            <p className="font-semibold leading-[1.6] text-light-grey/65">
              Téléphone:{" "}
              <a href={`tel:${CONTACT.phoneHref}`} className="hover:text-terracota">
                {CONTACT.phone}
              </a>
            </p>
          </div>

          {status === "success" ? (
            // PROVISOIRE — aucun message de confirmation dans la maquette.
            <FormMessage tone="success">
              Merci, votre demande a bien été transmise à l&apos;équipe RENVERSEMENT.
            </FormMessage>
          ) : (
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
                  label="Organisation / entreprise"
                  name="organization"
                  autoComplete="organization"
                />
              </div>
              <div className="grid gap-7 sm:grid-cols-2">
                <Field label="Objet" name="subject" />
                <Field label="Numero de telephone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <Field label="Message" name="message" multiline />
              <Honeypot />
              <div className="flex flex-col items-start gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={buttonClass("primary")}
                >
                  {status === "submitting" ? "Envoi en cours…" : CONTACT.submit}
                </button>
                {status === "error" && error && <FormMessage tone="error">{error}</FormMessage>}
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
