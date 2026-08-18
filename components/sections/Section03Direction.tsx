"use client";

import { useEffect, useRef, useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Rotation par paliers de 20° (0, 20, 40 … 180), comme demandé au debrief V1 :
// la rotation continue en scrub était perçue comme « brute », le passage de 0 à
// 180° paraissant automatique plutôt que piloté. Le cran donne un mouvement
// lisible, où l'on sent que c'est le scroll qui commande.
const STEP_DEGREES = 20;
const STEP_COUNT = 180 / STEP_DEGREES;

/**
 * Section 03 — Une seule direction (§6.4)
 *
 * Rotation 0° → 180° pilotée par le scroll (GSAP ScrollTrigger), avec le bouton
 * comme alternative pleinement fonctionnelle au clavier et au tactile (§6.4 :
 * « prévoir un bouton alternatif pour clavier et mobile »). GSAP possède seul la
 * transformation CSS de l'élément (via ref DOM directe) pour éviter tout conflit
 * avec le rendu déclaratif de React pendant le scrub.
 *
 * La plage de déclenchement couvre désormais toute la traversée de la section
 * dans le viewport (`top bottom` → `bottom top`) et non plus le seul segment
 * centre-à-centre, qui était trop court pour qu'on perçoive la progression.
 */
export default function Section03Direction() {
  const [rotated, setRotated] = useState(false);
  const circleRef = useRef<HTMLButtonElement>(null);
  const currentStep = useRef(0);

  useEffect(() => {
    const section = document.getElementById("direction");
    const circle = circleRef.current;
    if (!section || !circle) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return; // le bouton (clic/clavier) reste l'unique interaction
    }

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const step = Math.round(self.progress * STEP_COUNT);
        if (step === currentStep.current) return;
        currentStep.current = step;

        gsap.to(circle, {
          rotation: step * STEP_DEGREES,
          duration: 0.35,
          ease: "power2.out",
        });
        setRotated(step * STEP_DEGREES >= 90);
      },
    });

    return () => trigger.kill();
  }, []);

  const toggle = () => {
    const next = !rotated;
    setRotated(next);
    currentStep.current = next ? STEP_COUNT : 0;

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
      {/* Mise en avant demandée au debrief V1 : cette phrase portait le même
          corps que le texte courant et passait inaperçue. */}
      <p className="font-display text-[clamp(1.5rem,3.6vw,2.75rem)] uppercase leading-tight text-light-grey max-w-3xl mb-12">
        On nous a appris à regarder dans une seule direction.
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

      {/* Déplacée sous le cadran (debrief V1 : elle était au-dessus). */}
      <p className="mt-10 text-base sm:text-lg text-light-grey/60 max-w-lg">
        À force d&apos;être répétée, une perspective devient une certitude.
      </p>

      {/*
        La phrase de départ s'affiche renversée (debrief V1) : c'est la lecture
        « à l'envers » que la section met en cause. Une fois le cadran passé au
        delà de 90°, elle se redresse et cède la place à la question qui suit.
        Le contenu du DOM reste lisible en toutes circonstances pour les
        lecteurs d'écran, seule la présentation est retournée.
      */}
      <p
        aria-live="polite"
        className={`mt-12 max-w-lg font-display text-lg sm:text-xl uppercase text-light-grey min-h-[3rem] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          rotated ? "rotate-0" : "rotate-180"
        }`}
      >
        {rotated
          ? "Et si le récit avait été écrit dans le mauvais sens ?"
          : "Une certitude devient un récit. Un récit peut devenir une prison."}
      </p>
    </SectionWrapper>
  );
}
