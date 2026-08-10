"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/config/sections.config";

/**
 * Détermine la section actuellement la plus visible à l'écran, pour :
 *  - mettre à jour l'état actif du menu (§4.3)
 *  - piloter l'indicateur latéral de progression numéroté 00 à 11 (§4.3)
 */
export function useActiveSection() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choisit l'entrée la plus visible parmi celles qui intersectent
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveId(visible.target.id);
        }
      },
      { threshold: [0.3, 0.5, 0.7] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return activeId;
}
