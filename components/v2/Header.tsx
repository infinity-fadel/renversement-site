"use client";

import { useEffect, useState } from "react";
import { ANCHORS, CTA_LABELS, NAV_LINKS } from "@/config/v2.content";
import { buttonClass } from "./ui";

/**
 * En-tête de la V2 (maquette, nœud `161:487`).
 *
 * Fixe, sur un voile brun translucide. « Rejoindre le mouvement » n'est pas
 * une ancre mais un bouton : il ouvre la fenêtre d'inscription (même
 * traitement que dans la maquette, où c'est le seul lien en demi-gras).
 *
 * La maquette n'existe qu'en 1512 px. Le menu complet y tient tout juste ;
 * en dessous de 1460 px il déborderait (mesuré : 1454 px requis en Montserrat), d'où le passage au menu repliable.
 */
export default function Header({ onJoin }: { onJoin: () => void }) {
  const [open, setOpen] = useState(false);

  // Échap ferme le menu, et le défilement de la page est gelé tant qu'il est
  // ouvert (sinon on fait défiler la page derrière le panneau).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const join = () => {
    setOpen(false);
    onJoin();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-[rgba(28,21,17,0.44)] backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1512px] items-center justify-between gap-5 px-6 sm:px-10 min-[1460px]:h-[93px] min-[1460px]:px-12 min-[1700px]:px-24">
        <a href={`#${ANCHORS.home}`} className="shrink-0" aria-label="RENVERSEMENT — accueil">
          <img
            src="/v2/wordmark-header.svg"
            alt=""
            width={193}
            height={53}
            className="h-auto w-[150px] sm:w-[193px]"
          />
        </a>

        <nav aria-label="Navigation principale" className="hidden min-[1460px]:block">
          <ul className="flex items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.anchor}>
                <a
                  href={`#${link.anchor}`}
                  className="flex h-12 items-center whitespace-nowrap px-4 text-[15px] uppercase text-light-grey transition-colors hover:text-terracota"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={join}
                className="flex h-12 items-center whitespace-nowrap px-4 text-[15px] font-semibold uppercase text-light-grey transition-colors hover:text-terracota"
              >
                {CTA_LABELS.join}
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`#${ANCHORS.order}`}
            className={buttonClass("secondary", "hidden whitespace-nowrap sm:inline-flex")}
          >
            {CTA_LABELS.order}
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex h-12 w-12 items-center justify-center text-light-grey min-[1460px]:hidden"
          >
            <span className="relative block h-3.5 w-6">
              <span
                className={`absolute left-0 h-[1.5px] w-6 bg-current transition-transform ${
                  open ? "top-1.5 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-6 bg-current transition-opacity ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-6 bg-current transition-transform ${
                  open ? "top-1.5 -rotate-45" : "top-3"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Navigation principale"
          className="h-[calc(100svh-76px)] overflow-y-auto border-t border-light-grey/10 bg-black/95 px-6 pb-10 pt-6 sm:px-10 min-[1460px]:hidden"
        >
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.anchor}>
                <a
                  href={`#${link.anchor}`}
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center border-b border-light-grey/10 text-base uppercase tracking-[0.08em] text-light-grey"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={join}
                className="flex h-14 w-full items-center border-b border-light-grey/10 text-base font-semibold uppercase tracking-[0.08em] text-light-grey"
              >
                {CTA_LABELS.join}
              </button>
            </li>
          </ul>
          <a
            href={`#${ANCHORS.order}`}
            onClick={() => setOpen(false)}
            className={buttonClass("primary", "mt-8 w-full")}
          >
            {CTA_LABELS.order}
          </a>
        </nav>
      )}
    </header>
  );
}
