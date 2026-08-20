"use client";

import { useEffect } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useInView } from "@/hooks/useInView";
import { gsap } from "@/lib/gsap";

/**
 * Section 05 — Les indices (§6.6)
 *
 * Les chiffres sont externalisés dans un tableau (pas codés en dur dans le
 * JSX) pour pouvoir être modifiés « sans intervention lourde dans le code »,
 * comme demandé explicitement dans le cahier des charges. `Illustration`
 * pointe vers un petit motif décoratif propre à chaque carte (référence
 * maquette), purement ornemental (aria-hidden).
 *
 * Depuis le debrief V1, chaque carte se retourne au survol pour révéler une
 * photographie au dos (§ « intégration d'image »). Le retournement est en CSS
 * pur, comme celui de la section 07 : c'est un état d'interaction, pas une
 * animation d'entrée.
 */
const CLUES: Array<{
  value: string;
  percent: number;
  label: string;
  image: string;
  imageAlt: string;
  Illustration: () => React.JSX.Element;
}> = [
  {
    value: "30 %",
    percent: 30,
    label: "des réserves minérales mondiales.",
    image: "/images/indice-minerais.webp",
    imageAlt: "Mine à ciel ouvert au crépuscule",
    Illustration: CrystalsIllustration,
  },
  {
    value: "65 %",
    percent: 65,
    label: "des terres arables non cultivées de la planète.",
    image: "/images/indice-terres.webp",
    imageAlt: "Terres cultivées s'étendant jusqu'aux montagnes",
    Illustration: DunesIllustration,
  },
  {
    value: "40 %",
    percent: 40,
    label: "du potentiel hydroélectrique mondial.",
    image: "/images/indice-hydro.webp",
    imageAlt: "Barrage hydroélectrique en fonctionnement de nuit",
    Illustration: FlowIllustration,
  },
  {
    value: "2 %",
    percent: 2,
    label: "du PIB mondial.",
    image: "/images/indice-pib.webp",
    imageAlt:
      "Femme observant une carte du monde lumineuse où seule l'Afrique brille, au-dessus d'un quartier précaire",
    Illustration: GlobeDotsIllustration,
  },
];

const RING_SIZE = 116;
const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function Section05Clues() {
  // L'observateur cible désormais la grille elle-même. Il était auparavant
  // posé sur un conteneur `className="contents"` : un élément en
  // `display: contents` ne génère aucune boîte, son rectangle est donc vide et
  // l'IntersectionObserver ne pouvait pas atteindre le seuil demandé — d'où
  // des animations qui ne se déclenchaient jamais (signalé au debrief V1
  // comme « révélation séquentielle non respectée »).
  const { ref: gridRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.25,
  });

  useEffect(() => {
    if (!isInView) return;

    // État final (anneaux à leur valeur cible) déjà rendu par défaut ;
    // seule l'entrée séquentielle est pilotée par GSAP.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = gridRef.current;
    if (!root) return;

    const cards = root.querySelectorAll<HTMLElement>("[data-clue]");
    const circles = root.querySelectorAll<SVGCircleElement>("[data-progress]");

    if (cards.length) {
      gsap.from(cards, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.18,
        ease: "power2.out",
      });
    }

    // Le tracé part de l'anneau vide et rejoint la valeur cible : c'est cette
    // montée lumineuse que le debrief demande de rendre perceptible (« pour
    // les 30 %, on doit voir la progression du début jusqu'à 30 % »). Durée
    // allongée et décalage par carte pour que la lecture soit possible.
    circles.forEach((circle, i) => {
      const target = Number(circle.dataset.progress);
      const offset = RING_CIRCUMFERENCE * (1 - target / 100);
      gsap.fromTo(
        circle,
        { strokeDashoffset: RING_CIRCUMFERENCE },
        {
          strokeDashoffset: offset,
          duration: 1.6,
          delay: 0.2 + i * 0.18,
          ease: "power1.inOut",
        }
      );
    });
  }, [isInView, gridRef]);

  return (
    <SectionWrapper id="clues" className="text-center relative overflow-hidden">
      {/* Arc décoratif + repère au-dessus du titre (référence maquette) */}
      <div className="relative flex flex-col items-center mb-4">
        <span
          aria-hidden="true"
          className="w-px h-8 bg-[repeating-linear-gradient(to_bottom,#B4742A_0,#B4742A_2px,transparent_2px,transparent_6px)]"
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
            stroke="#B4742A"
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full"
      >
        {CLUES.map((clue) => {
          const targetOffset = RING_CIRCUMFERENCE * (1 - clue.percent / 100);
          return (
            <div
              key={clue.label}
              data-clue
              tabIndex={0}
              aria-label={`${clue.value} ${clue.label} — survoler pour voir l'illustration`}
              className="group relative h-80 [perspective:1400px] rounded-sm"
            >
              <div className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]">
                {/* Face avant — le chiffre et son anneau */}
                <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center gap-5 border border-light-grey/10 px-4 sm:px-6 overflow-hidden">
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
                        stroke="#B4742A"
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
                        stroke="#B4742A"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={targetOffset}
                        style={{
                          filter: "drop-shadow(0 0 5px rgba(180,116,42,0.85))",
                        }}
                      />
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center font-display text-xl sm:text-2xl text-terracota tabular-nums"
                      style={{ textShadow: "0 0 16px rgba(180,116,42,0.6)" }}
                    >
                      {clue.value}
                    </span>
                  </div>

                  <p className="text-[13px] sm:text-sm text-light-grey/70 leading-snug max-w-[13rem]">
                    {clue.label}
                  </p>

                  <clue.Illustration />
                </div>

                {/* Face arrière — la photographie */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] border border-terracota/60 overflow-hidden">
                  <Image
                    src={clue.image}
                    alt={clue.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                  {/* Voile sombre : garantit le contraste du chiffre repris
                      par-dessus la photo. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                    <span className="block font-display text-3xl text-terracota tabular-nums">
                      {clue.value}
                    </span>
                    <span className="mt-1 block text-[13px] text-light-grey/80 leading-snug">
                      {clue.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trait pointillé de liaison vers la conclusion */}
      <span
        aria-hidden="true"
        className="w-px h-8 mt-6 bg-[repeating-linear-gradient(to_bottom,#B4742A_0,#B4742A_2px,transparent_2px,transparent_6px)]"
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
