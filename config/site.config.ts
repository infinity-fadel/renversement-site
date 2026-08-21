/**
 * Configuration centrale du site RENVERSEMENT — V1 "Coming Soon"
 *
 * Objectif : garder tout ce qui est susceptible de changer avant/pendant
 * le lancement (domaine, date de révélation, textes clés) en dehors des
 * composants, comme demandé au §16.3 du cahier des charges.
 *
 * Rien ici n'est codé en dur dans les composants : ils importent ce fichier.
 */

// ---------------------------------------------------------------------------
// 1. NOM DE DOMAINE — variable d'environnement, modifiable sans toucher au code
// ---------------------------------------------------------------------------
//
// À définir dans .env.local (dev) et dans les variables d'environnement
// de l'hébergeur (Vercel > Project Settings > Environment Variables) en prod.
//
// Exemple .env.local :
//   NEXT_PUBLIC_SITE_DOMAIN=renversement.africa
//
// NEXT_PUBLIC_ est nécessaire car cette valeur est utilisée côté client
// (liens de partage, métadonnées Open Graph, etc.).
//
// Repli avec `||` et non `??` : chez Vercel, une variable déclarée sans valeur
// arrive comme chaîne vide, pas comme `undefined`. `??` la laissait passer,
// SITE_URL valait alors « https:// » et `new URL()` dans app/layout.tsx faisait
// échouer le build entier (« TypeError: Invalid URL », collecte de /_not-found).
const FALLBACK_SITE_DOMAIN = "renversement.africa"; // repli tant que le domaine définitif n'est pas choisi (§22)

export const SITE_DOMAIN = (
  process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim() || FALLBACK_SITE_DOMAIN
)
  // Tolère qu'on colle l'URL complète (« https://renversement.africa/ ») dans
  // la variable : seul le nom d'hôte doit rester ici.
  .replace(/^https?:\/\//i, "")
  .replace(/\/+$/, "");

export const SITE_URL = `https://${SITE_DOMAIN}`;

// ---------------------------------------------------------------------------
// 2. FUSEAU HORAIRE — Africa/Abidjan = UTC+0 toute l'année (pas de changement d'heure)
// ---------------------------------------------------------------------------
export const SITE_TIMEZONE = "Africa/Abidjan";

// ---------------------------------------------------------------------------
// 3. COMPTE À REBOURS — jusqu'au Jour J, en heure d'Abidjan
// ---------------------------------------------------------------------------
//
// Date de révélation validée (debrief client V1) : 2 octobre 2026.
// Abidjan étant UTC+0 toute l'année, l'heure ISO en "Z" EST l'heure locale
// d'Abidjan — aucune conversion à faire.
//
// Cette valeur est volontairement codée ici comme valeur par défaut, et non
// laissée à une variable d'environnement seule : la date est publique et
// figée, et le site doit afficher le bon décompte même si la variable n'est
// pas configurée chez l'hébergeur. NEXT_PUBLIC_LAUNCH_DATE_ISO reste
// prioritaire si elle est définie (utile pour tester la bascule à zéro).
//
// NB : l'ancien défaut « maintenant + 120 h » a été retiré — il produisait
// une cible différente entre le build (serveur) et le chargement de page
// (client), donc un décompte incohérent et une erreur d'hydratation React.

// Même piège que pour le domaine : une variable vide chez l'hébergeur donnait
// `new Date("")`, soit une date invalide, donc un compte à rebours en « NaN ».
// Une valeur vide ou mal formée retombe silencieusement sur la valeur validée.
function parseDateEnv(value: string | undefined, fallbackISO: string): Date {
  const parsed = new Date(value?.trim() || fallbackISO);
  return Number.isNaN(parsed.getTime()) ? new Date(fallbackISO) : parsed;
}

const DEFAULT_LAUNCH_ISO = "2026-10-02T00:00:00Z";

export const LAUNCH_DATE: Date = parseDateEnv(
  process.env.NEXT_PUBLIC_LAUNCH_DATE_ISO,
  DEFAULT_LAUNCH_ISO
);

// Début de la campagne de teasing — sert uniquement à donner une échelle à
// l'anneau de progression du compte à rebours (§6.9). Sans lui, l'anneau
// était calé sur une fenêtre fixe de 120 h : avec une révélation à plus de
// 40 jours, il serait resté plein et parfaitement immobile pendant des
// semaines, puis n'aurait bougé que dans les 5 derniers jours.
const DEFAULT_CAMPAIGN_START_ISO = "2026-08-17T00:00:00Z";

export const CAMPAIGN_START_DATE: Date = parseDateEnv(
  process.env.NEXT_PUBLIC_CAMPAIGN_START_ISO,
  DEFAULT_CAMPAIGN_START_ISO
);

const COUNTDOWN_DURATION_HOURS = Math.max(
  1,
  (LAUNCH_DATE.getTime() - CAMPAIGN_START_DATE.getTime()) / (1000 * 60 * 60)
);

export const COUNTDOWN_CONFIG = {
  targetDate: LAUNCH_DATE,
  startDate: CAMPAIGN_START_DATE,
  timezone: SITE_TIMEZONE,
  durationHours: COUNTDOWN_DURATION_HOURS,
};

// ---------------------------------------------------------------------------
// 4. AUTRES VALEURS EXTERNALISÉES (§16.3 — prêtes pour la V2)
// ---------------------------------------------------------------------------
export const SITE_CONFIG = {
  domain: SITE_DOMAIN,
  url: SITE_URL,
  name: "RENVERSEMENT",
  tagline: "Et si l'Afrique finançait le monde ?",
  circleName: "Cercle des premiers observateurs",
  // Vidéo d'introduction (3e debrief : « la vidéo sera intégrée ici », entre
  // le hero et la section 03). Le fichier n'a pas été fourni : tant que cette
  // valeur est nulle, IntroVideo ne rend rien — pas de cadre vide en
  // production. Déposer le fichier dans public/video/ puis renseigner le
  // chemin ici, ou passer NEXT_PUBLIC_INTRO_VIDEO_SRC chez l'hébergeur.
  introVideo: (process.env.NEXT_PUBLIC_INTRO_VIDEO_SRC ?? null) as string | null,
  // Image d'attente du lecteur, affichée avant lecture (facultative).
  introVideoPoster: (process.env.NEXT_PUBLIC_INTRO_VIDEO_POSTER ?? null) as
    | string
    | null,
  // Feature flags simples — bascule facile vers la V2 sans redéploiement lourd
  features: {
    countdown: true,
    globe: true,
    // Fond sonore (debrief V1). Coupé par défaut côté visiteur ; ce drapeau
    // retire purement et simplement le bouton et le fichier audio de la page.
    sound: true,
    // V2 — désactivés en V1, prêts à activer
    commerce: false,
    payment: false,
  },
};
