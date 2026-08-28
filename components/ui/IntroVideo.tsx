"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SITE_CONFIG } from "@/config/site.config";

/**
 * Vidéo d'introduction (3e debrief) — s'intercale entre le hero (02) et la
 * section 03, à l'emplacement pointé sur la capture : « La vidéo sera intégrée
 * ici ».
 *
 * Si `SITE_CONFIG.introVideo` vaut `null`, ce composant ne rend RIEN — pas de
 * cadre vide ni de bloc noir en production.
 *
 * Pas de lecture automatique, volontairement : le site a déjà un fond sonore
 * (SoundToggle) et deux sources audio se superposeraient. Le visiteur lance la
 * vidéo lui-même — c'est aussi ce qu'exigent les navigateurs pour une vidéo
 * non muette. SoundToggle écoute les événements `play`/`pause` de cet élément
 * et met la musique en sourdine pendant la lecture, sans liaison à câbler ici.
 *
 * Les contrôles natifs sont conservés (barre de progression, volume, plein
 * écran) ; le grand bouton central ne fait que doubler la commande de lecture,
 * que la barre native rend trop discrète sur une cover pleine largeur.
 */
export default function IntroVideo() {
  const src = SITE_CONFIG.introVideo;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // L'état vient des événements de l'élément, jamais d'un drapeau posé à
  // l'avance dans le gestionnaire de clic : la lecture peut être refusée,
  // interrompue, ou pilotée depuis la barre native — trois chemins qu'un
  // `setIsPlaying(true)` optimiste raterait, laissant une icône qui ment.
  // Même correctif que celui appliqué au bouton du fond sonore.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const sync = () => setIsPlaying(!el.paused && !el.ended);
    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("ended", sync);
    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("ended", sync);
    };
  }, [src]);

  const toggle = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  // Après les hooks, jamais avant : un retour anticipé placé plus haut les
  // rendrait conditionnels.
  if (!src) return null;

  return (
    <div className="w-full flex justify-center px-6 sm:px-12 lg:px-16 2xl:px-80 pb-16 sm:pb-20">
      <div className="group relative w-full max-w-4xl">
        {/* Équerres d'angle, même vocabulaire graphique que les cartes de la
            section 07. */}
        <span
          aria-hidden="true"
          className="absolute -top-2 -left-2 w-5 h-5 border-t border-l border-terracota/60"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-2 -right-2 w-5 h-5 border-b border-r border-terracota/60"
        />

        <video
          ref={videoRef}
          className="block w-full aspect-video bg-black border border-terracota/40"
          controls
          playsInline
          // Rien n'est téléchargé tant que le visiteur n'a pas lancé la
          // lecture — même politique que la piste sonore.
          preload="none"
          poster={SITE_CONFIG.introVideoPoster ?? undefined}
        >
          <source src={src} />
          Votre navigateur ne peut pas lire cette vidéo.
        </video>

        {/* Le calque est `pointer-events-none` : sans ça il recouvrirait la
            barre de contrôles native en bas de la vidéo, qui deviendrait
            inutilisable. Seul le bouton lui-même reprend les clics. */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            type="button"
            onClick={toggle}
            aria-label={
              isPlaying ? "Mettre la vidéo en pause" : "Lancer la vidéo"
            }
            className={`pointer-events-auto flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-terracota/70 bg-black/45 text-terracota backdrop-blur-sm transition-[opacity,background-color,color] duration-300 hover:bg-terracota hover:text-black hover:border-terracota focus-visible:opacity-100 focus-visible:bg-terracota focus-visible:text-black ${
              // Pendant la lecture, il s'efface pour ne pas manger l'image, et
              // revient au survol. Il reste cliquable même invisible : cliquer
              // au centre d'une vidéo pour la mettre en pause est le geste
              // attendu, et au doigt — où le survol n'existe pas — c'est le
              // seul moyen de la retrouver sans passer par la barre native.
              isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            }`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Triangle de lecture. Le décalage de 3 px vers la droite est un correctif
 * optique : centré géométriquement, un triangle paraît penché vers la gauche
 * dans un disque, son centre de masse n'étant pas son centre de boîte.
 */
function PlayIcon() {
  return (
    <svg
      aria-hidden="true"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="translate-x-[3px]"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.79-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
