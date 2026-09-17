/**
 * Inscription au Cercle (§6.10) — relais serveur vers Brevo.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POURQUOI UNE ROUTE SERVEUR ICI, ALORS QU'ELLE AVAIT ÉTÉ SUPPRIMÉE
 * ────────────────────────────────────────────────────────────────────────────
 * Le 7 septembre 2026, `app/api/` avait été retiré : FormSubmit est derrière
 * Cloudflare, qui répond 403 aux appels partant des IP de Vercel. La leçon
 * portait sur FORMSUBMIT, pas sur le principe d'une route.
 *
 * L'API Brevo, elle, est une API serveur-à-serveur : elle attend justement des
 * appels d'IP de datacenter, il n'y a ni filtrage Cloudflare ni activation par
 * `Referer` à obtenir. Le blocage qui avait tué la route précédente ne peut
 * donc pas se reproduire ici.
 *
 * Et la route est OBLIGATOIRE : la clé API Brevo donne accès à l'ensemble du
 * compte (contacts, campagnes, facturation). Elle ne peut pas se retrouver
 * dans le bundle client, contrairement au jeton FormSubmit qui, lui, ne permet
 * que d'écrire dans une boîte. Pas de préfixe NEXT_PUBLIC_ sur BREVO_API_KEY,
 * jamais.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CE QUE FAIT LA ROUTE, DANS L'ORDRE
 * ────────────────────────────────────────────────────────────────────────────
 *   1. Crée le contact dans Brevo (et l'ajoute à la liste si BREVO_LIST_ID est
 *      défini). C'est cette étape qui décide du résultat renvoyé au visiteur.
 *   2. Envoie l'e-mail de bienvenue à l'inscrit·e.
 *   3. Envoie la notification à la boîte du client.
 *
 * Les étapes 2 et 3 sont « au mieux » : si un e-mail échoue alors que le
 * contact est créé, la personne EST inscrite et la route répond succès. Un
 * échec d'envoi est journalisé, pas remonté au visiteur — lui afficher une
 * erreur l'inviterait à se réinscrire, ce qui produirait un doublon.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * CONTRAT AVEC LE CLIENT (lib/subscribe.ts)
 * ────────────────────────────────────────────────────────────────────────────
 *   200 { ok: true }                          → inscrit
 *   409 { ok: false, reason: "duplicate" }    → déjà inscrit
 *   400 { ok: false, reason: "invalid" }      → champs manquants ou e-mail invalide
 *   503 { ok: false, reason: "brevo_not_configured" | "brevo_unavailable" }
 *                                             → le client BASCULE SUR FORMSUBMIT
 *
 * Le 503 n'est pas un détail : il garantit que le site ne régresse pas si la
 * variable d'environnement n'est pas encore posée chez l'hébergeur, alors que
 * le déploiement se fait au push.
 */

import { NextResponse } from "next/server";
import { buildWelcomeEmail, buildNotificationEmail } from "@/lib/brevo-emails";

const BREVO_API = "https://api.brevo.com/v3";

// Au-delà, on abandonne et on laisse le navigateur repartir vers FormSubmit.
// Sans ce garde-fou, une lenteur de Brevo bloquerait le visiteur jusqu'au
// délai d'exécution de la fonction Vercel (10 s), bouton figé sur
// « Inscription en cours… ».
const TIMEOUT_MS = 8000;

type Config = {
  apiKey: string;
  listId: number | null;
  senderEmail: string;
  senderName: string;
  notificationEmail: string;
  nameAttribute: string;
  welcomeTemplateId: number | null;
  notificationTemplateId: number | null;
};

function readConfig(): Config | null {
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
  const listId = Number.parseInt(
    process.env.BREVO_LIST_ID?.trim() || "2",
    10
  );
  const welcome = Number.parseInt(
    process.env.BREVO_WELCOME_TEMPLATE_ID?.trim() || "",
    10
  );
  const notif = Number.parseInt(
    process.env.BREVO_NOTIFICATION_TEMPLATE_ID?.trim() || "",
    10
  );

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
    welcomeTemplateId: Number.isFinite(welcome) ? welcome : null,
    notificationTemplateId: Number.isFinite(notif) ? notif : null,
  };
}

