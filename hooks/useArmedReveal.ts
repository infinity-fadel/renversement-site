"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animation d'entrée « armée » — pour les états de départ qui MASQUENT ou
 * DÉFORMENT le contenu (lettres retournées du titre, étiquettes du portrait).
 *
 * Même règle que partout dans le projet (cf. CLAUDE.md, « Animations ») :
 * l'état final est le rendu HTML par défaut. `armed` vaut donc `false` au
 * prérendu comme au premier rendu client — pas d'écart d'hydratation, et un
 * visiteur sans JavaScript voit le contenu lisible.
 *
 * Au montage, l'élément n'est armé (placé dans son état de départ) que s'il
 * est encore SOUS la ligne de flottaison : armer un élément déjà visible le
 * ferait disparaître sous les yeux du visiteur avant de le rejouer. Il se
 * désarme à l'entrée dans le viewport, ce qui déclenche la transition CSS.
 *
 * `prefers-reduced-motion` est testé en JS et court-circuite tout, comme dans
 * les composants GSAP de la V1.
 */
export function useArmedReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.35
) {
  const ref = useRef<T | null>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArmed(false);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, armed };
}
