import { SITE_CONFIG } from "@/config/site.config";
import Wordmark from "@/components/ui/Wordmark";

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
      <div className="relative flex flex-col items-center justify-center text-center px-6 py-32 sm:py-40 min-h-[70vh]">
        <h2 className="font-display text-2xl sm:text-4xl uppercase leading-tight">
          <span className="text-light-grey">Une </span>
          <span className="text-terracota">question.</span>
          <br />
          <span className="text-light-grey">Un </span>
          <span className="text-terracota">mouvement.</span>
          <br />
          <span className="text-light-grey">Une autre </span>
          <span className="text-terracota">lecture.</span>
        </h2>

        <div aria-hidden="true" className="flex items-center gap-3 my-10 w-full max-w-xs">
          <span className="flex-1 h-px bg-terracota/30" />
          <span className="w-2 h-2 rounded-full border border-terracota" />
          <span className="flex-1 h-px bg-terracota/30" />
        </div>

        <Wordmark className="font-display text-2xl sm:text-3xl uppercase text-light-grey tracking-widest2" />
      </div>

      <div className="relative border-t border-light-grey/10 px-6 py-8 flex flex-col items-center gap-3 text-center">
        <p className="text-[11px] text-light-grey/40">
          Copyright © 2026 <span className="text-light-grey/70">{SITE_CONFIG.name}.</span>{" "}
          Tous droits réservés.
        </p>

        {/* Pages légales à intégrer avant mise en production (§6.12) */}
        <nav
          aria-label="Liens légaux"
          className="flex items-center gap-4 text-[11px] tracking-widest2 uppercase text-light-grey/40"
        >
          <a href="/mentions-legales" className="hover:text-light-grey">
            Mentions légales
          </a>
          <span aria-hidden="true" className="text-terracota/50">
            •
          </span>
          <a href="/confidentialite" className="hover:text-light-grey">
            Politique de confidentialité
          </a>
        </nav>
      </div>
    </footer>
  );
}
