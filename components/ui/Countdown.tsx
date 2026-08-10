"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { COUNTDOWN_CONFIG } from "@/config/site.config";

const SECONDARY_UNITS: Array<{
  key: "hours" | "minutes" | "seconds";
  label: string;
}> = [
  { key: "hours", label: "Heures" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Secondes" },
];

const RING_SIZE = 380;
const RING_RADIUS = 168;
const TICK_RADIUS = 184;
const TICK_COUNT = 60;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TOTAL_DURATION_MS = COUNTDOWN_CONFIG.durationHours * 60 * 60 * 1000;

/**
 * Cadran radial pour le compte à rebours (§6.9 — référence maquette).
 * L'anneau se vide au fil du temps écoulé depuis le début de la fenêtre de
 * 120h (COUNTDOWN_CONFIG.durationHours) jusqu'à la date cible — une lecture
 * visuelle directe de "combien il reste", pas juste un décor statique.
 * Les graduations et les coordonnées géographiques latérales sont un
 * décor purement esthétique (registre "instrument de navigation"), pas des
 * données réelles.
 */
export default function Countdown({
  onExpire,
}: {
  onExpire?: () => void;
}) {
  const timeLeft = useCountdown(COUNTDOWN_CONFIG.targetDate);

  if (timeLeft.isExpired) {
    onExpire?.();
  }

  const elapsedFraction = Math.min(
    1,
    Math.max(0, 1 - timeLeft.totalMs / TOTAL_DURATION_MS)
  );
  const dashOffset = RING_CIRCUMFERENCE * elapsedFraction;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={`Temps restant avant la révélation : ${timeLeft.days} jours, ${timeLeft.hours} heures, ${timeLeft.minutes} minutes`}
      className="relative mx-auto"
      style={{ width: RING_SIZE, height: RING_SIZE }}
    >
      {/* Coordonnées décoratives (référence maquette) */}
      <div
        aria-hidden="true"
        className="hidden sm:flex flex-col items-end gap-1 absolute right-full top-1/2 -translate-y-1/2 mr-6 text-[10px] tracking-widest2 text-light-grey/40"
      >
        <span>05° 17&apos;</span>
        <span>NORD</span>
      </div>
      <div
        aria-hidden="true"
        className="hidden sm:flex flex-col items-start gap-1 absolute left-full top-1/2 -translate-y-1/2 ml-6 text-[10px] tracking-widest2 text-light-grey/40"
      >
        <span>15° 53&apos;</span>
        <span>EST</span>
      </div>

      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const angle = (i / TICK_COUNT) * 2 * Math.PI;
          const isMajor = i % 5 === 0;
          const innerR = TICK_RADIUS - (isMajor ? 9 : 4);
          const cx = RING_SIZE / 2;
          const cy = RING_SIZE / 2;
          // Arrondi à 3 décimales : Math.cos/Math.sin peuvent renvoyer un
          // dernier bit différent entre le moteur JS du serveur (Node/V8)
          // et celui du navigateur (ex. Safari/JavaScriptCore) pour le même
          // angle — invisible à l'œil, mais suffisant pour déclencher une
          // erreur d'hydratation React sur ces coordonnées codées en dur.
          const round = (n: number) => Math.round(n * 1000) / 1000;
          return (
            <line
              key={i}
              x1={round(cx + Math.cos(angle) * innerR)}
              y1={round(cy + Math.sin(angle) * innerR)}
              x2={round(cx + Math.cos(angle) * TICK_RADIUS)}
              y2={round(cy + Math.sin(angle) * TICK_RADIUS)}
              stroke="#F2C94C"
              strokeOpacity={isMajor ? 0.5 : 0.22}
              strokeWidth={isMajor ? 1 : 0.6}
            />
          );
        })}

        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#EFEFE8"
          strokeOpacity="0.12"
          strokeWidth="1.5"
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#F2C94C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1s linear",
            filter: "drop-shadow(0 0 4px rgba(242,201,76,0.7))",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-10">
        <span className="text-[11px] tracking-widest2 uppercase text-terracota">
          Compte à rebours
        </span>

        <span
          className="tabular-nums text-[clamp(2.75rem,7vw,4.25rem)] leading-none font-semibold text-terracota"
          style={{
            fontFamily: "var(--font-apollo, serif)",
            textShadow: "0 0 24px rgba(242,201,76,0.65)",
          }}
        >
          {timeLeft.days}
        </span>
        <span className="-mt-1 text-xs tracking-[0.2em] uppercase text-light-grey/70">
          Jours
        </span>

        <span aria-hidden="true" className="w-14 h-px bg-terracota/30 mt-1" />

        <div className="flex items-center gap-3 sm:gap-4">
          {SECONDARY_UNITS.map(({ key, label }, i) => (
            <div key={key} className="flex items-center gap-3 sm:gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="tabular-nums text-base sm:text-lg leading-none font-semibold text-light-grey"
                  style={{ fontFamily: "var(--font-apollo, serif)" }}
                >
                  {String(timeLeft[key]).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[0.55rem] tracking-[0.12em] uppercase text-light-grey/50 whitespace-nowrap">
                  {label}
                </span>
              </div>
              {i < SECONDARY_UNITS.length - 1 && (
                <span aria-hidden="true" className="w-px h-5 bg-light-grey/15" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
