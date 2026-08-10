"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Globe SVG léger — remplace Three.js/WebGL (§16.1 laissait le choix, on retient
 * ici l'option "canvas/SVG légère" pour minimiser le poids et le CPU/GPU,
 * notamment sur mobile bas/moyen de gamme.
 *
 * Principe : une bande de silhouettes de continents (forme stylisée, pas un
 * tracé géographique réel) est placée dans un cercle en clip-path. On la fait
 * défiler horizontalement pour simuler une rotation. L'Afrique est le point
 * de départ visible au chargement (§6.5 : "Afrique visible au chargement
 * initial").
 *
 * Interactions :
 *  - Rotation automatique lente au repos.
 *  - Interruption dès que l'utilisateur glisse au pointeur ou au toucher.
 *  - Respect de prefers-reduced-motion : pas d'auto-rotation, l'Afrique reste
 *    statique et centrée.
 *  - Aucune dépendance externe, aucun calcul par frame coûteux (une seule
 *    transform CSS, pas de re-render React par frame).
 */

const STRIP_WIDTH = 1600; // largeur totale de la bande de silhouettes (2x pour boucle continue)
const VIEW_SIZE = 400;

export default function GlobeSVG() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, offsetAtStart: 0 });
  const offset = useRef(0); // position actuelle de la bande, en px
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const applyOffset = useCallback((value: number) => {
    const track = trackRef.current;
    if (!track) return;
    // boucle continue : ramène la valeur dans [0, STRIP_WIDTH)
    const looped = ((value % STRIP_WIDTH) + STRIP_WIDTH) % STRIP_WIDTH;
    offset.current = looped;
    track.style.transform = `translateX(${-looped}px)`;
  }, []);

  // Rotation automatique lente (désactivée si reduced motion ou pendant un drag)
  useEffect(() => {
    if (prefersReducedMotion || isDragging) return;
    let raf: number;
    let last = performance.now();
    const SPEED_PX_PER_MS = 0.012; // lent et lisible

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      applyOffset(offset.current + delta * SPEED_PX_PER_MS);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isDragging, prefersReducedMotion, applyOffset]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragState.current = { startX: e.clientX, offsetAtStart: offset.current };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragState.current.startX;
    applyOffset(dragState.current.offsetAtStart - delta);
  };

  const handlePointerUp = () => setIsDragging(false);

  return (
    <div
      className="relative mx-auto select-none touch-none"
      style={{ width: VIEW_SIZE, height: VIEW_SIZE, maxWidth: "80vw", maxHeight: "80vw" }}
      role="img"
      aria-label="Globe stylisé représentant l'Afrique, déplaçable au pointeur ou au toucher"
    >
      {/* Halo doré discret, cf. charte */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(242,201,76,0.18), rgba(28,21,17,0) 70%)",
        }}
        aria-hidden="true"
      />

      {/* Cercle du globe, masque circulaire */}
      <div
        className="absolute inset-[6%] rounded-full overflow-hidden border border-[#F2C94C]/40 cursor-grab active:cursor-grabbing"
        style={{ background: "#000000" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {prefersReducedMotion ? (
          // Version statique : uniquement l'Afrique, centrée, aucune animation
          <StaticAfrica />
        ) : (
          <div
            ref={trackRef}
            className="absolute top-0 left-0 h-full flex"
            style={{ width: STRIP_WIDTH * 2 }}
          >
            <ContinentStrip />
            <ContinentStrip />
          </div>
        )}

        {/* Lignes de flux — apparition progressive via CSS, pas de calcul JS par frame */}
        <FlowLines />

        {/* Ombre interne pour donner un effet de volume sans 3D réelle */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.6)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** Une occurrence de la bande de silhouettes de continents (Afrique mise en avant). */
function ContinentStrip() {
  return (
    <svg
      viewBox={`0 0 ${STRIP_WIDTH} ${VIEW_SIZE}`}
      width={STRIP_WIDTH}
      height={VIEW_SIZE}
      fill="none"
      aria-hidden="true"
    >
      {/* Afrique — silhouette stylisée, mise en valeur en terracotta, centrée au repos */}
      <path
        d="M760 90 C 800 80, 840 95, 850 130 C 865 150, 880 160, 875 190
           C 890 220, 870 250, 850 270 C 840 300, 820 320, 800 300
           C 780 320, 760 300, 758 270 C 740 250, 735 220, 745 190
           C 730 160, 735 130, 760 90 Z"
        fill="#F2C94C"
        opacity="0.9"
      />
      {/* Silhouettes voisines, plus discrètes — juste pour donner une impression de mappemonde continue */}
      <ellipse cx="350" cy="140" rx="90" ry="60" fill="#EFEFE8" opacity="0.12" />
      <ellipse cx="1150" cy="160" rx="110" ry="70" fill="#EFEFE8" opacity="0.12" />
      <ellipse cx="1400" cy="260" rx="70" ry="45" fill="#EFEFE8" opacity="0.1" />
      <ellipse cx="560" cy="300" rx="60" ry="35" fill="#EFEFE8" opacity="0.1" />
    </svg>
  );
}

function StaticAfrica() {
  return (
    <svg viewBox="0 0 400 400" width="100%" height="100%" fill="none" aria-hidden="true">
      <path
        d="M195 70 C 225 62, 255 74, 262 100 C 274 116, 286 124, 282 148
           C 294 172, 278 196, 262 212 C 254 236, 238 252, 222 236
           C 206 252, 190 236, 188 212 C 174 196, 170 172, 178 148
           C 166 124, 170 100, 195 70 Z"
        fill="#F2C94C"
      />
    </svg>
  );
}

/** Lignes/points de flux qui apparaissent en fondu, purement décoratif et léger (CSS only). */
function FlowLines() {
  return (
    <svg
      viewBox="0 0 400 400"
      width="100%"
      height="100%"
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      <g stroke="#EFEFE8" strokeOpacity="0.25" strokeWidth="1" fill="none">
        <path d="M60 200 Q 200 120 340 200" className="animate-[flowfade_4s_ease-in-out_infinite]" />
        <path d="M80 260 Q 200 320 320 260" className="animate-[flowfade_4s_ease-in-out_infinite_0.7s]" />
      </g>
      <circle cx="200" cy="180" r="2.5" fill="#F2C94C" className="animate-[flowfade_4s_ease-in-out_infinite_0.3s]" />
      <circle cx="230" cy="220" r="2" fill="#F2C94C" className="animate-[flowfade_4s_ease-in-out_infinite_1.1s]" />
    </svg>
  );
}
