/**
 * Contenus de la V2 — site officiel du livre (§2.3, §17).
 *
 * Source : maquette Figma « Renversement V2 »
 * (figma.com/design/OcdzObPYBHWQQuwpAR4kGC, page complète `1:2`), relevée le
 * 15 octobre 2026. Les textes sont repris MOT POUR MOT de la maquette ; les
 * seules retouches sont signalées en commentaire, une par une.
 *
 * Tout ce qui est marqué « PROVISOIRE » est un contenu de remplissage de la
 * maquette, à remplacer par le client avant la mise en ligne. Ces contenus
 * sont regroupés ici précisément pour pouvoir être changés sans toucher aux
 * composants.
 */

/** Ancres de la page, partagées par l'en-tête et les boutons internes. */
export const ANCHORS = {
  home: "accueil",
  book: "le-livre",
  author: "auteur",
  excerpts: "extraits",
  testimonials: "temoignages",
  order: "commander",
  news: "actualites",
  contact: "contact",
} as const;

/** Menu de l'en-tête, dans l'ordre de la maquette. */
export const NAV_LINKS = [
  { label: "Accueil", anchor: ANCHORS.home },
  { label: "Le livre", anchor: ANCHORS.book },
  { label: "L’auteur", anchor: ANCHORS.author },
  { label: "Extraits", anchor: ANCHORS.excerpts },
  { label: "Témoignages", anchor: ANCHORS.testimonials },
  { label: "Actualités", anchor: ANCHORS.news },
] as const;

export const BOOK = {
  /** Titre du livre, sous le logotype animé. */
  title: "Et si l’Afrique finançait le monde ?",
  /** Notice Wikipédia de l'auteur, liée depuis la présentation. Dans la
   *  maquette, le lien passe par une redirection Canva : on pointe
   *  directement sur la cible. */
  authorUrl: "https://fr.wikipedia.org/wiki/Isma%C3%ABl_Adam_Ciss%C3%A9",
  priceLabel: "PRIX : 25 000 FCFA",
  /** Prix unitaire en FCFA, pour le total du formulaire de commande. */
  unitPrice: 25000,
};

/**
 * Vidéo de l'écran d'ouverture : « MYTHE 1 — L'AFRIQUE EST PAUVRE », la même
 * que sur le site actuel (V1). Dans la maquette, l'écran d'ouverture (nœud
 * `2:58`) n'exporte aucun calque : ce qu'on y voit est la première image de
 * cette vidéo (« DEPUIS TOUJOURS, UNE… » et le monogramme).
 *
 * Versions réencodées depuis public/video/mythe-1-afrique-pauvre.mp4 (34 Mo,
 * trop lourd pour une vidéo qui démarre seule) : 1080p à 7,6 Mo, 720p à
 * 4,2 Mo pour les petits écrans. Commande utilisée, à rejouer si la source
 * change :
 *   ffmpeg -i source.mp4 -c:v libx264 -preset slow -crf 28 -profile:v high \
 *     -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k ouverture-1080.mp4
 *   ffmpeg -i source.mp4 -vf scale=-2:720 -c:v libx264 -preset slow -crf 26 \
 *     -profile:v main -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k ouverture-720.mp4
 */
export const HERO_VIDEO = {
  desktop: "/video/ouverture-1080.mp4",
  mobile: "/video/ouverture-720.mp4",
  /** Image d'attente : la première image de la vidéo (0,5 s). */
  poster: "/v2/ouverture-poster.webp",
  /** Libellés repris du bouton de son du site actuel (validés client). */
  soundOn: "Activer le son",
  soundOff: "Arrêter le son",
};

export const BOOK_EVENT = {
  eyebrow: "LE LIVRE ÉVÉNEMENT",
};

export const QUOTE_BANNER =
  "L'Afrique n'a pas besoin d'être financée. Elle doit apprendre à se financer.";

export const BOOK_SECTION = {
  eyebrow: "LE LIVRE",
  title: "Et si le récit qui a façonné notre regard sur l’Afrique était incomplet ?",
  body: "À travers des données implacables, des analyses rigoureuses et une vision audacieuse, RENVERSEMENT déconstruit les idées reçues et propose une nouvelle lecture de la place réelle — et future — de l’Afrique dans l’économie mondiale.",
  discoverLabel: "CE QUE VOUS DÉCOUVRIREZ",
  discover: [
    "Les mythes qui entretiennent la dépendance financière",
    "Les capitaux africains encore sous-exploités",
    "Le potentiel de la diaspora et de l'épargne locale",
    "Les nouveaux leviers technologiques et financiers",
    "Une feuille de route jusqu'en 2035",
  ],
  cta: "DÉCOUVRIR LES EXTRAITS",
};

