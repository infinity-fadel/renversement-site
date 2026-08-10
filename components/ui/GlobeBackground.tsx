"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const GlobeThree = dynamic(() => import("./GlobeThree"), { ssr: false });

// Taille native fixe du canvas WebGL — l'agrandissement visuel se fait par
// transform CSS (scale), pas en redimensionnant le rendu lui-même.
const BASE_SIZE = 640;

// État "repos" (pendant la section 04), en fraction de la largeur/hauteur
// du viewport — calé sur la position/taille qu'occupait l'ancien globe
// inline de cette section.
const REST_STATE = { xRatio: 0.74, yRatio: 0.48, scale: 1 };

// État "horizon" (sections suivantes) : le rayon du globe est défini en
// multiple de la largeur de viewport, et son centre est repoussé sous le
// bas de l'écran de juste assez pour qu'il ne dépasse plus que sur
// HORIZON_VISIBLE_PX pixels — sans ce calcul, grossir le rayon sans
// repousser le centre d'autant fait déborder le globe sur tout l'écran au
// lieu de ne laisser voir qu'un arc en bas.
//
// HORIZON_RADIUS_MAX_PX plafonne la taille finale composée (rayon × 2 ×
// échelle) : au-delà d'environ 5000px, Chromium ne compose plus du tout le
// canvas WebGL transformé (limite de taille de calque GPU) — le globe
// devient silencieusement invisible, pas juste flou. Un rayon plus modeste
// a aussi l'avantage de rendre la courbure de la planète bien plus lisible
// à l'écran (un trop grand rayon, vu d'assez près, finit par paraître
// plat).
const HORIZON_RADIUS_VW = 0.62;
const HORIZON_RADIUS_MAX_PX = 1400;
const HORIZON_VISIBLE_PX = 190;

// La sphère + sa lueur de bord (effet Fresnel) ne remplissent pas tout le
// canvas 640×640 : il reste une fine marge autour (cf. réglages de
// GlobeThree.tsx). Valeur mesurée directement sur une capture d'écran de
// l'état de repos (pas une estimation par le calcul de champ de vision de
// la caméra, qui ignore la lueur et sous-évaluait ce ratio à 0.76 — d'où
// un globe bien plus gros que prévu à l'état horizon, largement au-delà
// des HORIZON_VISIBLE_PX ciblés).
const GLOBE_FILL_RATIO = 0.9;

// Légendes affichées uniquement pendant la section 04 (§6.5), positionnées
// en pixels autour du centre du globe dans son état "REST_STATE" — elles ne
// suivent pas l'agrandissement (pas de transform: scale partagé), pour
// rester lisibles tant qu'elles sont visibles, et s'effacent avant que le
// globe ne devienne trop grand pour qu'un texte superposé ait du sens.
const CALLOUTS = [
  { text: "Ici, les ressources.", dx: -80, dy: -230, align: "left" as const },
  { text: "Ailleurs, la valeur.", dx: 220, dy: -50, align: "left" as const },
  {
    text: "Entre les deux, des flux que l'on questionne rarement.",
    dx: 110,
    dy: 180,
    align: "left" as const,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Globe Three.js en fond persistant de la page, dont la taille et la
 * position sont pilotées par la progression du scroll à travers la
 * section 04 : il démarre à sa taille/place normale (§6.5, calé sur la
 * maquette), puis grossit et glisse vers le bas au fil du scroll jusqu'à
 * ne plus laisser dépasser que sa courbe supérieure en bas de l'écran,
 * lueur dorée comprise — cet état "horizon" remplace alors les faux
 * horizons plats en SVG qui décoraient jusqu'ici le bas de chaque section
 * suivante (05 → 11), retirés en même temps que ce composant a été ajouté.
 *
 * Réversible : remonter au-dessus de la section 04 fait rétrécir le globe
 * en sens inverse, pas de verrouillage à sens unique.
 *
 * Masqué sur mobile (`hidden md:block`) — Section04Observe.tsx y affiche à
 * la place son propre globe inline, plus simple, dans le flux normal de la
 * section.
 */
export default function GlobeBackground() {
  const globeWrapperRef = useRef<HTMLDivElement>(null);
  const calloutsRef = useRef<HTMLDivElement>(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Sur mobile/tablette ce composant est masqué en CSS ; inutile de faire
    // tourner la boucle de scroll pour rien.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let raf = 0;
    const tick = () => {
      const section = document.getElementById("observe");
      const globeEl = globeWrapperRef.current;
      const calloutsEl = calloutsRef.current;

      if (section && globeEl && calloutsEl) {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const top = section.getBoundingClientRect().top;

        // N'apparaît qu'une fois la section 04 déjà bien entamée à l'écran
        // (pas dès qu'elle pointe en bas de viewport, ce qui la rendait
        // visible depuis la section 03 encore à l'écran).
        const visible = top < vh * 0.35;
        if (visible && !hasBeenVisible) setHasBeenVisible(true);

        // Reste à 0 (taille/position de repos) tant que le haut de la
        // section 04 n'a pas encore atteint le haut du viewport — donc
        // pendant toute la durée où on la voit normalement. Ne commence à
        // grossir qu'une fois qu'on se met à scroller au-delà, jusqu'à un
        // plein viewport de scroll supplémentaire (progress=1) ; au-delà,
        // ça reste bloqué à 1 (stable pour toutes les sections suivantes)
        // tant qu'on ne remonte pas.
        const rawProgress = -top / vh;
        const progress = Math.min(1, Math.max(0, rawProgress));

        const restX = REST_STATE.xRatio * vw;
        const restY = REST_STATE.yRatio * vh;

        const horizonRadius = Math.min(HORIZON_RADIUS_VW * vw, HORIZON_RADIUS_MAX_PX);
        const horizonScale = (horizonRadius * 2) / (BASE_SIZE * GLOBE_FILL_RATIO);
        const horizonX = vw * 0.5;
        const horizonY = vh + horizonRadius - HORIZON_VISIBLE_PX;

        const x = lerp(restX, horizonX, progress);
        const y = lerp(restY, horizonY, progress);
        const scale = lerp(REST_STATE.scale, horizonScale, progress);

        globeEl.style.opacity = visible ? "1" : "0";
        globeEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;

        calloutsEl.style.transform = `translate(${x}px, ${y}px)`;
        calloutsEl.style.opacity = visible
          ? String(Math.max(0, 1 - progress / 0.4))
          : "0";
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBeenVisible]);

  return (
    <div
      aria-hidden="true"
      className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none -z-10"
    >
      <div
        ref={globeWrapperRef}
        className="absolute top-0 left-0 opacity-0"
        style={{ width: BASE_SIZE, height: BASE_SIZE, willChange: "transform, opacity" }}
      >
        {hasBeenVisible && <GlobeThree active size={BASE_SIZE} />}
      </div>

      <div
        ref={calloutsRef}
        className="absolute top-0 left-0 opacity-0"
        style={{ willChange: "transform, opacity" }}
      >
        {CALLOUTS.map((c) => (
          <span
            key={c.text}
            className="absolute text-[11px] tracking-widest2 uppercase text-terracota leading-snug w-40"
            style={{ left: c.dx, top: c.dy }}
          >
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}
