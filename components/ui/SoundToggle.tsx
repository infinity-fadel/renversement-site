"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRACK_URL = "/audio/ambient.mp3";
const STORAGE_KEY = "renversement:sound";
// Volume cible : c'est un fond sonore, il doit rester sous la voix intérieure
// du lecteur, pas la couvrir.
const TARGET_VOLUME = 0.32;
const FADE_IN_MS = 1800;
const FADE_OUT_MS = 700;

/**
 * Fond sonore du site (§ debrief V1 : « plonger les utilisateurs dans l'esprit
 * du renversement »).
 *
 * Coupé par défaut, et c'est délibéré à double titre :
 *  - les navigateurs bloquent la lecture audio automatique tant que
 *    l'utilisateur n'a pas interagi avec la page ; un autoplay ne marcherait
 *    tout simplement pas ;
 *  - le critère WCAG 1.4.2 impose un moyen d'arrêter tout son de plus de trois
 *    secondes qui démarre seul.
 *
 * Le choix est mémorisé : au retour sur le site, on retente la lecture, et si
 * le navigateur la refuse on retombe silencieusement sur l'état coupé plutôt
 * que d'afficher un bouton qui mentirait sur l'état réel.
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | undefined>(undefined);
  const [isOn, setIsOn] = useState(false);
  // Le bouton n'apparaît qu'après le montage : son état dépend de
  // localStorage, qui n'existe pas au rendu statique.
  const [isReady, setIsReady] = useState(false);

  const fadeTo = useCallback(
    (target: number, ms: number, onDone?: () => void) => {
      const el = audioRef.current;
      if (!el) return;
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);

      const from = el.volume;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / ms);
        el.volume = Math.max(0, Math.min(1, from + (target - from) * p));
        if (p < 1) fadeRef.current = requestAnimationFrame(step);
        else onDone?.();
      };
      fadeRef.current = requestAnimationFrame(step);
    },
    []
  );

  /**
   * `optimistic` bascule le bouton avant que `play()` n'ait résolu.
   *
   * La promesse ne se résout qu'une fois la lecture réellement lancée, donc
   * après la mise en tampon : sur une connexion lente, attendre la laisserait
   * afficher « éteint » pendant une seconde ou deux après le clic, comme si le
   * bouton ne répondait pas. On bascule donc tout de suite et on revient en
   * arrière si le navigateur refuse.
   *
   * Au contraire, à la restauration du choix mémorisé (sans geste utilisateur),
   * le refus est le cas *attendu* : pas d'optimisme, sinon l'égaliseur
   * s'afficherait une fraction de seconde avant de disparaître.
   */
  const enable = useCallback(
    async (optimistic = true) => {
      const el = audioRef.current;
      if (!el) return false;
      el.volume = 0;
      if (optimistic) setIsOn(true);
      try {
        await el.play();
      } catch {
        // Lecture refusée (politique d'autoplay) : on reste coupé.
        if (optimistic) setIsOn(false);
        return false;
      }
      setIsOn(true);
      fadeTo(TARGET_VOLUME, FADE_IN_MS);
      return true;
    },
    [fadeTo]
  );

  const disable = useCallback(() => {
    setIsOn(false);
    fadeTo(0, FADE_OUT_MS, () => audioRef.current?.pause());
  }, [fadeTo]);

  // Restauration du choix précédent.
  useEffect(() => {
    setIsReady(true);
    if (localStorage.getItem(STORAGE_KEY) !== "on") return;
    void enable(false);
  }, [enable]);

  // Onglet en arrière-plan : on suspend, sans changer le choix de
  // l'utilisateur — la musique reprend au retour.
  useEffect(() => {
    const onVisibility = () => {
      const el = audioRef.current;
      if (!el || !isOn) return;
      if (document.hidden) el.pause();
      else void el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isOn]);

  useEffect(
    () => () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    },
    []
  );

  const toggle = async () => {
    if (isOn) {
      disable();
      localStorage.setItem(STORAGE_KEY, "off");
    } else {
      const ok = await enable();
      localStorage.setItem(STORAGE_KEY, ok ? "on" : "off");
    }
  };

  return (
    <>
      {/* `preload="none"` : rien n'est téléchargé tant que le visiteur n'a pas
          demandé le son — les 2,7 Mo ne pèsent pas sur le chargement initial. */}
      <audio ref={audioRef} src={TRACK_URL} loop preload="none" />

      {isReady && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isOn}
          aria-label={
            isOn ? "Couper le fond sonore" : "Activer le fond sonore"
          }
          title={isOn ? "Couper le son" : "Activer le son"}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border border-terracota/60 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-[3px] hover:border-terracota hover:bg-terracota/10 transition-colors"
        >
          {isOn ? <Equalizer /> : <MutedIcon />}
        </button>
      )}
    </>
  );
}

/** Barres animées — l'état « en lecture » se lit d'un coup d'œil. */
function Equalizer() {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] h-full bg-terracota origin-bottom"
          style={{
            animation: `sound-bar 1.1s ease-in-out ${i * 0.17}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function MutedIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F2C94C"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m17 9 4 6M21 9l-4 6" />
    </svg>
  );
}
