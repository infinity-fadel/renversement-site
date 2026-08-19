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
export const SITE_DOMAIN =
  process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "renversement.africa"; // valeur de repli tant que le domaine définitif n'est pas choisi (§22)

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
const DEFAULT_LAUNCH_ISO = "2026-10-02T00:00:00Z";

export const LAUNCH_DATE: Date = new Date(
  process.env.NEXT_PUBLIC_LAUNCH_DATE_ISO ?? DEFAULT_LAUNCH_ISO
);

// Début de la campagne de teasing — sert uniquement à donner une échelle à
// l'anneau de progression du compte à rebours (§6.9). Sans lui, l'anneau
// était calé sur une fenêtre fixe de 120 h : avec une révélation à plus de
// 40 jours, il serait resté plein et parfaitement immobile pendant des
// semaines, puis n'aurait bougé que dans les 5 derniers jours.
const DEFAULT_CAMPAIGN_START_ISO = "2026-08-17T00:00:00Z";

export const CAMPAIGN_START_DATE: Date = new Date(
  process.env.NEXT_PUBLIC_CAMPAIGN_START_ISO ?? DEFAULT_CAMPAIGN_START_ISO
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
