"use client";

import { useState, type ReactNode } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * Section 07 — Retournez la carte (§6.8)
 *
 * Deux cartes indépendamment retournables en 3D (§6.8 : « flip 3D à 180° au
 * clic… le contenu masqué ne doit pas rester lisible par le lecteur d'écran »).
 *
 * Répartition des textes fixée au debrief V1 : chaque carte porte une
 * affirmation au recto et son commentaire au verso — auparavant les deux
 * étaient empilés sur la même face, et le retournement ne révélait rien de
 * neuf. Les quatre textes sont donc désormais distincts, deux par carte.
 */
const CARDS: Array<{
  front: { lead: string; highlight: string };
  back: { lead: string; highlight?: string; note?: string };
  Watermark: () => React.JSX.Element;
}> = [
  {
    front: {
      lead: "L'Afrique est un continent",
      highlight: "à financer.",
    },
    back: {
      lead: "Une idée répétée depuis",
      highlight: "des décennies.",
    },
    Watermark: AfricaWatermark,
  },
  {
    front: {
      lead: "Une certitude n'est pas toujours une",
      highlight: "vérité.",
    },
    back: {
      lead: "C'est parfois une manière de regarder que personne ne",
      highlight: "questionne plus.",
    },
    Watermark: ArcWatermark,
  },
];

export default function Section07FlipCard() {
  // Force le remontage des cartes pour les réinitialiser toutes d'un coup.
  const [resetCount, setResetCount] = useState(0);

  return (
    <SectionWrapper id="flip" className="text-center relative overflow-hidden">
      <div aria-hidden="true" className="flex flex-col items-center mb-3">
        <span className="font-display text-sm text-terracota">07</span>
        <span className="w-6 h-px bg-terracota/60 mt-2" />
      </div>

      <h2 className="font-display text-2xl sm:text-3xl uppercase text-light-grey">
        Retournez la <span className="text-terracota">carte.</span>
      </h2>
      <p className="mt-3 text-sm text-light-grey/60 max-w-md">
        Ce que vous croyez évident mérite peut-être d&apos;être réexaminé.
      </p>
      <span aria-hidden="true" className="w-10 h-px bg-terracota/40 mt-6 mb-10" />

      {/* Les deux cartes : côte à côte dès `md`, empilées en dessous. */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-6 lg:gap-10">
        <FlippableCard key={`a-${resetCount}`} card={CARDS[0]} />

        <span
          aria-hidden="true"
          className="shrink-0 w-14 h-14 rounded-full border border-dashed border-terracota/50 flex items-center justify-center"
        >
          <DoubleArrowIcon />
        </span>

        <FlippableCard key={`b-${resetCount}`} card={CARDS[1]} />
      </div>

      <div className="mt-14 flex flex-col sm:flex-row gap-8 sm:gap-14">
        <LegendItem
          icon={<HandIcon />}
          title="Cliquez pour retourner"
          description="Retournez la carte pour voir l'autre face."
        />
        <LegendItem
          icon={<EyeIcon />}
          title="Voir l'autre face"
          description="Explorez les deux perspectives."
        />
        <LegendItem
          icon={<RefreshIcon />}
          title="Recommencer"
          description="Revenir à la première face."
          onClick={() => setResetCount((c) => c + 1)}
        />
      </div>

      <a
        href="#urgency"
        className="mt-10 inline-block text-xs tracking-widest2 uppercase text-terracota underline underline-offset-4"
      >
        Continuer l&apos;expérience
      </a>
    </SectionWrapper>
  );
}

function FlippableCard({ card }: { card: (typeof CARDS)[number] }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-72 h-80 lg:w-80 lg:h-96 shrink-0"
      style={{ perspective: "1400px" }}
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 -left-2 w-5 h-5 border-t border-l border-terracota/60"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-2 -right-2 w-5 h-5 border-b border-r border-terracota/60"
      />

      <button
        type="button"
        onClick={() => setIsFlipped((v) => !v)}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? "Verso affiché — cliquer pour revenir au recto"
            : "Cliquer pour retourner la carte"
        }
        className="relative w-full h-full text-left rounded-sm"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <CardFace variant="front" hidden={isFlipped} rotated={false}>
          <card.Watermark />
          <p className="font-display text-lg sm:text-xl uppercase text-light-grey leading-snug">
            {card.front.lead}{" "}
            <span className="text-terracota">{card.front.highlight}</span>
          </p>
        </CardFace>

        <CardFace variant="back" hidden={!isFlipped} rotated>
          <card.Watermark />
          <p className="font-display text-lg sm:text-xl uppercase text-light-grey leading-snug">
            {card.back.lead}{" "}
            <span className="text-terracota">{card.back.highlight}</span>
          </p>
        </CardFace>
      </button>

      <span
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 -bottom-4 w-3/4 h-px"
        style={{
          background: "linear-gradient(to right, transparent, #F2C94C, transparent)",
          boxShadow: "0 0 12px 1px rgba(242,201,76,0.6)",
        }}
      />
    </div>
  );
}

