import SectionWrapper from "@/components/ui/SectionWrapper";

const FLOW_CALLOUTS = ["Ici, les ressources.", "Ailleurs, la valeur."];

/**
 * Section 04 — Observer depuis l'autre côté (§6.5)
 *
 * Sur grand écran, cette section ne contient que du texte : le globe qui
 * l'accompagne est rendu par GlobeBackground.tsx (fond de page persistant,
 * piloté par le scroll — voir ce fichier).
 *
 * Sur mobile, il n'y a plus de globe du tout : le debrief V1 demande
 * explicitement de le masquer et de ne garder que les trois légendes, « ENTRE
 * LES DEUX… » centrée sous les deux premières. Three.js ne part donc plus
 * jamais dans le bundle mobile — GlobeThree n'est plus importé ici, seul
 * GlobeBackground (déjà `hidden md:block`) le charge, en `next/dynamic`.
 */
export default function Section04Observe() {
  return (
    <SectionWrapper id="observe" className="gap-10">
      {/* Colonne de texte contrainte à gauche sur desktop (le globe, à droite,
          est rendu par GlobeBackground.tsx en fond de page — cette seconde
          colonne vide sert juste à réserver l'espace pour que le texte ne
          s'étende pas jusqu'à le chevaucher). */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row md:items-center gap-10">
        <div className="md:w-[42%] flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="font-display text-[clamp(1.5rem,3.4vw,2.75rem)] uppercase text-light-grey leading-tight">
            Et si nous observions le monde depuis l&apos;autre côté ?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-light-grey/60 max-w-sm">
            Les faits ne changent pas. Leur signification, oui.
          </p>
          {/* Corps augmenté au debrief V1 : cette phrase portait le même petit
              corps que les mentions secondaires. */}
          <p className="mt-6 max-w-md text-lg sm:text-xl text-light-grey/70 leading-relaxed">
            Changer de perspective ne change pas le monde. Cela change ce que
            nous y voyons.
          </p>

          {/* Indicateur d'interaction (référence maquette) — desktop seulement :
              sur mobile il n'y a plus de globe à déplacer. */}
          <div className="hidden md:flex mt-10 items-center gap-4">
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

      {/* Mobile uniquement : les légendes seules, sans globe (debrief V1). */}
      <div className="md:hidden flex flex-col items-center gap-4 text-center">
        {FLOW_CALLOUTS.map((text) => (
          <p
            key={text}
            className="text-base tracking-widest2 uppercase text-terracota leading-snug"
          >
            {text}
          </p>
        ))}
        <p className="mt-2 text-base tracking-widest2 uppercase text-terracota leading-snug max-w-xs">
          Entre les deux, des flux que l&apos;on questionne rarement.
        </p>
      </div>
    </SectionWrapper>
  );
}
