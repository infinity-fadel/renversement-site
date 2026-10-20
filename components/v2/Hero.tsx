"use client";

import { useEffect, useRef, useState } from "react";
import { ANCHORS, HERO_VIDEO } from "@/config/v2.content";

/**
 * Écran d'ouverture (maquette, nœud `2:58`, 1512 × 792) : la vidéo du site
 * actuel, en plein cadre (cf. HERO_VIDEO dans config/v2.content.ts).
 *
 * Lecture automatique MUETTE, en boucle : c'est le seul démarrage
 * automatique que les navigateurs acceptent pour une vidéo (et contrairement
 * à `<audio>`, cf. CLAUDE.md « Fond sonore », il marche réellement). Le son
 * s'active d'un clic. Le bouton pause n'est pas décoratif : WCAG 2.2.2 exige
 * de pouvoir arrêter toute animation de plus de 5 secondes.
 *
 * `prefers-reduced-motion` : pas de lecture automatique, l'image d'attente
 * reste affichée et le visiteur lance la vidéo lui-même.
 *
 * Cadre au format 16:9 de la vidéo, plafonné à la hauteur de la maquette
 * (792 px) : au-delà, `object-cover` rogne à peine le haut et le bas, jamais
 * le texte, qui est centré.
 */
export default function Hero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // L'état des boutons suit les événements de l'élément, pas un drapeau posé
  // à l'avance : même leçon que le bouton de son de la V1 (une lecture peut
  // être refusée ou interrompue sans que le code l'ait demandé).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const sync = () => {
      setPlaying(!el.paused && !el.ended);
      setMuted(el.muted);
    };
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("volumechange", sync);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
    } else {
      // `autoPlay` suffit en général ; l'appel explicite rattrape les
      // navigateurs qui l'ignorent après hydratation. Un refus est sans
      // conséquence : l'image d'attente reste, et le bouton lecture aussi.
      el.play().catch(() => {});
    }
    sync();

    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("volumechange", sync);
    };
  }, []);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const toggleSound = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = !el.muted;
    // Activer le son sur une vidéo en pause doit aussi la lancer : sinon le
    // clic semble sans effet.
    if (!el.muted && el.paused) el.play().catch(() => {});
  };

  return (
    <section
      id={ANCHORS.home}
      aria-label="Accueil"
      // Sur mobile la vidéo ne fait que ~220 px de haut : l'en-tête (76 px)
      // en masquait le tiers supérieur. On la décale sous l'en-tête ; à partir
      // de `md` elle passe dessous, comme dans la maquette.
      className="relative mt-[76px] aspect-video max-h-[792px] w-full overflow-hidden bg-black md:mt-0"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster={HERO_VIDEO.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Vidéo « Mythe 1 — L'Afrique est pauvre »"
      >
        <source src={HERO_VIDEO.mobile} type="video/mp4" media="(max-width: 767px)" />
        <source src={HERO_VIDEO.desktop} type="video/mp4" />
      </video>

      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 sm:bottom-6 sm:right-6 sm:gap-2">
        {/* Libellé en `sr-only sm:not-sr-only` et non `hidden sm:inline` :
            sous `sm` seule l'icône s'affiche, mais le texte reste le nom
            accessible du bouton (même choix que SoundToggle en V1). */}
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          className="flex h-8 min-w-8 items-center justify-center gap-2 border border-light-grey/30 bg-black/50 px-2 text-xs uppercase tracking-[0.08em] text-light-grey backdrop-blur-sm transition-colors hover:border-terracota hover:text-terracota sm:h-10 sm:px-3 sm:text-[13px]"
        >
          <SpeakerIcon muted={muted} />
          <span className="sr-only sm:not-sr-only">
            {muted ? HERO_VIDEO.soundOn : HERO_VIDEO.soundOff}
          </span>
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
          className="flex h-8 w-8 items-center justify-center border border-light-grey/30 bg-black/50 text-light-grey backdrop-blur-sm transition-colors hover:border-terracota hover:text-terracota sm:h-10 sm:w-10"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 1h3v12H3zM8 1h3v12H8z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 1l10 6-10 6z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
      {muted ? (
        <path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" strokeWidth="1.3" />
      ) : (
        <path
          d="M11 5.5a3.5 3.5 0 010 5M12.5 3.5a6 6 0 010 9"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      )}
    </svg>
  );
}
