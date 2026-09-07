import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/config/site.config";

/**
 * Inscription au Cercle (§6.10) — relais vers FormSubmit.
 *
 * L'appel à FormSubmit se fait ICI, côté serveur, et non depuis le navigateur :
 *  - l'adresse de destination (ou le jeton) ne part jamais dans le bundle
 *    client, où n'importe qui pourrait la récupérer pour spammer la boîte ;
 *  - les champs sont validés avant d'être relayés, plutôt que de faire
 *    confiance à ce que le navigateur envoie ;
 *  - le contrat de réponse attendu par Section09Circle.tsx reste inchangé.
 *
 * Configuration : `FORMSUBMIT_TARGET` (sans préfixe NEXT_PUBLIC_, c'est une
 * variable serveur) reçoit l'adresse e-mail de destination, ou le jeton que
 * FormSubmit fournit après la première activation — le jeton est préférable,
 * il évite d'exposer l'adresse même côté serveur.
 *
 * L'adresse validée par le client (contact@lerenversement.com) est le repli
 * codé ici, comme la date de lancement et les identifiants de mesure d'audience
 * dans config/site.config.ts : le formulaire doit fonctionner même si la
 * variable n'est pas configurée chez l'hébergeur, sinon chaque inscription
 * part en 500. Ce repli reste côté serveur — il ne part pas dans le bundle
 * client, la propriété que protège l'absence de NEXT_PUBLIC_.
 *
 * ATTENTION à la première mise en service : FormSubmit n'envoie rien tant que
 * l'adresse n'a pas été confirmée. La toute première soumission déclenche un
 * e-mail d'activation contenant un lien à cliquer. Tant que ce n'est pas fait,
 * le formulaire répondra « succès » côté visiteur mais aucun message n'arrivera.
 */

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/";

// Jeton FormSubmit de la boîte contact@lerenversement.com, obtenu après
// activation. Préféré à l'adresse en clair : le dépôt ne contient donc aucune
// adresse e-mail exploitable, et l'URL appelée n'en transporte pas non plus.
// Surchargé par FORMSUBMIT_TARGET (autre jeton, ou boîte de recette).
const FALLBACK_TARGET = "393e4933fa84c67511c32586134bbb7d";

// Domaine sous lequel le formulaire a été ACTIVÉ chez FormSubmit.
//
// NE PAS remplacer par SITE_URL, même si les deux valeurs coïncident
// aujourd'hui. FormSubmit indexe l'activation par couple (destinataire,
// Referer) : vérifié, le même jeton envoyé avec un Referer non activé repart
// en « This form needs Activation » et l'inscription est perdue. Branché sur
// SITE_URL, le formulaire tomberait donc en 502 silencieusement au prochain
// changement de domaine, jusqu'à ce que quelqu'un reclique un lien
// d'activation reçu dans une boîte à laquelle il n'a pas forcément accès.
//
// Cet en-tête n'est pas une vérité de navigateur (l'appel est
// serveur-à-serveur) : c'est uniquement la clé d'enregistrement chez
// FormSubmit. Elle doit rester figée et valoir un domaine activé.
//
// Domaines activés à ce jour, tous deux vérifiés : lerenversement.com et
// renversement.africa. L'un est donc le filet de l'autre.
const FORMSUBMIT_ORIGIN = "https://lerenversement.com";

// Volontairement permissive : le rôle de cette expression est d'écarter les
// saisies manifestement invalides, pas de statuer sur la validité réelle d'une
// adresse — seul un envoi peut le faire.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_NAME = 120;
const MAX_EMAIL = 200;

export async function POST(request: Request) {
  // `||` et non `??` : chez Vercel, une variable déclarée sans valeur arrive
  // comme chaîne vide et non comme `undefined` — même piège que SITE_DOMAIN.
  const target = process.env.FORMSUBMIT_TARGET?.trim() || FALLBACK_TARGET;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const name = String(data?.name ?? "").trim();
  const email = String(data?.email ?? "").trim();
  const consent = data?.consent === true;
  const honeypot = String(data?.website ?? "").trim();

  // Champ-piège : invisible pour un humain, rempli par les robots qui
  // complètent aveuglément tous les champs. On répond « succès » sans rien
  // relayer — un refus explicite apprendrait au robot à le contourner.
  if (honeypot) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  if (!name || name.length > MAX_NAME) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json({ error: "consent_required" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${FORMSUBMIT_ENDPOINT}${encodeURIComponent(target)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // FormSubmit REFUSE toute requête sans `Referer` : il répond 200
          // avec success:"false" et le message trompeur « Make sure you open
          // this page through a web server… », qui laisse croire à un
          // problème de serveur local alors qu'il manque juste l'en-tête.
          // Un navigateur le pose tout seul ; un fetch serveur-à-serveur non.
          Referer: `${FORMSUBMIT_ORIGIN}/`,
          Origin: FORMSUBMIT_ORIGIN,
          // FormSubmit est derrière Cloudflare, qui filtre sur l'empreinte de
          // l'appelant. Depuis une IP résidentielle la requête passe même sans
          // ces en-têtes ; depuis une IP de datacenter (Vercel) elle repart en
          // 403 avec une page HTML de blocage — pas du JSON, d'où un message
          // d'erreur vide si on la lit sans précaution (voir plus bas).
          // Un `fetch` Node n'envoie aucun User-Agent par défaut : c'est le
          // signal le plus voyant pour Cloudflare, on le comble.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          Nom: name,
          "E-mail": email,
          Consentement: "Oui",
          Source: String(data?.source ?? "site-v1"),
          Date: new Date().toISOString(),
          _subject: `${SITE_CONFIG.name} — nouvelle inscription au Cercle`,
          _template: "table",
          // Le visiteur ne voit jamais la page de FormSubmit (appel serveur),
          // son captcha n'aurait donc personne pour le résoudre.
          _captcha: "false",
        }),
      }
    );

    // On lit d'ABORD en texte. Un refus de Cloudflare est une page HTML :
    // `upstream.json()` échouait alors silencieusement et le journal
    // n'affichait qu'un « undefined » indiagnosticable. Le texte brut, lui,
    // dit toujours quelque chose.
    const raw = await upstream.text();

    // FormSubmit renvoie `success` en CHAÎNE ("true"), pas en booléen.
    let result: { success?: string | boolean; message?: string } | null = null;
    try {
      result = JSON.parse(raw);
    } catch {
      // réponse non-JSON : `raw` est journalisé ci-dessous
    }

    const ok =
      upstream.ok &&
      (result?.success === "true" || result?.success === true);

    if (!ok) {
      console.error(
        "[/api/subscribe] FormSubmit a refusé la soumission",
        upstream.status,
        result?.message ?? `réponse non-JSON: ${raw.slice(0, 300)}`
      );
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/subscribe] appel à FormSubmit impossible", err);
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
