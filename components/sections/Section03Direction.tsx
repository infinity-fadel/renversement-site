"use client";

import { useEffect, useRef, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Section 03 — Une seule direction (§6.4)
 * Rotation 0° → 180° pilotée par le scroll (GSAP ScrollTrigger, scrub),
 * avec le bouton comme alternative pleinement fonctionnelle au clavier et
 * au tactile (§6.4 : "prévoir un bouton alternatif pour clavier et mobile").
 * GSAP possède seul la transformation CSS de l'élément (via ref DOM directe)
 * pour éviter tout conflit avec le rendu déclaratif de React pendant le scrub.
 */
export default function Section03Direction() {
  const [rotated, setRotated] = useState(false);
  const circleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const section = document.getElementById("direction");
    const circle = circleRef.current;
    if (!section || !circle) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // le bouton (clic/clavier) reste l'unique interaction
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      scrub: 0.6,
      onUpdate: (self) => {
        gsap.set(circle, { rotation: self.progress * 180 });
        setRotated(self.progress > 0.5);
      },
    });

    return () => trigger.kill();
  }, []);

  const toggle = () => {
    const next = !rotated;
    setRotated(next);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    gsap.to(circleRef.current, {
      rotation: next ? 180 : 0,
      duration: prefersReducedMotion ? 0 : 0.8,
      ease: "power2.inOut",
    });
  };

  return (
    <SectionWrapper id="direction" className="text-center">
      <p className="text-xs tracking-widest2 uppercase text-light-grey/50 mb-6">
        On nous a appris à regarder dans une seule direction.
      </p>
      <p className="text-sm text-light-grey/60 max-w-md mb-12">
        À force d&apos;être répétée, une perspective devient une certitude.
      </p>

      <div className="relative inline-block">
        {/* Orbite décorative de points autour du cadran (référence maquette §6.4) */}
        <svg
          aria-hidden="true"
          className="absolute -inset-6 sm:-inset-8 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="#F2C94C"
            strokeOpacity="0.35"
            strokeWidth="1"
            strokeDasharray="0.5 7"
            strokeLinecap="round"
          />
        </svg>

        <button
          ref={circleRef}
          type="button"
          onClick={toggle}
          aria-pressed={rotated}
          aria-label="Faire pivoter l'élément central de 180 degrés"
          className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-terracota/60 flex items-center justify-center"
        >
          <span className="font-display text-3xl text-terracota">180°</span>
        </button>
      </div>

      <p
        aria-live="polite"
        className="mt-12 max-w-lg font-display text-lg sm:text-xl uppercase text-light-grey min-h-[3rem]"
      >
        {rotated
          ? "Et si le récit avait été écrit dans le mauvais sens ?"
          : "Une certitude devient un récit. Un récit peut devenir une prison."}
      </p>
    </SectionWrapper>
  );
}
