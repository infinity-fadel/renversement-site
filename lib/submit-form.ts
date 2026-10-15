/**
 * Envoi des formulaires de commande et de contact de la V2 — point d'entrée
 * unique pour les composants, sur le modèle de lib/subscribe.ts.
 *
 *   1. La route serveur (`/api/order`, `/api/contact`) → Brevo. Voie normale.
 *   2. FormSubmit depuis le navigateur — SECOURS, seulement si la route n'a
 *      rien pu enregistrer (503, réseau, 5xx). Jamais sur un 400 : la saisie a
 *      été refusée, la renvoyer ailleurs ne la rendrait pas valide.
 *
 * Les raisons du secours côté navigateur (Cloudflare refuse les IP de Vercel)
 * sont détaillées dans lib/subscribe.ts et lib/formsubmit.ts.
 */

import { sendToFormSubmit, type SubscribeResult } from "@/lib/formsubmit";

export async function submitForm({
  endpoint,
  payload,
  fallback,
  logLabel,
}: {
  endpoint: string;
  payload: Record<string, unknown>;
  /** Ce que reçoit FormSubmit si la route échoue : objet et tableau lisible. */
  fallback: { subject: string; fields: Record<string, string> };
  logLabel: string;
}): Promise<SubscribeResult> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    console.warn(`[${logLabel}] ${endpoint} injoignable — repli sur FormSubmit`);
    return sendToFormSubmit(fallback.subject, fallback.fields, logLabel);
  }

  const raw = await response.text();
  let body: { ok?: boolean; reason?: string } | null = null;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    /* réponse non-JSON — traitée comme un échec ci-dessous */
  }

  if (response.ok && body?.ok) return { ok: true };

  if (response.status === 400) {
    console.warn(`[${logLabel}] Saisie refusée par la route (${body?.reason ?? "invalid"})`);
    return { ok: false, reason: body?.reason ?? "invalid" };
  }

  console.warn(
    `[${logLabel}] Brevo indisponible (${response.status} / ${body?.reason ?? "inconnu"}) — repli sur FormSubmit`
  );
  return sendToFormSubmit(fallback.subject, fallback.fields, logLabel);
}
