"use client";

import { useState, type FormEvent } from "react";
import { ANCHORS, BOOK, ORDER, type Retailer } from "@/config/v2.content";
import { submitForm } from "@/lib/submit-form";
import { Button, Container, Eyebrow, Field, FormMessage, Honeypot } from "./ui";

type Status = "idle" | "submitting" | "success" | "error";

/** Recadrage des logos dans leur cadre de 139 × 55, relevé dans la maquette
 *  (les fichiers sources sont des carrés avec beaucoup de marge). */
const LOGO_CROP: Record<string, React.CSSProperties> = {
  Amazon: { height: "218.55%", left: "-27.41%", top: "-55.43%", width: "153.81%" },
  Fnac: { height: "178.18%", left: "14.73%", top: "-39.09%", width: "70.55%" },
  "L’Harmattan": { height: "190.91%", left: "12.57%", top: "-38.18%", width: "75.59%" },
};

const MAX_QUANTITY = 50;

/**
 * « Commander le livre » (maquette, nœud `30:200`).
 *
 * À gauche, le formulaire de commande (paiement à la livraison, pour la Côte
 * d'Ivoire). À droite, les autres points de vente : revendeurs en ligne pour
 * l'étranger, magasins à Abidjan, Librairie de France en province.
 */
export default function OrderSection() {
  return (
    <section
      id={ANCHORS.order}
      aria-labelledby="titre-commander"
      className="bg-black py-16 md:py-20"
    >
      <Container className="flex flex-col items-center gap-10 md:gap-[52px]">
        <Eyebrow>
          <span id="titre-commander">{ORDER.eyebrow}</span>
        </Eyebrow>
        <div className="grid w-full max-w-[1306px] items-start gap-14 lg:grid-cols-[536px_1fr] lg:gap-[106px]">
          <OrderForm />
          <OtherChannels />
        </div>
      </Container>
    </section>
  );
}

function OrderForm() {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const order = {
      name: get("name"),
      phone: get("phone"),
      email: get("email"),
      address: get("address"),
      city: get("city"),
      quantity,
    };

    if (get("website")) {
      setStatus("success");
      return;
    }

    setStatus("submitting");
    setError(null);
    const result = await submitForm({
      endpoint: "/api/order",
      payload: { ...order, website: get("website") },
      logLabel: "Commande",
      fallback: {
        subject: `RENVERSEMENT — nouvelle commande (${order.quantity} ex., ${order.city})`,
        fields: {
          "Nom et prénoms": order.name,
          Téléphone: order.phone,
          "E-mail": order.email,
          "Lieu de livraison": order.address,
          "Ville ou commune": order.city,
          Quantité: String(order.quantity),
        },
      },
    });

    if (result.ok) {
      setStatus("success");
      form.reset();
      setQuantity(1);
      return;
    }
    setStatus("error");
    setError(
      result.reason === "invalid"
        ? "Merci de vérifier les champs, en particulier l'adresse e-mail."
        : "La commande n'a pas pu être envoyée. Merci de réessayer dans un instant."
    );
  };

  return (
    <div className="border border-terracota bg-[rgba(179,114,32,0.11)]">
      <div className="flex flex-col gap-[11px] px-6 pb-4 pt-6 font-display leading-[1.2] sm:px-8">
        <h3 className="text-[28px] tracking-[0.05em] text-light-grey sm:text-[32px]">
          {ORDER.formTitle}
        </h3>
        <p className="text-[22px] tracking-[0.07em] text-light-grey/65">{BOOK.priceLabel}</p>
      </div>

      {status === "success" ? (
        <div className="px-6 pb-8 pt-4 sm:px-8">
          {/* PROVISOIRE — aucun message de confirmation dans la maquette. */}
          <FormMessage tone="success">
            Votre commande est enregistrée. Notre équipe vous contactera pour organiser la
            livraison.
          </FormMessage>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate={false} className="relative">
          <div className="flex flex-col gap-7 p-6 sm:p-8">
            <Field label="Nom et prénoms" name="name" autoComplete="name" />
            <Field label="numéro de téléphone" name="phone" type="tel" autoComplete="tel" />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="monmail@email.com"
            />
            <Field label="lieu de livraison" name="address" autoComplete="street-address" />
            <Field label="ville ou commune" name="city" autoComplete="address-level2" />
            <div className="flex flex-col gap-2.5">
              <span
                id="libelle-quantite"
                className="flex items-center gap-2.5 text-base uppercase leading-[1.4] tracking-[0.03em]"
              >
                <span className="text-light-grey/65">_quantité</span>
                <span aria-hidden="true" className="text-light-grey">
                  *
                </span>
              </span>
              <div
                role="group"
                aria-labelledby="libelle-quantite"
                className="flex h-[46px] w-[152px] border border-light-grey/65"
              >
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Retirer un exemplaire"
                  className="w-[46px] text-lg text-taupe transition-colors hover:text-light-grey disabled:opacity-40"
                >
                  −
                </button>
                <output
                  aria-live="polite"
                  className="flex w-[60px] items-center justify-center border-x border-light-grey/65 font-bold text-light-grey"
                >
                  {quantity}
                </output>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="Ajouter un exemplaire"
                  className="w-[46px] text-lg text-taupe transition-colors hover:text-light-grey disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
            <Honeypot />
          </div>
          <div className="flex flex-col gap-4 px-6 pb-6 sm:px-8">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex h-12 w-full items-center justify-center bg-terracota text-[15px] uppercase text-light-grey transition-colors hover:bg-[#9a6324] disabled:opacity-60"
            >
              {status === "submitting" ? "Envoi en cours…" : ORDER.submit}
            </button>
            <p className="text-center text-sm italic leading-[1.2] text-light-grey">
              {ORDER.paymentNote}
            </p>
            {status === "error" && error && <FormMessage tone="error">{error}</FormMessage>}
          </div>
        </form>
      )}
    </div>
  );
}