async function brevoFetch(
  config: Config,
  path: string,
  body: unknown
): Promise<{ status: number; payload: Record<string, unknown> | null; raw: string }> {
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

export async function POST(request: Request) {
  const config = readConfig();
  if (!config) {
    // Pas de clé : ce n'est PAS une erreur, c'est l'état d'un déploiement où
    // la variable n'a pas encore été posée. Le client repart vers FormSubmit.
    return NextResponse.json(
      { ok: false, reason: "brevo_not_configured" },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const source = String(body.source ?? "site-v1").trim();
  const honeypot = String(body.website ?? "").trim();

  // Champ-piège, re-contrôlé ici : le filtrage côté client (Section06Circle)
  // n'existe pas pour un robot qui appelle la route directement. On répond
  // « succès » sans rien envoyer — un refus explicite lui apprendrait à
  // contourner le champ.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  // Validation volontairement permissive : refuser des adresses valides mais
  // exotiques coûte plus cher qu'accepter une faute de frappe, que Brevo
  // rejettera de toute façon.
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });
  }

  const date = new Date().toISOString();

  // ─── 1. Création du contact ────────────────────────────────────────────────
  let contact: Awaited<ReturnType<typeof brevoFetch>>;
  try {
    contact = await brevoFetch(config, "/contacts", {
      email,
      attributes: { [config.nameAttribute]: name },
      listIds: config.listId ? [config.listId] : undefined,
      // `false` : on ne veut pas qu'une resoumission écrase silencieusement
      // les données d'un contact existant. Brevo répondra « duplicate », ce
      // qui est exactement l'information utile à afficher au visiteur.
      updateEnabled: false,
    });
  } catch (error) {
    // Réseau coupé, ou délai dépassé. Le visiteur ne doit pas perdre son
    // inscription : 503 ⇒ le navigateur repart vers FormSubmit.
    console.error("[Cercle] Brevo injoignable", error);
    return NextResponse.json(
      { ok: false, reason: "brevo_unavailable" },
      { status: 503 }
    );
  }

  const code = typeof contact.payload?.code === "string" ? contact.payload.code : null;

  if (code === "duplicate_parameter") {
    // Déjà inscrit. Pas de nouvel e-mail de bienvenue : la personne l'a déjà
    // reçu, et le lui renvoyer donnerait l'impression d'une seconde inscription.
    return NextResponse.json({ ok: false, reason: "duplicate" }, { status: 409 });
  }

  if (contact.status < 200 || contact.status >= 300) {
    console.error(
      "[Cercle] Brevo a refusé la création du contact",
      contact.status,
      contact.payload ?? contact.raw.slice(0, 300)
    );

    // Un 400 signale une requête mal formée — et le cas de loin le plus
    // probable est que l'attribut configuré n'existe pas dans ce compte Brevo
    // (`invalid_parameter`). Plutôt que de perdre l'inscription pour un nom de
    // champ, on retente une fois SANS attributs : l'adresse e-mail et
    // l'appartenance à la liste sont l'essentiel, le nom n'est qu'un confort.
    //
    // Le second essai est réservé au 400 : sur un 401 (clé invalide), un 403,
    // un 429 ou un 5xx, retirer les attributs ne change rien et ne ferait
    // qu'ajouter un aller-retour à chaque soumission.
    if (contact.status !== 400) {
      return NextResponse.json(
        { ok: false, reason: "brevo_unavailable" },
        { status: 503 }
      );
    }

    let retry: Awaited<ReturnType<typeof brevoFetch>> | null = null;
    try {
      retry = await brevoFetch(config, "/contacts", {
        email,
        listIds: config.listId ? [config.listId] : undefined,
        updateEnabled: false,
      });
    } catch (error) {
      console.error("[Cercle] Brevo injoignable au second essai", error);
    }

    if (!retry || retry.status < 200 || retry.status >= 300) {
      if (
        retry &&
        typeof retry.payload?.code === "string" &&
        retry.payload.code === "duplicate_parameter"
      ) {
        return NextResponse.json({ ok: false, reason: "duplicate" }, { status: 409 });
      }
      return NextResponse.json(
        { ok: false, reason: "brevo_unavailable" },
        { status: 503 }
      );
    }

    console.warn(
      `[Cercle] Contact créé SANS attribut « ${config.nameAttribute} ». ` +
        "Vérifier que cet attribut existe dans Brevo (Contacts > Attributs), " +
        "ou régler BREVO_NAME_ATTRIBUTE sur le nom réel du champ."
    );
  }

  // ─── 2 & 3. Les deux e-mails, en parallèle et « au mieux » ─────────────────
  // `allSettled` et non `all` : l'échec d'un envoi ne doit ni interrompre
  // l'autre, ni remonter au visiteur, qui est bel et bien inscrit.
  const welcome = buildWelcomeEmail(name);
  const notification = buildNotificationEmail({ name, email, source, date });

  const results = await Promise.allSettled([
    brevoFetch(config, "/smtp/email", {
      sender: { name: config.senderName, email: config.senderEmail },
      to: [{ email, name }],
      replyTo: { email: config.notificationEmail, name: config.senderName },
      ...(config.welcomeTemplateId
        ? // Modèle composé dans l'éditeur Brevo : le HTML de lib/brevo-emails
          // est ignoré, seuls les `params` sont transmis au modèle.
          { templateId: config.welcomeTemplateId, params: { NOM: name, PRENOM: name.split(/\s+/)[0] } }
        : {
            subject: welcome.subject,
            htmlContent: welcome.htmlContent,
            textContent: welcome.textContent,
          }),
    }),
    brevoFetch(config, "/smtp/email", {
      sender: { name: config.senderName, email: config.senderEmail },
      to: [{ email: config.notificationEmail }],
      // Un « Répondre » sur la notification écrit directement à l'inscrit·e.
      replyTo: { email, name },
      ...(config.notificationTemplateId
        ? {
            templateId: config.notificationTemplateId,
            params: { NOM: name, EMAIL: email, SOURCE: source, DATE: date },
          }
        : {
            subject: notification.subject,
            htmlContent: notification.htmlContent,
            textContent: notification.textContent,
          }),
    }),
  ]);

  const etiquettes = ["bienvenue → inscrit", "notification → boîte du client"];
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`[Cercle] E-mail ${etiquettes[index]} — envoi impossible`, result.reason);
      return;
    }
    if (result.value.status < 200 || result.value.status >= 300) {
      console.error(
        `[Cercle] E-mail ${etiquettes[index]} — Brevo a refusé (${result.value.status})`,
        result.value.payload ?? result.value.raw.slice(0, 300),
        // Le motif de loin le plus fréquent au premier déploiement.
        `— vérifier que ${config.senderEmail} est un expéditeur vérifié dans Brevo.`
      );
    }
  });

  return NextResponse.json({ ok: true });
}
