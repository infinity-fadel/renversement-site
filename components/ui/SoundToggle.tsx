"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TRACK_URL = "/audio/ambient.mp3";
const STORAGE_KEY = "renversement:sound";
// Volume cible : c'est un fond sonore, il doit rester sous la voix intérieure
// du lecteur, pas la couvrir.
const TARGET_VOLUME = 0.32;
const FADE_IN_MS = 1800;
const FADE_OUT_MS = 700;

// Événements susceptibles de conférer une « activation utilisateur ». Tous ne
// qualifient pas (le défilement et la molette, notamment, ne l'accordent pas
// dans Chrome) — on les écoute quand même : la tentative est sans coût et
// certains navigateurs sont plus permissifs. La première qui aboutit gagne.
const GESTURES = [
  "pointerdown",
  "pointerup",
  "click",
  "keydown",
  "touchend",
  "wheel",
  "scroll",
] as const;

/**
 * Fond sonore du site (debrief V1 : « plonger les utilisateurs dans l'esprit du
 * renversement »). Démarrage automatique demandé explicitement par le client.
 *
 * Ce qu'aucun code ne peut changer : un navigateur refuse toute lecture non
 * sollicitée tant que le visiteur n'a pas interagi avec la page. La stratégie
 * est donc en deux temps :
 *
 *  1. On tente la lecture dès le montage. Elle passe pour les visiteurs que le
 *     navigateur juge « engagés » avec le domaine (Media Engagement Index de
 *     Chrome, autorisation explicite dans Safari…).
 *  2. Sinon, on démarre au tout premier geste du visiteur.
 *
 * NB : l'astuce classique du démarrage muet suivi d'un démasquage ne s'applique
 * PAS ici. La règle « muted autoplay toujours autorisé » de Chrome ne vaut que
 * pour `<video>` ; un `<audio muted>` est refusé exactement comme un audio
 * normal (vérifié : NotAllowedError, avec `preload` à `none` comme à `auto`).
 * Inutile donc de faire tourner la piste en silence en attendant.
 *
 * Limite à connaître : le défilement ne constitue pas une interaction au sens
 * des navigateurs. Un visiteur qui se contenterait de scroller à la molette ou
 * au trackpad, sans jamais cliquer ni taper au clavier, n'entendrait rien — le
 * bouton reste là pour lui.
 *
 * Le seul cas où l'on ne tente rien : le visiteur a explicitement coupé le son
 * lors d'une visite précédente. Son choix prime sur le démarrage automatique.
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | undefined>(undefined);
  const unlockedRef = useRef(false);
  const startedRef = useRef(false);
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
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        el.volume = Math.max(0, Math.min(1, from + (target - from) * p));
        if (p < 1) fadeRef.current = requestAnimationFrame(step);
        else onDone?.();
      };
      fadeRef.current = requestAnimationFrame(step);
    },
    []
  );

  const detachRef = useRef<(() => void) | undefined>(undefined);

  /**
   * Lance la lecture. Renvoie `false` si le navigateur la refuse.
   *
   * Le contrôle après coup n'est pas superflu : Chrome peut résoudre le
   * `play()` puis remettre l'élément en pause quelques millisecondes plus tard
   * si l'activation n'était pas valable. Sans cette vérification on croirait le
   * son lancé alors qu'il ne l'est pas.
   */
  const start = useCallback(async () => {
    const el = audioRef.current;
    if (!el || unlockedRef.current) return false;

    el.muted = false;
    el.volume = 0;
    try {
      await el.play();
    } catch {
      return false;
    }
    await new Promise((r) => setTimeout(r, 80));
    if (el.paused) return false;

    unlockedRef.current = true;
    setIsOn(true);
    fadeTo(TARGET_VOLUME, FADE_IN_MS);
    localStorage.setItem(STORAGE_KEY, "on");
    detachRef.current?.();
    return true;
  }, [fadeTo]);

  // Démarrage automatique.
  useEffect(() => {
    setIsReady(true);
    const el = audioRef.current;
    if (!el) return;
    // `reactStrictMode` monte les effets deux fois en développement : sans ce
    // garde-fou, deux séquences de `play()` se disputaient le même élément et
    // aucune n'aboutissait.
    if (startedRef.current) return;
    startedRef.current = true;
    if (localStorage.getItem(STORAGE_KEY) === "off") return;

    // 1. Tentative immédiate. N'aboutit que pour les visiteurs que le
    //    navigateur juge déjà engagés avec le domaine.
    void start();

    // 2. Sinon, au tout premier geste du visiteur.
    const onGesture = () => void start();
    GESTURES.forEach((e) =>
      window.addEventListener(e, onGesture, { capture: true, passive: true })
    );
    detachRef.current = () =>
      GESTURES.forEach((e) => window.removeEventListener(e, onGesture, true));

    return () => detachRef.current?.();
  }, [start]);

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
    const el = audioRef.current;
    if (!el) return;

    if (isOn) {
      setIsOn(false);
      unlockedRef.current = false;
      fadeTo(0, FADE_OUT_MS, () => el.pause());
      localStorage.setItem(STORAGE_KEY, "off");
      return;
    }

    // Ici on est dans un gestionnaire de clic : l'activation est acquise, le
    // démasquage ne peut pas être refusé.
    setIsOn(true);
    unlockedRef.current = false;
    if (!(await start())) {
      setIsOn(false);
      localStorage.setItem(STORAGE_KEY, "off");
    }
  };

  return (
    <>
      {/* `preload="none"` : c'est l'appel à `play()` qui déclenche le
          téléchargement, en flux. Rien n'est chargé si le visiteur a coupé le
          son lors d'une visite précédente. */}
      <audio ref={audioRef} src={TRACK_URL} loop preload="none" />

      {isReady && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isOn}
          aria-label={isOn ? "Couper le fond sonore" : "Activer le fond sonore"}
          title={isOn ? "Couper le son" : "Activer le son"}
          className="shrink-0 w-9 h-9 rounded-full border border-terracota/60 flex items-center justify-center gap-[2px] hover:border-terracota hover:bg-terracota/10 transition-colors"
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
    <span aria-hidden="true" className="flex items-end gap-[2px] h-3">
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
      width="16"
      height="16"
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
