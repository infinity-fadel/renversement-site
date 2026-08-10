import SectionWrapper from "@/components/ui/SectionWrapper";
import Countdown from "@/components/ui/Countdown";

/**
 * Section 08 — Le renversement approche (§6.9)
 * Texte principal et secondaire repris littéralement du cahier des charges
 * (à ne pas paraphraser). Intègre le compte à rebours (120h, heure
 * d'Abidjan — voir config/site.config.ts et hooks/useCountdown.ts).
 */
export default function Section08Urgency() {
  return (
    <SectionWrapper id="urgency" className="text-center relative overflow-hidden">
      {/* Arcs concentriques décoratifs derrière le titre (référence maquette) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[36rem] pointer-events-none overflow-hidden"
      >
        <svg
          viewBox="0 0 1200 500"
          preserveAspectRatio="xMidYMin slice"
          className="w-full h-full"
        >
          <circle cx="600" cy="480" r="360" fill="none" stroke="#EFEFE8" strokeOpacity="0.07" strokeWidth="1" />
          <circle cx="600" cy="480" r="460" fill="none" stroke="#EFEFE8" strokeOpacity="0.045" strokeWidth="1" />
        </svg>
      </div>

      <div aria-hidden="true" className="flex flex-col items-center mb-3">
        <span className="font-display text-sm text-terracota">08</span>
        <span className="w-6 h-px bg-terracota/60 mt-2" />
      </div>

      <h2 className="font-display text-[clamp(1.75rem,4.5vw,3rem)] uppercase leading-tight">
        <span className="text-light-grey">Le renversement</span>
        <br />
        <span className="text-terracota">approche.</span>
      </h2>

      <p className="mt-4 text-sm sm:text-base text-light-grey/70 max-w-sm">
        La question est posée.
        <br />
        La réponse apparaîtra au moment juste.
      </p>

      <div className="mt-14">
        <Countdown />
      </div>

      <a
        href="#circle"
        className="mt-14 inline-block text-xs tracking-widest2 uppercase border border-terracota text-terracota px-8 py-4 hover:bg-terracota hover:text-black transition-colors"
      >
        Soyez parmi les premiers informés
      </a>

      <p className="mt-5 flex items-center justify-center gap-2 text-[11px] tracking-widest2 uppercase text-light-grey/40 max-w-sm text-center">
        <LockIcon />
        <span>
          Vos données restent confidentielles. Aucun partage. Aucun bruit
          inutile.
        </span>
      </p>

    </SectionWrapper>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="shrink-0"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}
