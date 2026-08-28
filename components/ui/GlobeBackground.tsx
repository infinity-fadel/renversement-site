"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  GLOBE_BASE_SIZE as BASE_SIZE,
  GLOBE_FILL_RATIO,
  GLOBE_REST_RADIUS_PX as REST_RADIUS_PX,
  GLOBE_REST_STATE as REST_STATE,
  globeLimb,
  globeProgress,
} from "./globe-config";

const GlobeThree = dynamic(() => import("./GlobeThree"), { ssr: false });


// État "repos" (pendant la section 04), en fraction de la largeur/hauteur
// du viewport — calé sur la position/taille qu'occupait l'ancien globe
// inline de cette section.

// L'état "horizon" (rayon, centre, hauteur visible de l'arc) vit dans
// globe-config.ts, avec la décomposition de la descente (globeProgress puis
// globeLimb). Voir le commentaire de ce fichier pour les deux plafonds — rayon
// composé et hauteur d'arc visible — et leurs raisons.

// La sphère + sa lueur de bord (effet Fresnel) ne remplissent pas tout le
// canvas 640×640 : il reste une fine marge autour (cf. réglages de
// GlobeThree.tsx). Valeur mesurée directement sur une capture d'écran de
// l'état de repos (pas une estimation par le calcul de champ de vision de
// la caméra, qui ignore la lueur et sous-évaluait ce ratio à 0.76 — d'où
// un globe bien plus gros que prévu à l'état horizon, largement au-delà
// des HORIZON_VISIBLE_PX ciblés).

// Rayon visible du globe à l'état de repos : le disque n'occupe pas tout le
// canvas (cf. GLOBE_FILL_RATIO plus bas), d'où ce calcul plutôt que BASE_SIZE / 2.

// Légendes affichées uniquement pendant la section 04 (§6.5), positionnées en
// pixels autour du centre du globe dans son état "REST_STATE" — elles ne
// suivent pas l'agrandissement (pas de transform: scale partagé), pour rester
// lisibles tant qu'elles sont visibles, et s'effacent avant que le globe ne
// devienne trop grand pour qu'un texte superposé ait du sens.
//
// Placement revu au debrief V1 : les deux premières doivent désigner une
// géographie (« ICI » sur l'Afrique, « AILLEURS » sur le reste du monde) et la
// troisième se lire juste sous le globe. C'est ce qui a imposé de figer la
// rotation automatique (autoRotate={false} plus bas) : sans géographie stable,
// aucun placement fixe ne peut rester juste.
//
// L'Afrique fait face à la caméra à l'orientation initiale (INITIAL_ROTATION_Y
// dans GlobeThree.tsx), donc au centre du disque ; « ailleurs » est pris sur le
// limbe droit.
//
// Positions des deux premières recalculées au 3e debrief (« ICI, LES
// RESSOURCES doit être bien centré sur la carte de l'Afrique », « AILLEURS,
// LA VALEUR bien centré là où il y a le rectangle ») — non plus à l'oeil sur
// une capture, mais par projection du point géographique visé :
//
//   sphère r=1.5 · caméra perspective fov 38° en z=6 · canvas 640 px
//   globeGroup.rotation.y = INITIAL_ROTATION_Y (-2.35 rad)
//   texture équirectangulaire : u = (lon + 180) / 360
//   => x = r·cos(lat)·cos(lon), y = r·sin(lat), z = -r·cos(lat)·sin(lon),
//      puis rotation autour de Y, puis division perspective.
//
// Repères obtenus (décalage en px depuis le centre du disque, dont le limbe
// apparent vaut 240 px) :
//   Afrique centrale  3°N / 19°E  -> (-130,  -16)
//   Europe/Asie      42°N / 35°E  -> ( -35, -190)
//
// `dx`/`dy` positionnent le coin haut-gauche du bloc : ce sont donc ces
// repères moins la demi-largeur et la demi-hauteur (~50 px sur deux lignes).
// Toute modification de INITIAL_ROTATION_Y invalide ces quatre nombres.
type Callout = {
  text: string;
  dx: number;
  dy: number;
  width: number;
  align: "center" | "left" | "right";
  /** Classe de couleur ; l'or de la charte par défaut. */
  tone?: string;
};

