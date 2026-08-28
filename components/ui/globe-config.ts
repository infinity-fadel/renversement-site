// Taille du conteneur carré du globe (section 04) — module séparé et sans
// dépendance pour que Section04Observe.tsx puisse l'importer sans entraîner
// GlobeThree.tsx (et donc three.js) dans le bundle principal : ce fichier
// reste le seul point commun entre GlobeThree.tsx (chargé via next/dynamic)
// et le conteneur de superposition (légendes + pointillés) qui doit avoir
// exactement la même taille pour que les repères tombent sur le globe.
export const GLOBE_CONTAINER_SIZE = "clamp(320px, 40vw, 640px)";

// ---------------------------------------------------------------------------
// Géométrie de l'état « horizon » du globe de fond.
//
// Ces valeurs vivaient dans GlobeBackground.tsx. Elles ont été extraites ici
// pour qu'un fil d'horizon décoratif puisse tracer exactement le même cercle
// que le globe ; ce fil a été retiré au 4e debrief. Le module reste séparé
// parce que c'est aussi ce qui permet à Section04Observe.tsx d'importer une
// géométrie sans entraîner three.js dans le bundle principal, et parce que
// la décomposition ci-dessous reste plus lisible qu'un bloc de calcul noyé
// dans la boucle de scroll.
//
// Rayon plafonné en px : au-delà d'environ 5000 px composés, Chromium cesse
// silencieusement de composer le calque WebGL. Hauteur visible plafonnée en
// px *et* en fraction de viewport : 190 px valent 18 % d'un écran de 1080 px
// mais 25 % d'un écran de 760 px, et l'arc remontait dans le cadran du compte
// à rebours sur les portables bas.
// ---------------------------------------------------------------------------
export const HORIZON_RADIUS_VW = 0.62;
export const HORIZON_RADIUS_MAX_PX = 1400;
export const HORIZON_VISIBLE_PX = 190;
export const HORIZON_VISIBLE_VH = 0.15;

/**
 * Cercle décrit par le globe à l'état horizon, en pixels écran.
 * `apexY` est le sommet de l'arc — le seul point que l'œil situe vraiment,
 * et donc l'ancrage naturel de tout ce qui doit se caler dessus.
 */
export function horizonGeometry(vw: number, vh: number) {
  const radius = Math.min(HORIZON_RADIUS_VW * vw, HORIZON_RADIUS_MAX_PX);
  const visible = Math.min(HORIZON_VISIBLE_PX, vh * HORIZON_VISIBLE_VH);
  return { radius, centerY: vh + radius - visible, apexY: vh - visible, visible };
}

// ---------------------------------------------------------------------------
// Limbe « vivant » du globe.
//
// horizonGeometry() ci-dessus ne décrit que l'état FINAL du globe. Ces deux
// fonctions décrivent la descente entière : progression, puis cercle
// réellement dessiné à cette progression. GlobeBackground s'en sert pour
// piloter sa transform, au lieu de refaire les mêmes interpolations à la main
// dans sa boucle de scroll.
// ---------------------------------------------------------------------------

/** Taille native du canvas WebGL — l'agrandissement se fait en CSS. */
export const GLOBE_BASE_SIZE = 640;
/** La sphère + sa lueur ne remplissent pas tout le canvas (valeur mesurée). */
export const GLOBE_FILL_RATIO = 0.9;
/** Rayon visible du disque à l'état de repos. */
export const GLOBE_REST_RADIUS_PX = 288;
/** Place du globe pendant la section 04, en fraction de viewport. */
export const GLOBE_REST_STATE = { xRatio: 0.74, yRatio: 0.48, scale: 1 };

/**
 * Progression 0 → 1 de la descente du globe vers l'horizon.
 * `observeTop` est le `getBoundingClientRect().top` de la section 04.
 *
 * Reste à 0 tant que le haut de la section 04 n'a pas atteint le haut du
 * viewport — donc pendant toute la durée où on la voit normalement — puis
 * monte sur un viewport entier de scroll supplémentaire.
 */
export function globeProgress(observeTop: number, vh: number) {
  return Math.min(1, Math.max(0, -observeTop / vh));
}

/**
 * Cercle réellement dessiné par le globe à cette progression : centre, rayon
 * visible et sommet de l'arc, en pixels écran. À `progress` = 1 le résultat
 * coïncide exactement avec horizonGeometry() — c'est la même descente, décrite
 * du début plutôt qu'à l'arrivée.
 */
export function globeLimb(vw: number, vh: number, progress: number) {
  const { radius: horizonRadius, centerY: horizonY } = horizonGeometry(vw, vh);
  const horizonScale = (horizonRadius * 2) / (GLOBE_BASE_SIZE * GLOBE_FILL_RATIO);
  const scale = GLOBE_REST_STATE.scale + (horizonScale - GLOBE_REST_STATE.scale) * progress;
  const restY = GLOBE_REST_STATE.yRatio * vh;
  const centerY = restY + (horizonY - restY) * progress;
  const radius = GLOBE_REST_RADIUS_PX * scale;
  return { radius, centerY, apexY: centerY - radius, scale, horizonScale };
}
