/**
 * Accès à l'API Brevo, partagé par les routes serveur (`app/api/*`).
 *
 * Extrait de `app/api/subscribe/route.ts` à l'arrivée de la V2, qui ajoute
 * deux formulaires (commande et contact) passant par le même compte. Le
 * comportement de l'inscription n'a pas changé ; les commentaires d'origine
 * ont suivi le code.
 *
 * SERVEUR UNIQUEMENT : ce module lit BREVO_API_KEY, qui donne accès à tout le
 * compte. Ne jamais l'importer depuis un composant client.
 */

import type { BrevoEmailContent } from "@/lib/brevo-emails";

const BREVO_API = "https://api.brevo.com/v3";

// Au-delà, on abandonne et on laisse le navigateur repartir vers FormSubmit.
// Sans ce garde-fou, une lenteur de Brevo bloquerait le visiteur jusqu'au
// délai d'exécution de la fonction Vercel (10 s), bouton figé sur
// « Inscription en cours… ».
const TIMEOUT_MS = 8000;

export type BrevoConfig = {
  apiKey: string;
  listId: number | null;
  senderEmail: string;
  senderName: string;
  notificationEmail: string;
  nameAttribute: string;
  /** Attribut Brevo où ranger le téléphone saisi à l'inscription (V2).
   *  `null` tant qu'il n'est pas configuré : le numéro ne part alors que dans
   *  l'e-mail de notification. Voir `.env.example`. */
  phoneAttribute: string | null;
  welcomeTemplateId: number | null;
  notificationTemplateId: number | null;
};

export function readBrevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  // Repli avec `||` et non `??` partout dans ce fichier : chez Vercel, une
  // variable déclarée sans valeur arrive comme chaîne vide, pas comme
  // `undefined` (même piège que dans config/site.config.ts).
  if (!apiKey) return null;

  // Défaut à 2 : c'est la liste du compte (« Votre première liste »), et ce
  // n'est pas un secret. Même logique que SITE_DOMAIN, LAUNCH_DATE ou les
  // identifiants de mesure d'audience — le déploiement se faisant au push
  // sans configuration chez l'hébergeur, une valeur par défaut correcte évite
  // que le site fonctionne « à moitié ». Vérifié le 17 septembre 2026 : sans
  // ce défaut, une inscription en production créait bien le contact mais
  // SANS liste, donc invisible pour l'envoi du 2 octobre.
  const listId = Number.parseInt(process.env.BREVO_LIST_ID?.trim() || "2", 10);
  const welcome = Number.parseInt(process.env.BREVO_WELCOME_TEMPLATE_ID?.trim() || "", 10);
  const notif = Number.parseInt(process.env.BREVO_NOTIFICATION_TEMPLATE_ID?.trim() || "", 10);

  return {
    apiKey,
    listId: Number.isFinite(listId) ? listId : null,
    // L'expéditeur DOIT être un expéditeur vérifié dans le compte Brevo
    // (Settings > Senders). Une adresse non vérifiée fait répondre 400.
    senderEmail: process.env.BREVO_SENDER_EMAIL?.trim() || "contact@lerenversement.com",
    senderName: process.env.BREVO_SENDER_NAME?.trim() || "RENVERSEMENT",
    notificationEmail:
      process.env.BREVO_NOTIFICATION_EMAIL?.trim() || "contact@lerenversement.com",
    // Les comptes Brevo créés en français ont l'attribut NOM ; ceux créés en
    // anglais ont LASTNAME. D'où le réglage, plutôt qu'une valeur en dur.
    nameAttribute: process.env.BREVO_NAME_ATTRIBUTE?.trim() || "NOM",
    // Pas de défaut, volontairement : un attribut inconnu fait répondre 400,
    // et la route retenterait alors SANS AUCUN attribut — le nom serait perdu
    // avec le téléphone. Tant que l'attribut n'est pas créé dans Brevo
    // (Contacts > Attributs, type Texte), mieux vaut ne rien envoyer.
    phoneAttribute: process.env.BREVO_PHONE_ATTRIBUTE?.trim() || null,
    welcomeTemplateId: Number.isFinite(welcome) ? welcome : null,
    notificationTemplateId: Number.isFinite(notif) ? notif : null,
  };
}

export type BrevoResponse = {
  status: number;
  payload: Record<string, unknown> | null;
  raw: string;
};

export async function brevoFetch(
  config: BrevoConfig,
  path: string,
  body: unknown
): Promise<BrevoResponse> {
  const response = await fetch(`${BREVO_API}${path}`, {
    method: "POST",
    headers: {
      "api-key": config.apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  // Brevo répond en JSON, mais un 502 de passerelle renverrait du HTML que
  // `response.json()` ferait échouer avec une erreur illisible. On lit en
  // texte puis on parse, comme dans lib/formsubmit.ts.
  const raw = await response.text();
  let payload: Record<string, unknown> | null = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    /* réponse non-JSON — le code HTTP suffira à décider */
  }
  return { status: response.status, payload, raw };
}

export function isSuccess(response: BrevoResponse): boolean {
  return response.status >= 200 && response.status < 300;
}

/** Envoi d'un e-mail transactionnel composé dans lib/brevo-emails.ts. */
export function sendEmail(
  config: BrevoConfig,
  message: {
    to: { email: string; name?: string };
    replyTo: { email: string; name?: string };
    content: BrevoEmailContent;
  }
): Promise<BrevoResponse> {
  return brevoFetch(config, "/smtp/email", {
    sender: { name: config.senderName, email: config.senderEmail },
    to: [message.to],
    replyTo: message.replyTo,
    subject: message.content.subject,
    htmlContent: message.content.htmlContent,
    textContent: message.content.textContent,
  });
}

/** Validation d'adresse volontairement permissive, partagée par les routes :
 *  refuser une adresse valide mais exotique coûte plus cher qu'accepter une
 *  faute de frappe, que Brevo rejettera de toute façon. */
export function isPlausibleEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