export const AUTHOR = {
  eyebrow: "L’AUTEUR",
  name: "Ismaël Adam CISSÉ",
  paragraphs: [
    "Depuis plus de 20 ans, Ismaël Adam CISSÉ œuvre à transformer les défis africains en opportunités durables.",
    "À travers ses engagements et ses investissements stratégiques, il contribue à bâtir une Afrique souveraine, prospère et tournée vers l’avenir.",
    "Avec RENVERSEMENT, il partage une conviction forte : le temps est venu d’écrire notre propre récit.",
  ],
  /** Étiquettes qui apparaissent sur le portrait (variante « image end »).
   *  Positions relevées dans la maquette, en % du cadre de 580 × 576.
   *  INVESTISSEUR est ancrée par la DROITE (bord à 1,7 % du cadre dans la
   *  maquette) : ancrée à gauche, elle sortait de l'écran quand la photo
   *  rétrécit, le texte gardant sa taille (constaté à 1024 px). */
  labels: [
    { text: "ENTREPRENEUR", left: "5.2%", top: "19.1%" },
    { text: "INVESTISSEUR", right: "1.7%", top: "47.8%" },
    { text: "BÂTISSEUR", left: "4.7%", top: "64.6%" },
  ] as { text: string; top: string; left?: string; right?: string }[],
};

export type Excerpt = { quote: string; source: string };

// Les quatre citations distinctes de la maquette.
const MILLIARDAIRE: Excerpt = {
  quote:
    "Imaginez un milliardaire qui mendie dans la rue. C’est exactement le portrait de l’Afrique contemporaine.",
  source: "Introduction - Page 13",
};
const FINANCE_DEJA: Excerpt = {
  quote: "L’Afrique finance déjà le monde - mais à son insu, et à perte",
  source: "Introduction - Page 16",
};
const MAL_PERNICIEUX: Excerpt = {
  quote: "L’Afrique souffre d’un mal plus pernicieux que la pauvreté : la croyance en sa propre pauvreté",
  source: "Chapitre 1 - Page 35",
};
const ENJEU_POUVOIR: Excerpt = {
  quote:
    "Le véritable enjeu reste celui du pouvoir : un système où l’échec des programmes justifie leur propre continuation, dans une cercle vicieux où la dépendance d’aujourd’hui paie les dettes d’hier et justifie l’aide de demain",
  source: "Chapitre 2 - Page 70",
};

export const EXCERPTS = {
  eyebrow: "EXTRAITS",
  title: "Dix passages pour commencer le RENVERSEMENT",
  subtitle: "Découvrez quelques idées fortes qui traversent l’ouvrage.",
  // Les dix cartes de la maquette, colonne par colonne, dans sa disposition
  // décalée (nœuds `30:90`, `30:91`, `30:92`, `30:100`).
  //
  // PROVISOIRE — la maquette n'a que QUATRE citations distinctes, recopiées
  // pour remplir les dix cartes. Les copies sont marquées « copie » : à
  // remplacer par les six extraits manquants, à fournir par le client.
  //
  // Retouches : les espaces parasites après le guillemet ouvrant (« “ L’Afrique »)
  // ont été retirés, et les guillemets sont posés par le composant.
  // « dans une cercle vicieux » est conservé tel quel : c'est une citation du
  // livre, à vérifier sur l'ouvrage (« un cercle » attendu).
  columns: [
    [MILLIARDAIRE, FINANCE_DEJA, MAL_PERNICIEUX],
    [/* copie */ MAL_PERNICIEUX, ENJEU_POUVOIR],
    [/* copie */ MILLIARDAIRE, /* copie */ FINANCE_DEJA, /* copie */ MILLIARDAIRE],
    [/* copie */ MAL_PERNICIEUX, /* copie */ ENJEU_POUVOIR],
  ] satisfies Excerpt[][],
  // Retouche : la maquette porte « LIRE LA SUITE DANS REVERSEMENT », coquille
  // manifeste sur le nom du livre.
  cta: "LIRE LA SUITE DANS RENVERSEMENT",
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  photo: string;
};

export const TESTIMONIALS = {
  eyebrow: "TÉMOIGNAGES EARLY READERS",
  title: "Ils ont lu RENVERSEMENT avant sa sortie",
  // PROVISOIRE ? — noms, fonctions et photos à faire confirmer par le client
  // (personnes réelles, accord de publication). La pagination de la maquette
  // (trois points) suppose davantage de témoignages que ces quatre-là.
  items: [
    {
      quote: "Un livre qui change profondément la manière de penser le financement de l’Afrique.",
      name: "Amara KONÉ",
      role: "Economiste",
      photo: "/v2/temoin-1.webp",
    },
    {
      quote: "Une vision audacieuse accompagnée de solutions concrètes.",
      name: "Cyrille KONAN",
      role: "Directeur d’investissement",
      photo: "/v2/temoin-2.webp",
    },
    {
      quote: "Des sujets financiers expliqués avec clarté",
      name: "Fatou N’diaye",
      role: "Cadre bancaire",
      photo: "/v2/temoin-3.webp",
    },
    {
      quote: "Une autre manière de penser l’épargne et l’investissement.",
      name: "Mariam OUATTARA",
      role: "Experte en finance inclusive",
      photo: "/v2/temoin-4.webp",
    },
  ] satisfies Testimonial[],
  cta: "COMMANDER MON EXEMPLAIRE",
};

