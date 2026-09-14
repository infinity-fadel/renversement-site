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
  // Ordre d'affichage dans le menu. Il coïncide avec l'ordre du parcours :
  // Le Renversement, Les indices, Le Cercle, La bascule, Compte à rebours.
  //
  // ATTENTION — cette liste inverse une demande antérieure. Au debrief V1, le
  // client avait demandé que "Compte à rebours" passe DEVANT "Le Cercle"
  // (à rebours du §6.2). À l'époque le formulaire fermait la page : le menu
  // suivait donc le parcours. Le 5e retour ayant remonté le formulaire juste
  // après "Les indices", suivre le parcours produit mécaniquement l'ordre
  // inverse. On garde le parcours comme règle — un menu qui contredit ce que
  // l'on rencontre en descendant désoriente — mais c'est à reconfirmer.
  // Pour revenir à l'ancien ordre : donner à "circle" un navOrder de 5 et
  // décaler "shift"/"urgency" à 3 et 4. Rien d'autre ne bouge.
  // Ignoré si absent.
  navOrder?: number;
  // Libellé affiché à côté du numéro actif dans ProgressIndicator — repris
  // tel quel du tableau §5 du cahier des charges (titre court de section,
  // distinct du navLabel qui sert uniquement au menu).
  progressLabel: string;
};

// 5e retour client : le formulaire est remonté juste après "Les indices".
// Il passe donc de 09 à 06, et les trois sections qu'il dépasse reculent d'un
// cran (bascule 06→07, carte 07→08, compte à rebours 08→09). Le nombre
// d'entrées et la plage 00→11 sont inchangés — seuls les numéros affichés
// bougent. Les fichiers de components/sections/ ont été renommés en
// conséquence, pour que leur nom ne mente pas sur le numéro rendu.
//
// Le bloc de rappel ajouté en bas de page (« Vous êtes arrivé jusqu'ici. »,
// components/ui/RejoinCircle.tsx) ne figure PAS ici : c'est un simple rappel
// vers #circle, pas un chapitre. Il n'a donc ni numéro, ni entrée de menu, ni
// pas dans l'indicateur de progression — et n'a surtout pas d'ancre "circle",
// qui doit rester celle du formulaire (Nav.tsx et Section09Urgency.tsx y
// renvoient tous les deux).
export const SECTIONS: SectionMeta[] = [
  { id: "loader", number: "00", navLabel: "Accueil", inNav: false, progressLabel: "Écran de chargement" },
  { id: "hero", number: "02", navLabel: "Le Renversement", inNav: true, navOrder: 1, progressLabel: "Une question fondatrice" },
  { id: "direction", number: "03", navLabel: "Une direction", inNav: false, progressLabel: "Une seule direction" },
  { id: "observe", number: "04", navLabel: "Observer", inNav: false, progressLabel: "Observer depuis l'autre côté" },
  { id: "clues", number: "05", navLabel: "Les indices", inNav: true, navOrder: 2, progressLabel: "Les indices" },
  { id: "circle", number: "06", navLabel: "Le Cercle", inNav: true, navOrder: 3, progressLabel: "Le Cercle" },
  { id: "shift", number: "07", navLabel: "La bascule", inNav: true, navOrder: 4, progressLabel: "Le basculement" },
  { id: "flip", number: "08", navLabel: "La carte", inNav: false, progressLabel: "Retournez la carte" },
  { id: "urgency", number: "09", navLabel: "Compte à rebours", inNav: true, navOrder: 5, progressLabel: "Le renversement approche" },
  { id: "final", number: "10", navLabel: "Renversement", inNav: false, progressLabel: "Phrase finale" },
  { id: "footer", number: "11", navLabel: "Informations", inNav: false, progressLabel: "Informations" },
];
