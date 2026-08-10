"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Révélation au scroll basée sur IntersectionObserver — aucune dépendance,
 * coût quasi nul. Sert de socle pour la V1.
 *
 * Note d'évolution : le cahier des charges (§7.2) recommande GSAP +
 * ScrollTrigger pour les animations de transformation avancées (rotation
 * 180°, flip de carte, slider avant/après). Ce hook gère le "fade/slide in"
 * générique commun à toutes les sections ; les interactions spécifiques
 * (section 03, 06, 07) seront branchées avec GSAP par-dessus, section par
 * section, sans remplacer ce socle.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.25 }
) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Si l'utilisateur préfère moins d'animation, on considère le contenu visible d'emblée
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // révélation une seule fois, cf. §7.1 "état initial / état final"
      }
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, isInView };
}
