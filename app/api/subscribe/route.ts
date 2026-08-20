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
 * Configuration : définir `FORMSUBMIT_TARGET` (sans préfixe NEXT_PUBLIC_, c'est
 * une variable serveur) avec l'adresse e-mail de destination, ou le jeton que
 * FormSubmit fournit après la première activation — le jeton est préférable,
 * il évite d'exposer l'adresse même côté serveur.
 *
 * ATTENTION à la première mise en service : FormSubmit n'envoie rien tant que
 * l'adresse n'a pas été confirmée. La toute première soumission déclenche un
 * e-mail d'activation contenant un lien à cliquer. Tant que ce n'est pas fait,
 * le formulaire répondra « succès » côté visiteur mais aucun message n'arrivera.
 */

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ajax/";

// Volontairement permissive : le rôle de cette expression est d'écarter les
// saisies manifestement invalides, pas de statuer sur la validité réelle d'une
// adresse — seul un envoi peut le faire.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX_NAME = 120;
const MAX_EMAIL = 200;

export async function POST(request: Request) {
  const target = process.env.FORMSUBMIT_TARGET;
  if (!target) {
    // Panne de configuration, pas erreur du visiteur : on la journalise et on
    // renvoie 500 pour que le client affiche son message d'erreur technique.
    console.error(
      "[/api/subscribe] FORMSUBMIT_TARGET n'est pas défini — inscription impossible."
    );
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

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

    // FormSubmit renvoie `success` en CHAÎNE ("true"), pas en booléen.
    const result = (await upstream.json().catch(() => null)) as {
      success?: string | boolean;
      message?: string;
    } | null;

    const ok =
      upstream.ok &&
      (result?.success === "true" || result?.success === true);

    if (!ok) {
      console.error(
        "[/api/subscribe] FormSubmit a refusé la soumission",
        upstream.status,
        result?.message
      );
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[/api/subscribe] appel à FormSubmit impossible", err);
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }
}
