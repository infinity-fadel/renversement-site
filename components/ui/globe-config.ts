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
// Ces valeurs vivaient dans GlobeBackground.tsx. Elles remontent ici parce que
// le fil d'horizon (components/ui/ChapterThread.tsx) doit tracer *exactement*
// le limbe du globe au passage de la section 04 : c'est là que la ligne
// « devient » la planète. Deux copies des mêmes nombres auraient divergé au
// premier réglage du globe et le raccord se serait décalé sans que personne
// ne comprenne pourquoi.
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
 * et donc l'ancrage naturel du fil d'horizon.
 */
export function horizonGeometry(vw: number, vh: number) {
  const radius = Math.min(HORIZON_RADIUS_VW * vw, HORIZON_RADIUS_MAX_PX);
  const visible = Math.min(HORIZON_VISIBLE_PX, vh * HORIZON_VISIBLE_VH);
  return { radius, centerY: vh + radius - visible, apexY: vh - visible, visible };
}