export type Retailer = {
  name: string;
  logo: string;
  /** Fond posé derrière le logo, quand la maquette en prévoit un. */
  logoBackground?: string;
  /** PROVISOIRE tant que `null` : lien vers la fiche du livre chez le revendeur. */
  url: string | null;
};

export const ORDER = {
  eyebrow: "COMMANDER LE LIVRE",
  formTitle: "Formulaire de commande",
  submit: "COMMANDER",
  paymentNote: "(Paiement à la livraison y compris les frais de livraison)",
  abroadTitle: "Vous n’êtes pas en Côte d’Ivoire ?",
  availableOn: "Disponible sur",
  retailerCta: "COMMANDER",
  // PROVISOIRE — liens vers les fiches produit à fournir. La maquette
  // contient trois revendeurs de plus, sous forme d'aplats de couleur sans
  // logo ni nom : ils ne sont pas repris tant qu'ils ne sont pas identifiés.
  retailers: [
    { name: "Amazon", logo: "/v2/revendeur-amazon.webp", url: null },
    { name: "Fnac", logo: "/v2/revendeur-fnac.webp", url: null },
    {
      name: "L’Harmattan",
      logo: "/v2/revendeur-harmattan.webp",
      logoBackground: "#009656",
      url: null,
    },
  ] satisfies Retailer[],
  storesTitle: "Disponible en magasin à Abidjan",
  storesCta: "VOIR LES MAGASINS",
  // PROVISOIRE — la liste des magasins derrière ce bouton n'existe pas encore.
  storesUrl: null as string | null,
  provinceTitle: "Disponible à l’intérieur du pays à la librairie de france",
  provinceCities: ["Yamoussoukro", "Bouaké", "Daloa", "San Pedro"],
};

export type NewsItem = {
  kicker: string;
  title: string;
  image: string;
  url: string | null;
};

export const NEWS = {
  eyebrow: "ACTUALITES",
  title: "Ne rien manquer de RENVERSEMENT",
  // PROVISOIRE — les trois cartes de la maquette portent le même texte et ne
  // mènent nulle part. Articles réels (titre, visuel, lien) à fournir.
  items: [
    {
      kicker: "RENVERSEMENT",
      title: "repenser les flux de richesse entre l’Afrique et le reste du monde",
      image: "/v2/actu-1.webp",
      url: null,
    },
    {
      kicker: "RENVERSEMENT",
      title: "repenser les flux de richesse entre l’Afrique et le reste du monde",
      image: "/v2/actu-2.webp",
      url: null,
    },
    {
      kicker: "RENVERSEMENT",
      title: "repenser les flux de richesse entre l’Afrique et le reste du monde",
      image: "/v2/actu-3.webp",
      url: null,
    },
  ] satisfies NewsItem[],
  readMore: "LIRE LA SUITE",
  cta: "REJOINDRE LE MOUVEMENT",
};

export const CONTACT = {
  eyebrow: "CONTACT",
  title: "Faisons vivre le débat",
  body: "Vous souhaitez organiser une interview, inviter l'auteur, devenir partenaire, distribuer le livre ou effectuer une commande institutionnelle ? Contactez l'équipe RENVERSEMENT.",
  email: "contact@lerenversement.com",
  phone: "07 99 71 20 96",
  /** Même numéro au format international, pour le lien `tel:`. */
  phoneHref: "+2250799712096",
  submit: "ENVOYEZ LA DEMANDE",
};

export const MOVEMENT = {
  eyebrow: "LE MOUVEMENT",
  title: "Le changement commence par nous.",
  body: "RENVERSEMENT est plus qu'un livre, c'est un mouvement. Inscrivez-vous pour bâtir avec nous une Afrique financièrement souveraine.",
  follow: "SUIVEZ LE MOUVEMENT",
  submit: "REJOINDRE LE MOUVEMENT",
  successTitle: "Vous faites désormais partie du RENVERSEMENT.",
  successBody:
    "Ensemble, écrivons le nouveau récit de l'Afrique. Restez connecté(e) en nous suivant sur les réseaux",
};

export type SocialLink = { name: string; icon: string; url: string | null };

// PROVISOIRE — adresses des comptes à fournir. Ordre et icônes de la maquette.
export const SOCIAL_LINKS: SocialLink[] = [
  { name: "YouTube", icon: "/v2/youtube.svg", url: null },
  { name: "Facebook", icon: "/v2/facebook.svg", url: null },
  // Calque nommé « Frame 87 » dans la maquette : c'est le logo LinkedIn.
  { name: "LinkedIn", icon: "/v2/linkedin.svg", url: null },
  { name: "TikTok", icon: "/v2/tiktok.svg", url: null },
  { name: "Instagram", icon: "/v2/instagram.svg", url: null },
];

export const FOOTER = {
  domain: "lerenversement.com",
  rights: "2026 Tous droits réservés",
  follow: "SUIVEZ LE MOUVEMENT",
};

export const CTA_LABELS = {
  order: "COMMANDER LE LIVRE",
  join: "REJOINDRE LE MOUVEMENT",
};
