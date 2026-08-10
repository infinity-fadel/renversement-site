"use client";

import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useInView } from "@/hooks/useInView";
import { gsap } from "@/lib/gsap";

const TITLE = "Le monde regarde l'Afrique comme un continent à financer.";

/**
 * Section 02 — Hero (§6.3)
 * Choc initial + retournement de la seconde phrase.
 * Le titre se révèle mot par mot via un masque (overflow-hidden + translation),
 * et la phrase "Et si la réalité..." apparaît inversée à 180° puis se
 * stabilise — piloté par GSAP au premier passage en vue de la section.
 */
export default function Section02Hero() {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.4,
  });
  const titleRef = useRef<HTMLHeadingElement>(null);
  const invertedRef = useRef<HTMLParagraphElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // État final déjà rendu par défaut (SSR / reduced motion) : on ne fait
    // que jouer l'entrée, jamais de contenu qui dépendrait du JS pour être lisible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = titleRef.current?.querySelectorAll<HTMLElement>("[data-word]");
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (words?.length) {
      tl.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.9, stagger: 0.04 }
      );
    }

    if (invertedRef.current) {
      tl.fromTo(
        invertedRef.current,
        { rotation: 180, opacity: 0 },
        { rotation: 0, opacity: 1, duration: 1.1, ease: "power2.inOut" },
        words?.length ? "-=0.3" : 0
      );
    }
  }, [isInView]);

  return (
    <SectionWrapper id="hero" className="text-center relative overflow-hidden">
      <div ref={viewRef} className="contents">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(242,201,76,0.12), transparent 60%)",
          }}
        />

        <h1
          ref={titleRef}
          className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-tight max-w-4xl uppercase text-light-grey"
        >
          {TITLE.split(" ").map((word, i, words) => (
            <span key={i} className="inline-block overflow-hidden align-top">
              <span data-word className="inline-block">
                {word}
                {i < words.length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </h1>

        {/*
          Comportement attendu (§6.3) : cette phrase apparaît inversée à 180°
          puis se stabilise en lecture normale. L'état stable/final reste le
          rendu HTML par défaut ; seule l'entrée (rotation 180° -> 0°) est
          appliquée par GSAP, jamais le contenu lui-même.
        */}
        <p
          ref={invertedRef}
          className="font-display text-[clamp(1.5rem,4.2vw,3rem)] leading-tight max-w-3xl mt-6 uppercase text-terracota"
        >
          Et si la réalité était exactement l&apos;inverse ?
        </p>

        <p className="mt-8 text-sm sm:text-base text-light-grey/60 max-w-md">
          Une question s&apos;apprête à changer le sens de la lecture.
        </p>

        <a
          href="#direction"
          className="mt-12 inline-block text-xs tracking-widest2 uppercase border border-terracota text-terracota px-8 py-4 hover:bg-terracota hover:text-black transition-colors"
        >
          Entrer dans le renversement
        </a>
      </div>
    </SectionWrapper>
  );
}
