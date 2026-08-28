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
 * D'où la forme du bouton, arbitrée avec le client une fois la contrainte
 * comprise : puisque le démarrage automatique ne peut pas être garanti, le
 * contrôle porte un LIBELLÉ VISIBLE à deux états, « Activer le son » /
 * « Arrêter le son ». L'icône seule (un rond barré) ne disait pas au visiteur
 * qu'une bande-son l'attendait — elle se lisait comme un son déjà coupé par le
 * site, pas comme une invitation. Ne pas revenir à l'icône nue : c'est le
 * libellé qui porte désormais la promesse sonore de la page.
 *
 * Le seul cas où l'on ne tente rien : le visiteur a explicitement coupé le son
 * lors d'une visite précédente. Son choix prime sur le démarrage automatique.
 */
export default function SoundToggle() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeRef = useRef<number | undefined>(undefined);
  const unlockedRef = useRef(false);
  const startedRef = useRef(false);
  // Le fond sonore a-t-il été suspendu par une vidéo ? Sert à ne le relancer
  // que s'il jouait vraiment avant : sans ce drapeau, arrêter une vidéo
  // allumerait la musique chez un visiteur qui l'avait coupée.
  const duckedRef = useRef(false);
  // Une tentative de lecture est-elle déjà en vol ? Voir `start()`.
  const startingRef = useRef(false);
  // Le fond sonore a-t-il été suspendu par un passage en arrière-plan ?
  const hiddenRef = useRef(false);
  const [isOn, setIsOn] = useState(false);
  // Suspendu par une vidéo. Distinct de `isOn`, qui reste le CHOIX du visiteur
  // (la musique reviendra) : ici on ne décrit que ce qui sort réellement des
  // haut-parleurs. Sans cette distinction le bouton animait ses barres pendant
  // toute la vidéo alors que la piste était en pause — l'icône bougeait, le
  // son ne suivait pas.
  const [isDucked, setIsDucked] = useState(false);
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
  const start = useCallback(
    async (fromGesture = false) => {
      const el = audioRef.current;
      if (!el || unlockedRef.current) return false;
      // Une salve de `scroll` produit des dizaines d'appels par seconde : sans
      // ce verrou, autant de `play()` concurrents se disputaient l'élément et
      // remettaient chacun le volume à zéro au milieu du fondu du voisin. Un
      // geste explicite passe outre — un clic doit toujours répondre.
      if (startingRef.current && !fromGesture) return false;
      startingRef.current = true;

      try {
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
        // `isOn` n'est délibérément PAS posé ici : c'est l'événement `playing`
        // de l'élément qui l'allumera, une fois le son réellement sorti.
        fadeTo(TARGET_VOLUME, FADE_IN_MS);
        localStorage.setItem(STORAGE_KEY, "on");
        detachRef.current?.();
        return true;
      } finally {
        startingRef.current = false;
      }
    },
    [fadeTo]
  );

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
    const onGesture = (e: Event) =>
      void start(e.type !== "scroll" && e.type !== "wheel");
    GESTURES.forEach((e) =>
      window.addEventListener(e, onGesture, { capture: true, passive: true })
    );
    detachRef.current = () =>
      GESTURES.forEach((e) => window.removeEventListener(e, onGesture, true));

    return () => detachRef.current?.();
  }, [start]);

  /**
   * SOURCE DE VÉRITÉ de l'état du bouton : l'élément audio lui-même.
   *
   * `isOn` était auparavant posé de façon optimiste dans `start()`, après un
   * simple contrôle de `el.paused` 80 ms plus tard. Deux situations le
   * prenaient en défaut, et donnaient exactement le défaut signalé — un bouton
   * qui affiche « en lecture » alors que rien ne sort :
   *
   *  - Chrome peut accepter le `play()` puis remettre l'élément en pause bien
   *    au-delà de ces 80 ms, s'il juge après coup l'activation invalide ;
   *  - la piste fait 2,7 Mo en `preload="none"`. Sur une liaison lente (un
   *    tunnel de revue, un mobile en 3G), `paused` passe à `false` dès le début
   *    de la mise en mémoire tampon, alors qu'aucun son n'est encore produit.
   *
   * D'où l'écoute de `playing` et non de `play` : `play` se déclenche à l'appel
   * de la méthode, `playing` seulement quand le son sort vraiment. Le bouton ne
   * peut donc plus annoncer une musique inaudible.
   */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const sync = () => {
      // Les pauses volontaires — vidéo en cours, onglet en arrière-plan — ne
      // sont pas un arrêt du fond sonore. Le choix du visiteur tient, et c'est
      // `isDucked` qui décrit ce que l'on entend.
      if (duckedRef.current || hiddenRef.current) return;
      setIsOn(!el.paused);
    };

    el.addEventListener("playing", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("ended", sync);
    return () => {
      el.removeEventListener("playing", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("ended", sync);
    };
  }, []);

  /**
   * Vidéos de la page : le fond sonore s'efface pendant la lecture et revient
   * à la pause ou à la fin (4e debrief).
   *
   * On écoute sur `document` en phase de CAPTURE, et non sur un élément précis.
   * Les événements média (`play`, `pause`, `ended`) ne remontent pas — ils ne
   * bouillonnent pas — mais ils traversent bien leurs ancêtres à la descente :
   * un écouteur en capture les reçoit donc tous. Avantage : aucune liaison à
   * câbler entre SoundToggle et IntroVideo, et toute vidéo ajoutée plus tard
   * (V2, témoignages…) sera prise en compte sans y penser.
   *
   * On ne coupe pas le son, on le fait descendre puis on met en pause : un
   * arrêt sec au milieu d'une nappe sonore s'entend comme un défaut.
   */
  useEffect(() => {
    const onVideoPlay = (e: Event) => {
      if (!(e.target instanceof HTMLVideoElement)) return;
      const el = audioRef.current;
      // Rien à faire si la musique ne jouait pas : le choix du visiteur prime.
      if (!el || !isOn || el.paused) return;
      duckedRef.current = true;
      setIsDucked(true);
      fadeTo(0, FADE_OUT_MS, () => el.pause());
    };

    const onVideoStop = (e: Event) => {
      if (!(e.target instanceof HTMLVideoElement)) return;
      const el = audioRef.current;
      if (!el || !duckedRef.current) return;
      duckedRef.current = false;
      // L'activation est acquise depuis longtemps (il a fallu lancer la
      // vidéo), la reprise ne peut pas être refusée par le navigateur. On ne
      // rend l'icône à son état animé qu'une fois la lecture effectivement
      // repartie : si `play()` échouait, l'annoncer serait mentir une seconde
      // fois.
      void el
        .play()
        .then(() => {
          setIsDucked(false);
          fadeTo(TARGET_VOLUME, FADE_IN_MS);
        })
        .catch(() => {});
    };

    document.addEventListener("play", onVideoPlay, true);
    document.addEventListener("pause", onVideoStop, true);
    document.addEventListener("ended", onVideoStop, true);
    return () => {
      document.removeEventListener("play", onVideoPlay, true);
      document.removeEventListener("pause", onVideoStop, true);
      document.removeEventListener("ended", onVideoStop, true);
    };
  }, [isOn, fadeTo]);

  // Onglet en arrière-plan : on suspend, sans changer le choix de
  // l'utilisateur — la musique reprend au retour.
  useEffect(() => {
    const onVisibility = () => {
      const el = audioRef.current;
      if (!el) return;
      if (document.hidden) {
        if (el.paused) return;
        // Drapeau lu par `sync` : cette pause-ci ne doit pas éteindre le
        // bouton. Sinon le test du retour ne relancerait rien et le visiteur
        // retrouverait un site muet sans avoir rien demandé.
        hiddenRef.current = true;
        el.pause();
      } else if (hiddenRef.current) {
        hiddenRef.current = false;
        void el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

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
      // Couper le son pendant qu'une vidéo tourne doit rester définitif : sans
      // ça, la fin de la vidéo rallumerait la musique contre l'avis exprimé.
      duckedRef.current = false;
      setIsDucked(false);
      fadeTo(0, FADE_OUT_MS, () => el.pause());
      localStorage.setItem(STORAGE_KEY, "off");
      return;
    }

    // Ici on est dans un gestionnaire de clic : l'activation est acquise, le
    // démasquage ne peut pas être refusé. On n'allume pas le bouton d'avance
    // pour autant — `playing` s'en charge quand le son sort. En cas de refus,
    // rien n'aura clignoté pour rien.
    unlockedRef.current = false;
    if (!(await start(true))) {
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
          // `aria-pressed` reste le choix du visiteur : cliquer coupe bien le
          // fond sonore, même suspendu le temps d'une vidéo.
          aria-pressed={isOn}
          // Pas d'`aria-label` : le libellé visible ci-dessous EST le nom
          // accessible. En doubler un second, différent, casserait la commande
          // vocale (« cliquer sur Activer le son » ne trouverait plus la cible).
          // L'infobulle ne sert donc plus qu'au seul état que le texte ne dit
          // pas : la suspension pendant une vidéo.
          title={isDucked ? "Fond sonore suspendu pendant la vidéo" : undefined}
          className="shrink-0 flex items-center justify-center gap-2 whitespace-nowrap h-9 px-2.5 sm:px-4 border border-light-grey/25 text-light-grey/70 hover:border-terracota/70 hover:text-light-grey transition-colors"
        >
          {/* Largeur figée : l'égaliseur fait 14 px et l'icône coupée 16 px.
              Sans ce gabarit, le libellé se décalait d'un pixel à chaque
              bascule. */}
          <span className="flex items-center justify-center w-4 shrink-0">
            {isOn ? <Equalizer paused={isDucked} /> : <MutedIcon />}
          </span>
          {/* `sr-only sm:not-sr-only` plutôt que `hidden sm:inline` : sous
              `sm` le texte reste dans l'arbre d'accessibilité (il nomme le
              bouton) alors que `hidden` l'en retirerait, laissant une icône
              anonyme. Les deux libellés font la même longueur, donc la barre
              ne bouge pas d'un état à l'autre. */}
          <span className="sr-only sm:not-sr-only text-[11px] tracking-widest2 uppercase">
            {isOn ? "Arrêter le son" : "Activer le son"}
          </span>
        </button>
      )}
    </>
  );
}

/**
 * Barres animées — l'état « en lecture » se lit d'un coup d'œil.
 *
 * `paused` fige les barres et les atténue : le fond sonore est toujours activé,
 * mais une vidéo l'a suspendu. Des barres qui continueraient de danser sur du
 * silence sont pire qu'une icône neutre — elles font douter du son de la
 * machine plutôt que de renseigner.
 */
function Equalizer({ paused = false }: { paused?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="flex items-end gap-[2px] h-3 transition-opacity duration-300"
      style={{ opacity: paused ? 0.35 : 1 }}
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] h-full bg-terracota origin-bottom"
          style={{
            animation: `sound-bar 1.1s ease-in-out ${i * 0.17}s infinite`,
            animationPlayState: paused ? "paused" : "running",
            transform: paused ? "scaleY(0.3)" : undefined,
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
      stroke="#B4742A"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m17 9 4 6M21 9l-4 6" />
    </svg>
  );
}
