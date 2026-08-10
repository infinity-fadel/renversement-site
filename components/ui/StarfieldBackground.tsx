"use client";

import { useEffect, useRef } from "react";

/**
 * Fond étoilé en parallaxe, posé derrière tout le site (référence maquette :
 * ciel étoilé + halo derrière le nav). Plusieurs couches de points défilent
 * à des vitesses différentes au scroll (les plus petites/lointaines bougent
 * moins vite que les plus grosses/proches), pour donner de la profondeur.
 *
 * Chaque couche est un bandeau de 200vh contenant deux tuiles identiques de
 * 100vh empilées ; on la translate en boucle (modulo la hauteur de
 * viewport) plutôt que de dimensionner le fond sur la hauteur réelle de la
 * page — ça reste correct quel que soit le nombre de sections, sans avoir
 * à mesurer le document.
 */
const LAYERS = [
  { count: 70, size: 1, opacity: 0.35, speed: 0.06 },
  { count: 40, size: 1.5, opacity: 0.55, speed: 0.14 },
  { count: 18, size: 2, opacity: 0.8, speed: 0.26 },
];

export default function StarfieldBackground() {
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      LAYERS.forEach((layer, i) => {
        const el = trackRefs.current[i];
        if (!el) return;
        const offset = (y * layer.speed) % vh;
        el.style.transform = `translateY(${-offset}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
    >
      {LAYERS.map((layer, i) => (
        <div
          key={i}
          ref={(el) => {
            trackRefs.current[i] = el;
          }}
          className="absolute inset-x-0 top-0"
          style={{ height: "200vh", willChange: "transform" }}
        >
          <StarTile layer={layer} tileIndex={0} />
          <StarTile layer={layer} tileIndex={1} />
        </div>
      ))}
    </div>
  );
}

function StarTile({
  layer,
  tileIndex,
}: {
  layer: { count: number; size: number; opacity: number };
  tileIndex: number;
}) {
  // Positions déterministes (pas de Math.random) pour un rendu identique
  // entre le serveur et le client — aucune donnée aléatoire ne doit varier
  // d'un rendu à l'autre.
  const stars = Array.from({ length: layer.count }, (_, i) => {
    const seed = (i + 1) * 47.3 + tileIndex * 911;
    return {
      x: (seed * 13.37) % 100,
      y: (seed * 7.91) % 100,
    };
  });

  return (
    <div
      className="absolute inset-x-0"
      style={{ top: `${tileIndex * 100}vh`, height: "100vh" }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-light-grey"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: layer.size,
            height: layer.size,
            opacity: layer.opacity,
          }}
        />
      ))}
    </div>
  );
}
