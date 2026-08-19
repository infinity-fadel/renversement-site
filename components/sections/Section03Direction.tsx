import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * Section 03 — Une seule direction (§6.4)
 *
 * Réduite à ses deux phrases sur demande du client (2e passe de retours) : le
 * cadran « 180° » et sa rotation pilotée au scroll ont été supprimés, ainsi que
 * la phrase affichée renversée (« Une certitude devient un récit… ») qui n'était
 * lisible qu'une fois le cadran tourné.
 *
 * Sont partis avec eux : la dépendance à GSAP/ScrollTrigger de cette section,
 * l'orbite décorative en pointillés et le bouton alternatif clavier qu'exigeait
 * le §6.4 — celui-ci n'a plus d'objet puisqu'il n'y a plus d'interaction. Si la
 * rotation devait revenir, il faudrait le rétablir en même temps.
 */
export default function Section03Direction() {
  return (
    <SectionWrapper id="direction" className="text-center">
      <p className="font-display text-[clamp(1.5rem,3.6vw,2.75rem)] uppercase leading-tight text-light-grey max-w-3xl">
        On nous a appris à regarder dans une seule direction.
      </p>

      <p className="mt-8 text-base sm:text-lg text-light-grey/60 max-w-lg">
        À force d&apos;être répétée, une perspective devient une certitude.
      </p>
    </SectionWrapper>
  );
}
