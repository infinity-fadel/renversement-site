"use client";

import { useEffect } from "react";
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
 * Convertit une cote de la maquette (cadran de référence : 380 px) en une
 * valeur CSS qui suit exactement l'échelle réelle du cadran.
 *
 * Le conteneur vaut `min(380px, 38vh)`, donc son facteur d'échelle est
 * `min(1, 38vh/380px)` — soit 0,1 vh par pixel de maquette. Toute cote interne
 * s'écrit donc `min(N px, N/10 vh)`.
 *
 * Sans ça, le cadran rétrécissait avec la HAUTEUR du viewport pendant que les
 * textes restaient en px fixes (ou en `vw`, donc pilotés par la LARGEUR) : sur
 * les écrans larges et bas, « HEURES » et « SECONDES » débordaient de l'anneau
 * de 13 à 27 px. Les deux doivent varier sur le même paramètre.
 */
const scaled = (px: number) => `min(${px}px, ${px / 10}vh)`;

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

  // `onExpire` est un effet de bord : l'appeler pendant le rendu déclenchait
  // un setState en cours de rendu chez tout parent qui fournirait la prop.
  useEffect(() => {
    if (timeLeft?.isExpired) onExpire?.();
  }, [timeLeft?.isExpired, onExpire]);

  // `timeLeft` est nul tant que le composant n'est pas monté (voir
  // useCountdown : le HTML statique ne peut pas contenir l'heure réelle).
  // On rend alors le même gabarit avec des tirets — mêmes dimensions, donc
  // aucun saut de mise en page à l'hydratation.
  const isPending = timeLeft === null;
  const format = (value: number | undefined, pad = false) =>
    isPending || value === undefined
      ? "––"
      : pad
        ? String(value).padStart(2, "0")
        : String(value);

  const elapsedFraction = isPending
    ? 0
    : Math.min(1, Math.max(0, 1 - timeLeft.totalMs / TOTAL_DURATION_MS));
  const dashOffset = RING_CIRCUMFERENCE * elapsedFraction;

  return (
    <div
      role="timer"
      aria-live="polite"
      aria-label={
        isPending
          ? "Calcul du temps restant avant la révélation"
          : `Temps restant avant la révélation : ${timeLeft.days} jours, ${timeLeft.hours} heures, ${timeLeft.minutes} minutes`
      }
      className="relative mx-auto"
      // Le cadran ne peut plus dépasser 38 % de la hauteur du viewport. À
      // 380 px fixes, la section 08 (titre + texte + cadran + CTA + mention)
      // débordait de l'écran sur les portables bas : le cadran descendait dans
      // la bande où GlobeBackground fait dépasser l'arc terrestre, et « 44
      // JOURS » se retrouvait posé sur la Terre. RING_SIZE reste la taille de
      // référence du dessin SVG, seul l'affichage est mis à l'échelle.
      style={{
        width: `min(${RING_SIZE}px, 38vh)`,
        height: `min(${RING_SIZE}px, 38vh)`,
      }}
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

      {/* Éclat du cadran, en trois couches : un bloom qui déborde largement,
          un halo interne qui remplit le disque, et les rehauts portés par le
          SVG lui-même (arc et graduations, plus bas). Purement décoratif et
          hors flux, donc sans effet sur la mise en page. */}
      <div
        aria-hidden="true"
        className="absolute -inset-[18%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(242,201,76,0.16) 0%, rgba(242,201,76,0.06) 42%, transparent 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(242,201,76,0.15) 0%, rgba(242,201,76,0.05) 52%, transparent 78%)",
        }}
      />

      <svg
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="absolute inset-0 w-full h-full -rotate-90"
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
              strokeOpacity={isMajor ? 0.85 : 0.4}
              strokeWidth={isMajor ? 1.2 : 0.7}
              style={{ filter: "drop-shadow(0 0 2px rgba(242,201,76,0.8))" }}
            />
          );
        })}

        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#EFEFE8"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="#F2C94C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1s linear",
            filter:
              "drop-shadow(0 0 5px rgba(242,201,76,0.95)) drop-shadow(0 0 14px rgba(242,201,76,0.55)) drop-shadow(0 0 30px rgba(242,201,76,0.3))",
          }}
        />
      </svg>

      {/* Toutes les cotes de ce bloc passent par `scaled()` : le contenu doit
          rétrécir exactement comme l'anneau, sinon il en sort. */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          gap: scaled(8),
          paddingLeft: scaled(34),
          paddingRight: scaled(34),
        }}
      >
        <span
          className="tracking-widest2 uppercase text-terracota whitespace-nowrap"
          style={{ fontSize: scaled(11) }}
        >
          Compte à rebours
        </span>

        <span
          className="tabular-nums leading-none font-semibold text-terracota"
          style={{
            fontFamily: "var(--font-apollo, serif)",
            fontSize: scaled(68),
            textShadow:
              "0 0 18px rgba(242,201,76,0.8), 0 0 42px rgba(242,201,76,0.45)",
          }}
        >
          {format(timeLeft?.days)}
        </span>
        <span
          className="uppercase text-light-grey/70 whitespace-nowrap"
          style={{
            fontSize: scaled(12),
            letterSpacing: "0.2em",
            marginTop: `calc(-1 * ${scaled(4)})`,
          }}
        >
          Jours
        </span>

        <span
          aria-hidden="true"
          className="h-px bg-terracota/30"
          style={{ width: scaled(56), marginTop: scaled(4) }}
        />

        <div className="flex items-center" style={{ gap: scaled(14) }}>
          {SECONDARY_UNITS.map(({ key, label }, i) => (
            <div
              key={key}
              className="flex items-center"
              style={{ gap: scaled(14) }}
            >
              <div className="flex flex-col items-center">
                <span
                  className="tabular-nums leading-none font-semibold text-light-grey"
                  style={{
                    fontFamily: "var(--font-apollo, serif)",
                    fontSize: scaled(18),
                  }}
                >
                  {format(timeLeft?.[key], true)}
                </span>
                <span
                  className="uppercase text-light-grey/50 whitespace-nowrap"
                  style={{
                    fontSize: scaled(9),
                    letterSpacing: "0.1em",
                    marginTop: scaled(4),
                  }}
                >
                  {label}
                </span>
              </div>
              {i < SECONDARY_UNITS.length - 1 && (
                <span
                  aria-hidden="true"
                  className="w-px bg-light-grey/15"
                  style={{ height: scaled(20) }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