function OtherChannels() {
  return (
    <div className="flex flex-col gap-10">
      <h3 className="font-display text-[26px] leading-[1.2] tracking-[0.05em] text-light-grey sm:text-[32px]">
        {ORDER.abroadTitle}
      </h3>

      {/* La maquette prévoit des flèches de défilement pour six revendeurs ;
          avec les trois identifiés, tout tient sur une ligne et les flèches
          n'auraient rien à faire défiler. */}
      <ul className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 sm:grid-cols-3">
        {ORDER.retailers.map((retailer) => (
          <RetailerCard key={retailer.name} retailer={retailer} />
        ))}
      </ul>

      <div className="grid gap-10 border-t-[0.5px] border-light-grey/45 pb-6 pt-10 sm:grid-cols-2 sm:gap-[52px]">
        <div className="flex flex-col items-start gap-4">
          <p className="font-semibold leading-[1.4] text-light-grey">{ORDER.storesTitle}</p>
          <Button variant="secondary" href={ORDER.storesUrl}>
            <img src="/v2/map-pin.svg" alt="" width={20} height={20} />
            {ORDER.storesCta}
          </Button>
        </div>
        <div className="flex flex-col gap-4 leading-[1.4] text-light-grey">
          <p className="max-w-[202px] font-semibold">{ORDER.provinceTitle}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {ORDER.provinceCities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RetailerCard({ retailer }: { retailer: Retailer }) {
  return (
    <li className="flex flex-col items-center gap-5 bg-light-grey/10 p-6">
      <p className="text-center leading-[1.4] text-light-grey">{ORDER.availableOn}</p>
      <div
        className="relative h-[55px] w-[139px] overflow-hidden"
        style={{ background: retailer.logoBackground }}
      >
        <img
          src={retailer.logo}
          alt={retailer.name}
          className="absolute max-w-none"
          style={LOGO_CROP[retailer.name]}
        />
      </div>
      <Button href={retailer.url} className="!h-11">
        {ORDER.retailerCta}
      </Button>
    </li>
  );
}
