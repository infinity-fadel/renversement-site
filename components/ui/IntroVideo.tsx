"use client";

import { SITE_CONFIG } from "@/config/site.config";

/**
 * Vidéo d'introduction (3e debrief) — s'intercale entre le hero (02) et la
 * section 03, à l'emplacement pointé sur la capture : « La vidéo sera intégrée
 * ici ».
 *
 * Le fichier n'a pas été fourni. Tant que `SITE_CONFIG.introVideo` vaut `null`,
 * ce composant ne rend RIEN — pas de cadre vide ni de bloc noir en production.
 * Il suffira de déposer le fichier dans `public/video/` et de renseigner le
 * chemin dans config/site.config.ts pour qu'il apparaisse, sans autre
 * modification.
 *
 * Pas de lecture automatique, volontairement : le site a déjà un fond sonore
 * (SoundToggle) et deux sources audio se superposeraient. Le visiteur lance la
 * vidéo lui-même — c'est aussi ce qu'exigent les navigateurs pour une vidéo
 * non muette.
 */
export default function IntroVideo() {
  const src = SITE_CONFIG.introVideo;
  if (!src) return null;

  return (
    <div className="w-full flex justify-center px-6 sm:px-12 lg:px-16 2xl:px-80 pb-16 sm:pb-20">
      <div className="relative w-full max-w-4xl">
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
          className="w-full aspect-video bg-black border border-terracota/40"
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
      </div>
    </div>
  );
}
