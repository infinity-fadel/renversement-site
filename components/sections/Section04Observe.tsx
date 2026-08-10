import dynamic from "next/dynamic";
import SectionWrapper from "@/components/ui/SectionWrapper";
import GlobeSVG from "@/components/ui/GlobeSVG";

// Le globe Three.js exige le WebGL du navigateur (canvas, WebGLRenderer) :
// chargement client uniquement, avec GlobeSVG comme fallback pendant le
// chargement du chunk (pas de saut de mise en page, dégradation progressive
// si JS est indisponible — §7.1, §8.3). Uniquement utilisé ici sur mobile :
// sur grand écran, le globe est rendu par GlobeBackground.tsx, un fond de
// page persistant dont la taille/position suivent le scroll (voir ce
// fichier pour le détail — c'est lui qui remplace l'ancien globe inline de
// cette section une fois qu'on dépasse le seuil `md`).
const GlobeThree = dynamic(() => import("@/components/ui/GlobeThree"), {
  ssr: false,
  loading: () => <GlobeSVG />,
});

const FLOW_CALLOUTS = [
  "Ici, les ressources.",
  "Ailleurs, la valeur.",
  "Entre les deux, des flux que l'on questionne rarement.",
];

/**
 * Section 04 — Observer depuis l'autre côté (§6.5)
 * Sur grand écran, cette section ne contient que le texte : le globe qui
 * l'accompagne visuellement est rendu par GlobeBackground.tsx (fond de page
 * persistant, piloté par le scroll — voir ce fichier), pas ici. Sur mobile,
 * où ce mécanisme de fond est désactivé, la section garde son propre globe
 * Three.js inline classique, avec repli sur GlobeSVG si WebGL est
 * indisponible.
 */
export default function Section04Observe() {
  return (
    <SectionWrapper id="observe" className="gap-10">
      {/* Colonne de texte contrainte à gauche sur desktop (le globe, à
          droite, est rendu par GlobeBackground.tsx en fond de page — cette
          seconde colonne vide sert juste à réserver l'espace pour que le
          texte ne s'étende pas jusqu'à le chevaucher). */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row md:items-center gap-10">
        <div className="md:w-[42%] flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.75rem)] uppercase text-light-grey leading-tight">
            Et si nous observions le monde depuis l&apos;autre côté ?
          </h2>
          <p className="mt-4 text-sm text-light-grey/60 max-w-sm">
            Les faits ne changent pas. Leur signification, oui.
          </p>
          <p className="mt-6 max-w-sm text-sm text-light-grey/60">
            Changer de perspective ne change pas le monde. Cela change ce que
            nous y voyons.
          </p>

          {/* Indicateur d'interaction (référence maquette) */}
          <div className="mt-10 flex items-center gap-4">
            <span
              aria-hidden="true"
              className="w-14 h-14 rounded-full border border-terracota/50 flex items-center justify-center shrink-0"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F2C94C"
                strokeWidth="1.5"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
                <path d="M3 2v4h4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[11px] tracking-widest2 uppercase text-light-grey/60 text-left leading-relaxed">
              Déplacez le globe
              <br />
              Explorez les flux
            </span>
          </div>

          <a
            href="#clues"
            className="mt-10 text-xs tracking-widest2 uppercase text-terracota underline underline-offset-4"
          >
            Regarder autrement
          </a>
        </div>

        <div className="hidden md:block md:w-[58%]" aria-hidden="true" />
      </div>

      {/* Mobile uniquement : globe inline classique (cf. commentaire plus haut) */}
      <div className="md:hidden flex flex-col items-center gap-10">
        <GlobeThree />
        <ul className="flex flex-col gap-3 text-xs tracking-widest2 uppercase text-light-grey/70 text-center">
          {FLOW_CALLOUTS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      </div>
    </SectionWrapper>
  );
}
