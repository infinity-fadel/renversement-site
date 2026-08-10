"use client";

import { useEffect, useRef } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useInView } from "@/hooks/useInView";
import { gsap } from "@/lib/gsap";

/**
 * Section 05 — Les indices (§6.6)
 * Les chiffres sont externalisés dans un tableau (pas codés en dur dans le
 * JSX) pour pouvoir être modifiés "sans intervention lourde dans le code",
 * comme demandé explicitement dans le cahier des charges. `Illustration`
 * pointe vers un petit motif décoratif propre à chaque carte (référence
 * maquette), purement ornemental (aria-hidden).
 */
const CLUES: Array<{
  value: string;
  percent: number;
  label: string;
  Illustration: () => React.JSX.Element;
}> = [
  {
    value: "30 %",
    percent: 30,
    label: "des réserves minérales mondiales.",
    Illustration: CrystalsIllustration,
  },
  {
    value: "65 %",
    percent: 65,
    label: "des terres arables non cultivées de la planète.",
    Illustration: DunesIllustration,
  },
  {
    value: "40 %",
    percent: 40,
    label: "du potentiel hydroélectrique mondial.",
    Illustration: FlowIllustration,
  },
  {
    value: "2 %",
    percent: 2,
    label: "du PIB mondial.",
    Illustration: GlobeDotsIllustration,
  },
];

const RING_SIZE = 116;
const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Section05Clues() {
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.3,
  });
  const gridRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    // État final (anneaux à leur valeur cible) déjà rendu par défaut ;
    // seule l'entrée séquentielle est pilotée par GSAP.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const circles = gridRef.current?.querySelectorAll<SVGCircleElement>(
      "[data-progress]"
    );
    const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-clue]");

    if (cards?.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      });
    }

    circles?.forEach((circle, i) => {
      const target = Number(circle.dataset.progress);
      const offset = RING_CIRCUMFERENCE * (1 - target / 100);
      gsap.fromTo(
        circle,
        { strokeDashoffset: RING_CIRCUMFERENCE },
        {
          strokeDashoffset: offset,
          duration: 1,
          delay: i * 0.15,
          ease: "power2.out",
        }
      );
    });
  }, [isInView]);

  return (
    <SectionWrapper id="clues" className="text-center relative overflow-hidden">
      <div ref={viewRef} className="contents">
        {/* Arc décoratif + repère au-dessus du titre (référence maquette) */}
        <div className="relative flex flex-col items-center mb-4">
          <span
            aria-hidden="true"
            className="w-px h-8 bg-[repeating-linear-gradient(to_bottom,#F2C94C_0,#F2C94C_2px,transparent_2px,transparent_6px)]"
          />
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full border border-terracota mt-0.5"
          />
          <svg
            aria-hidden="true"
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[42rem] max-w-[85vw] h-24 -z-10"
            viewBox="0 0 700 120"
            fill="none"
          >
            <path
              d="M10 118 A 340 340 0 0 1 690 118"
              stroke="#F2C94C"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
          </svg>
          <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest2 text-light-grey mt-5">
            Les indices
          </h2>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-5xl"
        >
          {CLUES.map((clue) => {
            const targetOffset = RING_CIRCUMFERENCE * (1 - clue.percent / 100);
            return (
              <div
                key={clue.label}
                data-clue
                className="relative flex flex-col items-center gap-5 border border-light-grey/10 px-4 sm:px-6 pt-10 pb-14 overflow-hidden"
              >
                <div
                  className="relative"
                  style={{ width: RING_SIZE, height: RING_SIZE }}
                >
                  <svg
                    width={RING_SIZE}
                    height={RING_SIZE}
                    viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                    className="absolute inset-0 -rotate-90"
                    aria-hidden="true"
                  >
                    {/* piste en pointillés (référence maquette) */}
                    <circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="#F2C94C"
                      strokeOpacity="0.3"
                      strokeWidth="1"
                      strokeDasharray="1 5"
                      strokeLinecap="round"
                    />
                    <circle
                      data-progress={clue.percent}
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="#F2C94C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={targetOffset}
                      style={{
                        filter: "drop-shadow(0 0 5px rgba(242,201,76,0.85))",
                      }}
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center font-display text-xl sm:text-2xl text-terracota tabular-nums"
                    style={{ textShadow: "0 0 16px rgba(242,201,76,0.6)" }}
                  >
                    {clue.value}
                  </span>
                </div>

                <p className="text-[13px] sm:text-sm text-light-grey/70 leading-snug max-w-[13rem]">
                  {clue.label}
                </p>

                <clue.Illustration />
              </div>
            );
          })}
        </div>

        {/* Trait pointillé de liaison vers la conclusion */}
        <span
          aria-hidden="true"
          className="w-px h-8 mt-6 bg-[repeating-linear-gradient(to_bottom,#F2C94C_0,#F2C94C_2px,transparent_2px,transparent_6px)]"
        />
        <span
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-terracota mt-0.5"
        />

        <p className="mt-6 max-w-2xl text-light-grey">
          Ce n&apos;est peut-être pas un problème de richesses.
          <br />
          <span className="font-display text-xl sm:text-2xl uppercase text-terracota">
            C&apos;est peut-être un problème de clés.
          </span>
        </p>

        {/* Indice de scroll (référence maquette) */}
        <div className="mt-14 flex items-center gap-3 text-light-grey/50">
          <svg
            aria-hidden="true"
            width="16"
            height="24"
            viewBox="0 0 16 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <rect x="1" y="1" width="14" height="22" rx="7" />
            <line x1="8" y1="6" x2="8" y2="11" strokeLinecap="round" />
          </svg>
          <span className="text-[11px] tracking-widest2 uppercase">
            Faites défiler les données
          </span>
        </div>
      </div>
    </SectionWrapper>
  );
}

function CrystalsIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-16 opacity-25"
      viewBox="0 0 160 64"
      fill="none"
      stroke="#EFEFE8"
      strokeWidth="1"
    >
      <path d="M30 64 L20 34 L38 18 L56 34 L48 64" />
      <path d="M70 64 L62 24 L84 8 L106 24 L98 64" />
      <path d="M120 64 L112 40 L130 26 L146 40 L140 64" />
    </svg>
  );
}

function DunesIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 opacity-25"
      viewBox="0 0 176 64"
      fill="none"
      stroke="#EFEFE8"
      strokeWidth="1"
    >
      <path d="M0 40 Q 22 20 44 40 T 88 40 T 132 40 T 176 40" />
      <path d="M0 52 Q 22 34 44 52 T 88 52 T 132 52 T 176 52" opacity="0.6" />
    </svg>
  );
}

function FlowIllustration() {
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-16 opacity-25"
      viewBox="0 0 176 64"
      fill="none"
      stroke="#EFEFE8"
      strokeWidth="1"
    >
      <path d="M0 20 Q 44 4 88 24 T 176 22" />
      <path d="M0 40 Q 44 56 88 36 T 176 38" opacity="0.7" />
      <path d="M0 58 Q 44 46 88 58 T 176 56" opacity="0.4" />
    </svg>
  );
}

function GlobeDotsIllustration() {
  const dots = Array.from({ length: 46 }, (_, i) => {
    const angle = (i / 46) * Math.PI * 2;
    const wobble = (i % 3) * 2;
    const r = 26 + wobble;
    // Arrondi à 3 décimales : Math.cos/Math.sin peuvent renvoyer un dernier
    // bit différent entre le moteur JS du serveur (Node/V8) et celui du
    // navigateur (ex. Safari/JavaScriptCore) pour le même angle — un écart
    // invisible à l'œil, mais qui suffit à déclencher une erreur
    // d'hydratation React sur ces valeurs codées en dur dans le HTML.
    return {
      cx: Math.round((32 + Math.cos(angle) * r) * 1000) / 1000,
      cy: Math.round((32 + Math.sin(angle) * r * 0.55) * 1000) / 1000,
    };
  });
  return (
    <svg
      aria-hidden="true"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 opacity-25"
      viewBox="0 0 64 64"
      fill="#EFEFE8"
    >
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r="0.9" />
      ))}
    </svg>
  );
}
