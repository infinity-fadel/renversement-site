import { SITE_CONFIG } from "@/config/site.config";
import Image from "next/image";

/**
 * Section 11 — Footer (§6.12)
 * Simple, lisible, non animé (§6.12) — pas de reveal au scroll ici,
 * volontairement, à la différence des sections numérotées précédentes.
 * L'accroche "Une question. Un mouvement. Une autre lecture." est le texte
 * exact du §6.12, mis en scène en grand (référence maquette) plutôt qu'en
 * petit texte muet.
 */
export default function Section11Footer() {
  return (
    <footer id="footer" className="relative w-full overflow-hidden">
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 min-h-[42vh]">
        {/* Les trois lignes sont espacées (debrief V1) : elles étaient séparées
            par de simples <br />, donc collées à l'interligne du titre. */}
        <h2 className="font-display text-2xl sm:text-4xl uppercase leading-tight flex flex-col gap-4 sm:gap-6">
          <span>
            <span className="text-light-grey">Une </span>
            <span className="text-terracota">question.</span>
          </span>
          <span>
            <span className="text-light-grey">Un </span>
            <span className="text-terracota">mouvement.</span>
          </span>
          <span>
            <span className="text-light-grey">Une autre </span>
            <span className="text-terracota">lecture.</span>
          </span>
        </h2>

        <div aria-hidden="true" className="flex items-center gap-3 my-10 w-full max-w-xs">
          <span className="flex-1 h-px bg-terracota/30" />
          <span className="w-2 h-2 rounded-full border border-terracota" />
          <span className="flex-1 h-px bg-terracota/30" />
        </div>

        <Image
          src="/logo/wordmark.webp"
          alt="RENVERSEMENT"
          width={1421}
          height={120}
          className="h-4 sm:h-5 w-auto"
        />
      </div>

      <div className="relative border-t border-light-grey/10 px-6 py-8 flex flex-col items-center gap-3 text-center">
        {/* Les liens « Mentions légales » et « Politique de confidentialité »
            ont été retirés à la demande du client (debrief V1) : les pages
            correspondantes n'existaient pas et ne sont plus prévues en V1. */}
        <p className="text-[11px] text-light-grey/40">
          Copyright © 2026 <span className="text-light-grey/70">{SITE_CONFIG.name}.</span>{" "}
          Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
