import SectionWrapper from "@/components/ui/SectionWrapper";
import { SITE_CONFIG } from "@/config/site.config";

/**
 * Section 10 — Phrase finale (§6.11)
 * Aucun nouveau CTA principal pour ne pas diluer la conversion de la
 * section 09.
 */
export default function Section10Final() {
  return (
    <SectionWrapper id="final" className="text-center">
      <p className="font-display text-2xl sm:text-4xl uppercase text-light-grey max-w-2xl">
        Bientôt, une autre lecture émergera.
      </p>
      <p className="mt-6 text-sm text-light-grey/60 max-w-md">
        Ce que vous croyez évident mérite peut-être d&apos;être renversé.
      </p>
      <p className="mt-10 font-display text-xs tracking-widest2 uppercase text-terracota">
        {SITE_CONFIG.name}
      </p>
    </SectionWrapper>
  );
}
