/**
 * Registre des 12 sections (§5 du cahier des charges).
 * Sert de source unique pour :
 *  - l'ordre de rendu dans app/page.tsx
 *  - le menu de navigation (ancres)
 *  - l'indicateur latéral de progression 00 → 11
 *
 * `inNav: false` pour les sections techniques (chargement, footer) qui ne
 * doivent pas apparaître comme des liens de menu classiques.
 */
export type SectionMeta = {
  id: string; // ancre HTML, ex: "hero"
  number: string; // "00".."11", affiché par l'indicateur
  navLabel: string; // libellé court pour le menu
  inNav: boolean;
  // Ordre d'affichage dans le menu (§6.2), indépendant de l'ordre du
  // parcours ci-dessous — le menu n'est pas censé suivre l'ordre des
  // sections (ex. "Le Cercle" est listé avant "Compte à rebours" alors que
  // la section 08 précède la section 09 dans le parcours). Ignoré si absent.
  navOrder?: number;
  // Libellé affiché à côté du numéro actif dans ProgressIndicator — repris
  // tel quel du tableau §5 du cahier des charges (titre court de section,
  // distinct du navLabel qui sert uniquement au menu).
  progressLabel: string;
};

export const SECTIONS: SectionMeta[] = [
  { id: "loader", number: "00", navLabel: "Accueil", inNav: false, progressLabel: "Écran de chargement" },
  { id: "hero", number: "02", navLabel: "Le Renversement", inNav: true, navOrder: 1, progressLabel: "Une question fondatrice" },
  { id: "direction", number: "03", navLabel: "Une direction", inNav: false, progressLabel: "Une seule direction" },
  { id: "observe", number: "04", navLabel: "Observer", inNav: false, progressLabel: "Observer depuis l'autre côté" },
  { id: "clues", number: "05", navLabel: "Les indices", inNav: true, navOrder: 2, progressLabel: "Les indices" },
  { id: "shift", number: "06", navLabel: "La bascule", inNav: true, navOrder: 3, progressLabel: "Le basculement" },
  { id: "flip", number: "07", navLabel: "La carte", inNav: false, progressLabel: "Retournez la carte" },
  { id: "urgency", number: "08", navLabel: "Compte à rebours", inNav: true, navOrder: 5, progressLabel: "Le renversement approche" },
  { id: "circle", number: "09", navLabel: "Le Cercle", inNav: true, navOrder: 4, progressLabel: "Le Cercle" },
  { id: "final", number: "10", navLabel: "Renversement", inNav: false, progressLabel: "Phrase finale" },
  { id: "footer", number: "11", navLabel: "Informations", inNav: false, progressLabel: "Informations" },
];
