import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * Section 03 — Une seule direction (§6.4)
 *
 * Le cadran « 180° » et sa rotation pilotée au scroll ont été supprimés à la
 * 2e passe de retours. La phrase de conclusion, elle, reste — seul son
 * renversement a été retiré : elle se lit désormais à l'endroit.
 *
 * C'est un revirement par rapport au debrief V1, qui demandait au contraire
 * qu'elle apparaisse renversée. Ne pas la remettre à l'envers en se fiant à ce
 * premier document.
 *
 * Sont partis avec le cadran : la dépendance à GSAP/ScrollTrigger de cette
 * section, l'orbite décorative en pointillés, et le bouton alternatif clavier
 * qu'exigeait le §6.4 — celui-ci n'a plus d'objet puisqu'il n'y a plus
 * d'interaction. Si la rotation devait revenir, il faudrait le rétablir.
 */
export default function Section03Direction() {
  return (
    <SectionWrapper id="direction" compact className="text-center">
      <p className="font-display text-[clamp(1.5rem,3.6vw,2.75rem)] uppercase leading-tight text-light-grey max-w-3xl">
        On nous a appris à regarder dans une seule direction.
      </p>

      <p className="mt-8 text-base sm:text-lg text-light-grey/60 max-w-lg">
        À force d&apos;être répétée, une perspective devient une certitude.
      </p>

      <p className="mt-12 max-w-2xl font-display text-lg sm:text-xl uppercase leading-relaxed text-light-grey">
        Une certitude devient un récit. Un récit peut devenir une prison.
      </p>
    </SectionWrapper>
  );
}
