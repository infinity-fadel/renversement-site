// Taille du conteneur carré du globe (section 04) — module séparé et sans
// dépendance pour que Section04Observe.tsx puisse l'importer sans entraîner
// GlobeThree.tsx (et donc three.js) dans le bundle principal : ce fichier
// reste le seul point commun entre GlobeThree.tsx (chargé via next/dynamic)
// et le conteneur de superposition (légendes + pointillés) qui doit avoir
// exactement la même taille pour que les repères tombent sur le globe.
export const GLOBE_CONTAINER_SIZE = "clamp(320px, 40vw, 640px)";