const CALLOUTS: Callout[] = [
  // Centrée sur l'Afrique centrale.
  {
    text: "Ici, les ressources.",
    dx: -205,
    dy: -41,
    width: 150,
    align: "center" as const,
  },
  // Centrée sur la nappe lumineuse Europe → Asie occidentale, en haut du
  // disque : c'est la zone entourée sur la capture du 3e debrief.
  {
    text: "Ailleurs, la valeur.",
    dx: -123,
    dy: -215,
    width: 175,
    align: "center" as const,
    // Seule légende en blanc (4e retour client) : posée sur la nappe lumineuse
    // Europe → Asie, elle se confondait avec les lumières dorées de la texture.
    tone: "text-light-grey",
  },
  // Remontée pour se lire au bas du globe plutôt que détachée en dessous.
  {
    text: "Entre les deux, des flux que l'on questionne rarement.",
    dx: -210,
    dy: REST_RADIUS_PX - 30,
    width: 420,
    align: "center" as const,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Globe Three.js en fond persistant de la page, dont la taille et la
 * position sont pilotées par la progression du scroll à travers la
 * section 04 : il démarre à sa taille/place normale (§6.5, calé sur la
 * maquette), puis grossit et glisse vers le bas au fil du scroll jusqu'à
 * ne plus laisser dépasser que sa courbe supérieure en bas de l'écran,
 * lueur dorée comprise — cet état "horizon" remplace alors les faux
 * horizons plats en SVG qui décoraient jusqu'ici le bas de chaque section
 * suivante (05 → 11), retirés en même temps que ce composant a été ajouté.
 *
 * Réversible : remonter au-dessus de la section 04 fait rétrécir le globe
 * en sens inverse, pas de verrouillage à sens unique.
 *
 * Masqué sur mobile (`hidden md:block`) — Section04Observe.tsx y affiche à
 * la place son propre globe inline, plus simple, dans le flux normal de la
 * section.
 */
export default function GlobeBackground() {
  const globeWrapperRef = useRef<HTMLDivElement>(null);
  const calloutsRef = useRef<HTMLDivElement>(null);
  // Intensité du battement de la lueur, lue chaque frame par GlobeThree. Une
  // ref plutôt qu'un état : elle change à chaque frame de scroll, un setState
  // re-rendrait le composant (et donc remonterait la scène WebGL) en boucle.
  const pulseRef = useRef(0);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Sur mobile/tablette ce composant est masqué en CSS ; inutile de faire
    // tourner la boucle de scroll pour rien.
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    let raf = 0;
    const tick = () => {
      const section = document.getElementById("observe");
      const globeEl = globeWrapperRef.current;
      const calloutsEl = calloutsRef.current;

      if (section && globeEl && calloutsEl) {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const top = section.getBoundingClientRect().top;

        // N'apparaît qu'une fois la section 04 déjà bien entamée à l'écran
        // (pas dès qu'elle pointe en bas de viewport, ce qui la rendait
        // visible depuis la section 03 encore à l'écran).
        const visible = top < vh * 0.35;
        if (visible && !hasBeenVisible) setHasBeenVisible(true);

        // Reste à 0 (taille/position de repos) tant que le haut de la
        // section 04 n'a pas encore atteint le haut du viewport — donc
        // pendant toute la durée où on la voit normalement. Ne commence à
        // grossir qu'une fois qu'on se met à scroller au-delà, jusqu'à un
        // plein viewport de scroll supplémentaire (progress=1) ; au-delà,
        // ça reste bloqué à 1 (stable pour toutes les sections suivantes)
        // tant qu'on ne remonte pas.
        // Progression et géométrie viennent de globe-config plutôt que d'être
        // recalculées ici : la descente y est décrite une fois, testée, et
        // reste lisible hors du bruit de la boucle de scroll.
        const progress = globeProgress(top, vh);
        const limb = globeLimb(vw, vh, progress);

        const x = lerp(REST_STATE.xRatio * vw, vw * 0.5, progress);
        const y = limb.centerY;
        const scale = limb.scale;

        globeEl.style.opacity = visible ? "1" : "0";
        globeEl.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;

        // Le battement de la lueur ne s'installe qu'une fois le globe descendu
        // vers l'horizon. La progression est élevée au carré pour que l'effet
        // reste imperceptible pendant la section 04 — où le globe est encore
        // lisible comme une planète — et ne s'affirme que sur la fin de la
        // descente, quand il ne reste plus qu'un arc lumineux en bas d'écran.
        pulseRef.current = visible ? progress * progress : 0;

        calloutsEl.style.transform = `translate(${x}px, ${y}px)`;
        calloutsEl.style.opacity = visible
          ? String(Math.max(0, 1 - progress / 0.4))
          : "0";
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBeenVisible]);

  return (
    <div
      aria-hidden="true"
      className="hidden md:block fixed inset-0 overflow-hidden pointer-events-none -z-10"
    >
      <div
        ref={globeWrapperRef}
        className="absolute top-0 left-0 opacity-0"
        style={{ width: BASE_SIZE, height: BASE_SIZE, willChange: "transform, opacity" }}
      >
        {hasBeenVisible && (
          <GlobeThree
            active
            size={BASE_SIZE}
            autoRotate={false}
            pulseRef={pulseRef}
          />
        )}
      </div>

      <div
        ref={calloutsRef}
        className="absolute top-0 left-0 opacity-0"
        style={{ willChange: "transform, opacity" }}
      >
        {CALLOUTS.map((c) => (
          <span
            key={c.text}
            className={`absolute text-base sm:text-lg tracking-widest2 uppercase leading-snug ${
              c.tone ?? "text-terracota"
            }`}
            style={{
              left: c.dx,
              top: c.dy,
              width: c.width,
              textAlign: c.align,
              // Les deux premières légendes se lisent par-dessus le globe :
              // sans ombre portée, elles se perdent dans les zones éclairées
              // de la texture.
              textShadow: "0 0 10px rgba(0,0,0,0.95), 0 0 26px rgba(0,0,0,0.8)",
            }}
          >
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}
