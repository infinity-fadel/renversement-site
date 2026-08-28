"use client";

import { useEffect, useRef } from "react";
import { SECTIONS } from "@/config/sections.config";

/**
 * Lumière de lecture — transitions de chapitre (§7.1).
 *
 * Un radial or très sourd, posé derrière le contenu, dont l'intensité et le
 * rayon suivent le chapitre en cours. Son intensité creuse au milieu de chaque
 * passage d'un chapitre à l'autre : la respiration entre deux chapitres se
 * sent avant de se voir, sans qu'aucun élément dessiné n'entre en scène.
 *
 * Le cahier des charges demande que « les transitions entre sections
 * conservent la continuité visuelle » et que « le scroll ne soit pas verrouillé
 * sur de longues séquences » — donc pas de section épinglée, et un effet qui
 * traverse la page au lieu de se rejouer à chaque frontière.
 *
 * Ce composant accompagnait un fil d'horizon doré qui se déformait de chapitre
 * en chapitre ; le fil a été retiré à la demande du client (4e debrief). La
 * lumière lui survit parce qu'elle ne dessine rien : elle ne peut pas
 * concurrencer une image de fond ni couper un texte, ce qui était le reproche
 * fait au fil.
 *
 * Derrière le contenu (`-z-10`) et jamais devant : c'est une atmosphère, elle
 * n'a rien à dire par-dessus le texte. Purement `opacity` et dimensions, donc
 * aucun repaint de glyphe.
 */

/** Opacité et rayon (en fraction de la largeur de viewport) par chapitre. */
const FRAMES: Record<string, { op: number; r: number }> = {
  hero: { op: 0.25, r: 0.5 },
  direction: { op: 0.3, r: 0.55 },
  observe: { op: 0.22, r: 0.7 },
  clues: { op: 0.3, r: 0.6 },
  shift: { op: 0.42, r: 0.5 },
  flip: { op: 0.3, r: 0.5 },
  urgency: { op: 0.28, r: 0.45 },
  circle: { op: 0.36, r: 0.42 },
  final: { op: 0.5, r: 0.75 },
  footer: { op: 0, r: 0.4 },
};

/** Ordre du parcours, filtré sur les sections qui ont une ancre dans le DOM. */
const ORDER = SECTIONS.map((s) => s.id).filter((id) => id in FRAMES);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * La lumière se tient tranquille pendant qu'on lit un chapitre et ne change
 * qu'au passage à l'autre. Sans ça elle varie en permanence et ne marque plus
 * aucune frontière.
 */
function plateau(t: number) {
  const e = Math.min(1, Math.max(0, (t - 0.28) / 0.44));
  return e * e * (3 - 2 * e);
}

export default function ReadingLight() {
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // §7.1 : « possibilité de lecture sans animation ». La lumière reste alors
    // sur la valeur de repos rendue en HTML.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      const light = lightRef.current;
      if (light) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Progression continue à travers les chapitres. On se repère sur le
        // centre de chaque section et non sur son bord haut, pour que les
        // sections de hauteurs différentes (03 et 10 sont `compact`) pèsent
        // pareil dans le parcours.
        const centers = ORDER.map((id) => {
          const el = document.getElementById(id);
          return el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : NaN;
        });
        const anchor = vh / 2;
        let i = 0;
        let frac = 0;
        if (anchor >= centers[centers.length - 1]) {
          i = centers.length - 1;
        } else if (anchor > centers[0]) {
          for (let j = 0; j < centers.length - 1; j++) {
            if (anchor >= centers[j] && anchor <= centers[j + 1]) {
              i = j;
              const span = centers[j + 1] - centers[j];
              frac = span > 0 ? (anchor - centers[j]) / span : 0;
              break;
            }
          }
        }

        const a = FRAMES[ORDER[i]];
        const b = FRAMES[ORDER[Math.min(i + 1, ORDER.length - 1)]];
        const t = plateau(frac);

        // Le creux au milieu de la transition (`frac` proche de 0,5).
        const dip = 1 - 0.45 * Math.sin(Math.PI * frac);
        const r = lerp(a.r, b.r, t) * vw;
        light.style.opacity = (lerp(a.op, b.op, t) * dip).toFixed(3);
        light.style.width = `${(r * 2).toFixed(0)}px`;
        light.style.height = `${(r * 2).toFixed(0)}px`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        ref={lightRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          opacity: 0.25,
          background:
            "radial-gradient(circle, rgba(180,116,42,0.15) 0%, rgba(180,116,42,0.05) 42%, transparent 72%)",
          willChange: "opacity",
        }}
      />
    </div>
  );
}