function CardFace({
  variant,
  hidden,
  rotated,
  children,
}: {
  variant: "front" | "back";
  hidden: boolean;
  rotated: boolean;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden={hidden}
      className={`absolute inset-0 flex flex-col items-center justify-center gap-4 border px-8 overflow-hidden rounded-sm ${
        variant === "front"
          ? "border-terracota/50 bg-black/60"
          : "border-terracota bg-black"
      }`}
      style={{
        backfaceVisibility: "hidden",
        transform: rotated ? "rotateY(180deg)" : undefined,
        boxShadow:
          variant === "front"
            ? "0 0 30px -8px rgba(242,201,76,0.35)"
            : "0 0 30px -6px rgba(242,201,76,0.5)",
      }}
    >
      {children}
      <span aria-hidden="true" className="mt-4 font-display text-xl text-terracota">
        R
      </span>
    </div>
  );
}

function LegendItem({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="shrink-0 w-9 h-9 rounded-full border border-terracota/50 flex items-center justify-center"
      >
        {icon}
      </span>
      <span>
        <span className="block text-[11px] tracking-widest2 uppercase text-light-grey">
          {title}
        </span>
        <span className="block text-xs text-light-grey/50 mt-1">
          {description}
        </span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
      >
        {content}
      </button>
    );
  }

  return <div className="flex items-start gap-3 text-left">{content}</div>;
}

function DoubleArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F2C94C" strokeWidth="1.5">
      <path
        d="M3 12h18M3 12l5-5M3 12l5 5M21 12l-5-5M21 12l-5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2C94C" strokeWidth="1.5">
      <path
        d="M9 12V5a1.5 1.5 0 0 1 3 0v6M12 5.5a1.5 1.5 0 0 1 3 0V11M15 6.5a1.5 1.5 0 0 1 3 0V12"
        strokeLinecap="round"
      />
      <path
        d="M9 12l-1.5-1.2a1.4 1.4 0 0 0-2 2L8 15.5C9 18 11 20 14 20h1a5 5 0 0 0 5-5v-3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2C94C" strokeWidth="1.5">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2C94C" strokeWidth="1.5">
      <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 15a8 8 0 0 0 13.9 3M18.5 9A8 8 0 0 0 4.6 6" strokeLinecap="round" />
    </svg>
  );
}

function AfricaWatermark() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full opacity-[0.07]"
      viewBox="0 0 200 240"
      fill="none"
      stroke="#EFEFE8"
      strokeWidth="1"
    >
      <path
        d="M95 30 C 115 25, 135 33, 140 55 C 150 68, 158 75, 155 92
           C 165 112, 152 132, 140 145 C 133 165, 120 178, 108 165
           C 96 178, 84 165, 82 145 C 70 132, 65 112, 73 92
           C 62 75, 65 55, 95 30 Z"
      />
    </svg>
  );
}

function ArcWatermark() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-x-0 top-8 w-full h-32 opacity-20"
      viewBox="0 0 200 100"
      fill="none"
      stroke="#EFEFE8"
      strokeWidth="0.5"
    >
      <path d="M20 90 A 80 80 0 0 1 180 90" />
      <circle cx="100" cy="20" r="1.5" fill="#F2C94C" stroke="none" />
    </svg>
  );
}
