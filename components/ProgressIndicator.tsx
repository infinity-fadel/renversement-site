"use client";

import { SECTIONS } from "@/config/sections.config";
import { useActiveSection } from "@/hooks/useActiveSection";

/**
 * Indicateur latéral de progression 00 → 11 (§4.3).
 * Masqué sur mobile pour ne pas surcharger l'écran (§8.2).
 * Placé à gauche avec le libellé de la section active affiché à côté du
 * numéro (référence maquette) — les entrées inactives restent compactes
 * (numéro + trait de liaison), le libellé n'occupant de l'espace que pour
 * l'entrée active afin de ne pas déséquilibrer le rythme vertical.
 */
export default function ProgressIndicator() {
  const activeId = useActiveSection();
  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);

  return (
    <div
      aria-hidden="true" // décoratif : la navigation réelle passe par Nav.tsx / le clavier
      className="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center"
    >
      {SECTIONS.map((section, i) => {
        const isActive = i === activeIndex;
        return (
          <div key={section.id} className="relative flex flex-col items-center py-1.5">
            {/*
              Le numéro du chapitre entrant arrive par un demi-tour (§7.1 :
              l'animation sert le récit — ici elle *est* le récit, le site
              s'appelle RENVERSEMENT). Deux faces sur un conteneur en
              `preserve-3d` : la face avant porte le numéro éteint, la face
              arrière le même numéro en or, déjà retourné pour se lire à
              l'endroit une fois le conteneur basculé. Le retournement n'est
              donc pas un ornement posé sur le changement d'état — c'est le
              changement d'état lui-même.

              Une simple `rotate-180` conditionnelle ne marcherait pas : elle
              laisserait les dix numéros inactifs affichés à l'envers.

              Taille fixe et faces en `absolute` : le passage de 10 à 14 px
              ferait autrement sauter le rythme vertical de la colonne pendant
              la rotation.
            */}
            <span
              className="relative block w-6 h-5 transition-transform duration-700 ease-flip will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transform: isActive ? "rotateX(180deg)" : "rotateX(0deg)",
              }}
            >
              <span
                className="absolute inset-0 grid place-items-center font-display tabular-nums text-[10px] text-light-grey/30"
                style={{ backfaceVisibility: "hidden" }}
              >
                {section.number}
              </span>
              <span
                className="absolute inset-0 grid place-items-center font-display tabular-nums text-sm text-terracota"
                style={{ backfaceVisibility: "hidden", transform: "rotateX(180deg)" }}
              >
                {section.number}
              </span>
            </span>
            {i < SECTIONS.length - 1 && (
              <span
                className={`w-px h-4 mt-1 transition-colors duration-500 ${
                  isActive ? "bg-terracota/50" : "bg-light-grey/15"
                }`}
              />
            )}
            {/* Le libellé n'apparaît qu'à partir de `2xl`. En dessous, il
                débordait sur la colonne de texte des sections (signalé au
                debrief V1 : « OBSERVER DEPUIS L'AUTRE CÔTÉ » chevauchait le
                titre de la section 04). Le libellé le plus long atteint ~275 px
                depuis le bord ; à partir de `2xl`, SectionWrapper réserve
                `px-80` (320 px) — les deux réglages vont ensemble, ne pas en
                changer un seul sans recalculer l'autre. */}
            {isActive && (
              <span className="hidden 2xl:block absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] tracking-widest2 uppercase text-terracota">
                {section.progressLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
