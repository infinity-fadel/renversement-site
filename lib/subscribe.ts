/**
 * Inscription au Cercle (§6.10) — point d'entrée UNIQUE pour les composants.
 *
 * `Section06Circle.tsx` appelle ceci et rien d'autre. Deux chemins derrière :
 *
 *   1. `/api/subscribe` → Brevo (contact + e-mail de bienvenue + notification).
 *      C'est la voie normale.
 *   2. FormSubmit depuis le navigateur (lib/formsubmit.ts) — SECOURS, utilisé
 *      seulement si la route répond qu'elle ne peut pas faire le travail.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * POURQUOI GARDER FORMSUBMIT EN SECOURS
 * ────────────────────────────────────────────────────────────────────────────
 * Le déploiement se fait au push, sans configuration chez l'hébergeur (cf.
 * CLAUDE.md). Si BREVO_API_KEY n'est pas encore posée — ou si Brevo est
 * indisponible — le formulaire cesserait purement et simplement de fonctionner,
 * et les inscriptions seraient perdues sans laisser de trace. Avec ce repli,
 * le pire des cas est de retomber sur le comportement d'avant Brevo.
 *
 * Le secours doit rester CÔTÉ NAVIGATEUR : FormSubmit est derrière Cloudflare,
 * qui répond 403 aux IP de Vercel. Le relayer depuis la route serveur ne
 * marcherait pas — c'est précisément ce qui avait fait supprimer `app/api/` le
 * 7 septembre 2026.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * QUAND ON BASCULE, ET QUAND ON NE BASCULE PAS
 * ────────────────────────────────────────────────────────────────────────────
 * On bascule sur un 503 (`brevo_not_configured`, `brevo_unavailable`), sur une
 * erreur réseau et sur un 5xx inattendu : dans tous ces cas la route n'a rien
 * pu enregistrer.
 *
 * On NE bascule PAS sur un 409 (doublon) ni sur un 400 (saisie invalide) :
 * Brevo a répondu, sa réponse fait autorité. Repartir vers FormSubmit y
 * enverrait un doublon que personne ne détecterait.
 */

import { subscribeToCircle as subscribeViaFormSubmit } from "@/lib/formsubmit";

/**
 * `reason` est libre, à une valeur près : **"duplicate"**, que
 * `Section06Circle` traite à part pour afficher « Cette adresse e-mail est
 * déjà inscrite. » Cette branche était inatteignable tant que FormSubmit était
 * seul en jeu (il ne déduplique pas) ; Brevo la rend de nouveau réelle.
 */
export type SubscribeResult = { ok: true } | { ok: false; reason: string };

export async function subscribeToCircle(fields: {
  name: string;
  email: string;
  source?: string;
}): Promise<SubscribeResult> {
  let response: Response;
  try {
    response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name,
        email: fields.email,
        source: fields.source ?? "site-v1",
      }),
    });
  } catch {
    // Réseau coupé côté visiteur. Le repli échouera probablement aussi, mais
    // il ne coûte rien de le tenter.
    console.warn("[Cercle] /api/subscribe injoignable — repli sur FormSubmit");
    return subscribeViaFormSubmit(fields);
  }

  const raw = await response.text();
  let payload: { ok?: boolean; reason?: string } | null = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    /* réponse non-JSON — traitée comme un échec ci-dessous */
  }

  if (response.ok && payload?.ok) {
    return { ok: true };
  }

  if (response.status === 409 || payload?.reason === "duplicate") {
    return { ok: false, reason: "duplicate" };
  }

  if (response.status === 400) {
    return { ok: false, reason: payload?.reason ?? "invalid" };
  }

  // Tout le reste (503, 500, réponse illisible) : Brevo n'a rien enregistré,
  // on tente le secours. Le message de journal est explicite parce que c'est
  // le seul signal qu'une configuration manque — le visiteur, lui, ne verra
  // aucune différence.
  console.warn(
    `[Cercle] Brevo indisponible (${response.status} / ${payload?.reason ?? "inconnu"}) — repli sur FormSubmit`
  );
  return subscribeViaFormSubmit(fields);
}
