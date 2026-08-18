"use client";

import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useInView } from "@/hooks/useInView";
import { SITE_CONFIG } from "@/config/site.config";
import { gsap } from "@/lib/gsap";

/**
 * Section 10 — Phrase finale (§6.11)
 *
 * Aucun nouveau CTA principal, pour ne pas diluer la conversion de la
 * section 09.
 *
 * Le debrief V1 signale que les deux animations prévues au cahier des charges
 * manquaient : « apparition lente du texte après la section d'inscription » et
 * « effet de lumière, de révélation ou de disparition extrêmement subtil ». Les
 * deux sont ici jouées en une seule timeline — le halo monte d'abord, très
 * lentement, puis le texte se révèle par-dessus. Volontairement lent (plus de
 * 3 s au total) : c'est la dernière respiration du parcours, pas une entrée de
 * section ordinaire.
 */
export default function Section10Final() {
  const { ref: rootRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.4,
  });
  const glowRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // L'état final est déjà le rendu HTML par défaut.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = rootRef.current;
    if (!root) return;

    const lines = root.querySelectorAll<HTMLElement>("[data-final-line]");
    const tl = gsap.timeline({ defaults: { ease: "power1.inOut" } });

    if (glowRef.current) {
      tl.fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 2.4 },
        0
      );
    }
    if (lines.length) {
      tl.fromTo(
        lines,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.6, stagger: 0.5 },
        0.4
      );
    }

    return () => {
      tl.kill();
    };
  }, [isInView, rootRef]);

  return (
    <SectionWrapper id="final" className="text-center relative overflow-hidden">
      <div ref={rootRef} className="relative flex flex-col items-center w-full">
        {/* Halo de révélation — décoratif, il porte l'« effet de lumière
            extrêmement subtil ». */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] max-w-[120vw] h-[42rem] max-h-[80vh] -z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(242,201,76,0.16) 0%, rgba(242,201,76,0.05) 38%, transparent 70%)",
          }}
        />

        <p
          data-final-line
          className="font-display text-[clamp(2rem,5.5vw,4rem)] uppercase leading-tight text-light-grey max-w-4xl"
        >
          Bientôt, une autre lecture émergera.
        </p>
        <p
          data-final-line
          className="mt-8 text-base sm:text-lg text-light-grey/60 max-w-lg"
        >
          Ce que vous croyez évident mérite peut-être d&apos;être renversé.
        </p>
        <p
          data-final-line
          className="mt-12 font-display text-xs tracking-widest2 uppercase text-terracota"
        >
          {SITE_CONFIG.name}
        </p>
      </div>
    </SectionWrapper>
  );
}
