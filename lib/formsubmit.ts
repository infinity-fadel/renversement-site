/**
 * Inscription au Cercle (§6.10) — envoi vers FormSubmit DEPUIS LE NAVIGATEUR.
 *
 * Pourquoi pas depuis le serveur, comme c'était le cas jusqu'au 7 septembre
 * 2026 : FormSubmit est derrière Cloudflare, qui filtre sur l'appelant. Le
 * même appel, en-têtes identiques, passe en 200 depuis une IP résidentielle
 * et repart en 403 depuis Vercel. Aucun réglage d'en-tête n'y change rien —
 * la requête doit partir d'une IP de visiteur, donc du navigateur.
 *
 * CONTREPARTIE ASSUMÉE : le jeton ci-dessous est dans le bundle client, donc
 * public. N'importe qui peut s'en servir pour envoyer des messages dans la
 * boîte du client. C'est le mode d'emploi normal de FormSubmit, et c'est
 * précisément le rôle du jeton : l'ADRESSE, elle, reste protégée — elle
 * n'apparaît ni dans le code, ni dans l'URL appelée. Arbitrage rendu par le
 * client, alternative écartée : un vrai service d'envoi (Resend, Brevo, §9.3)
 * qui imposerait une clé d'API, donc une variable à configurer chez
 * l'hébergeur — ce que le déploiement au push doit éviter.
 *
 * ACTIVATION — le piège à connaître. FormSubmit indexe l'activation par couple
 * (destinataire, Referer). Le `Referer` est désormais posé par le navigateur
 * et NE PEUT PAS être surchargé : c'est un en-tête interdit en `fetch`. Le
 * domaine réellement servi doit donc être activé, sans quoi FormSubmit répond
 * 200 avec success:"false" et rien n'arrive.
 *
 * Domaines activés : lerenversement.com, renversement.africa,
 * www.lerenversement.com (le domaine canonique — l'apex redirige en 308 vers
 * lui). Tout nouveau domaine devra être activé par un clic dans la boîte.
 */

// Jeton de la boîte contact@lerenversement.com. Public par construction, voir
// ci-dessus — ne pas le traiter comme un secret, mais ne pas le publier
// ailleurs non plus.
const FORMSUBMIT_TOKEN = "393e4933fa84c67511c32586134bbb7d";

const ENDPOINT = `https://formsubmit.co/ajax/${FORMSUBMIT_TOKEN}`;

export type SubscribeResult = { ok: true } | { ok: false; reason: string };

/**
 * Envoi générique vers la boîte du client. Utilisé par l'inscription au Cercle
 * ci-dessous et, depuis la V2, en secours des formulaires de commande et de
 * contact (lib/submit-form.ts). `fields` devient le tableau du message :
 * les clés servent d'intitulés, d'où leur forme lisible (« Nom », « E-mail »).
 */
export async function sendToFormSubmit(
  subject: string,
  fields: Record<string, string>,
  logLabel = "Cercle"
): Promise<SubscribeResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...fields,
        Date: new Date().toISOString(),
        _subject: subject,
        _template: "table",
        // Le captcha de FormSubmit suppose l'affichage de SA page ; en mode
        // ajax personne ne le voit, donc personne ne le résout. Le champ-piège
        // du formulaire est notre garde-fou anti-robot.
        _captcha: "false",
      }),
    });
  } catch {
    // Réseau coupé, ou bloqueur de publicité qui filtre formsubmit.co.
    return { ok: false, reason: "network" };
  }

  // Piège : un refus d'activation arrive en HTTP 200. `response.ok` ne suffit
  // donc pas — il faut lire le corps. Et un blocage Cloudflare renvoie du
  // HTML, que JSON.parse rejetterait : on lit en texte d'abord.
  const raw = await response.text();
  let payload: { success?: string | boolean; message?: string } | null = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    /* réponse non-JSON — traitée comme un échec ci-dessous */
  }

  // FormSubmit renvoie `success` en CHAÎNE ("true"), pas en booléen.
  const succeeded =
    response.ok && (payload?.success === "true" || payload?.success === true);

  if (!succeeded) {
    console.error(
      `[${logLabel}] FormSubmit a refusé la soumission`,
      response.status,
      payload?.message ?? raw.slice(0, 300)
    );
    return { ok: false, reason: payload?.message ?? "upstream_failed" };
  }

  return { ok: true };
}

export async function subscribeToCircle(fields: {
  name: string;
  email: string;
  phone?: string;
  source?: string;
}): Promise<SubscribeResult> {
  return sendToFormSubmit("RENVERSEMENT — nouvelle inscription au Cercle", {
    Nom: fields.name,
    "E-mail": fields.email,
    ...(fields.phone ? { "Téléphone / WhatsApp": fields.phone } : {}),
    Consentement: "Oui",
    Source: fields.source ?? "site-v1",
  });
}
