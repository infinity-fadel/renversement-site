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
// 3. COMPTE À REBOURS — 120 heures (5 jours), calculées en heure d'Abidjan
// ---------------------------------------------------------------------------
//
// Deux façons de piloter la date cible :
//
// A) Date fixe (recommandé dès que la date de révélation est validée) :
//    définir NEXT_PUBLIC_LAUNCH_DATE_ISO="2026-08-15T09:00:00Z"
//    (Abidjan étant UTC+0, l'heure ISO en "Z" correspond directement
//    à l'heure locale d'Abidjan — aucune conversion à faire)
//
// B) Fenêtre glissante de 120h (mode par défaut tant que la date n'est
//    pas figée) : la cible est calculée comme "maintenant + 120h" au
//    premier chargement du serveur, puis figée en config statique.
//
const COUNTDOWN_DURATION_HOURS = 120;

function computeDefaultLaunchDate(): Date {
  const now = new Date();
  return new Date(now.getTime() + COUNTDOWN_DURATION_HOURS * 60 * 60 * 1000);
}

export const LAUNCH_DATE: Date = process.env.NEXT_PUBLIC_LAUNCH_DATE_ISO
  ? new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE_ISO)
  : computeDefaultLaunchDate();

export const COUNTDOWN_CONFIG = {
  targetDate: LAUNCH_DATE,
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
    // V2 — désactivés en V1, prêts à activer
    commerce: false,
    payment: false,
  },
};
