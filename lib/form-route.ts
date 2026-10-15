/**
 * Socle commun des routes « formulaire → e-mail » de la V2 (commande, contact).
 *
 * Contrat identique à celui de /api/subscribe, côté navigateur comme côté
 * serveur (cf. CLAUDE.md, « Contrat de la route ») :
 *   200 { ok: true }                → enregistré
 *   400 { ok: false, "invalid" }    → saisie refusée, pas de repli
 *   503 { ok: false, "brevo_*" }    → rien d'enregistré, le navigateur
 *                                     BASCULE SUR FORMSUBMIT
 *
 * Différence de fond avec l'inscription : ici il n'y a pas de contact Brevo
 * à créer. L'e-mail envoyé à la boîte du client EST l'enregistrement de la
 * commande ou du message. Il ne peut donc pas être « au mieux » : s'il échoue,
 * la route répond 503 pour que la demande parte par le secours plutôt que
 * d'être perdue. Seul l'accusé à l'expéditeur reste « au mieux ».
 */

import { NextResponse } from "next/server";
import type { BrevoEmailContent } from "@/lib/brevo-emails";
import { isSuccess, readBrevoConfig, sendEmail } from "@/lib/brevo-server";

export const invalid = () =>
  NextResponse.json({ ok: false, reason: "invalid" }, { status: 400 });

const unavailable = (reason: string) =>
  NextResponse.json({ ok: false, reason }, { status: 503 });

/** Lit le corps JSON ; `null` si illisible. */
export async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Champ texte nettoyé et borné — les valeurs viennent d'un formulaire public. */
export function text(body: Record<string, unknown>, key: string, max = 200): string {
  return String(body[key] ?? "").trim().slice(0, max);
}

export async function deliver({
  label,
  notification,
  replyTo,
  acknowledgement,
}: {
  /** Préfixe des journaux, ex. « Commande ». */
  label: string;
  notification: BrevoEmailContent;
  /** L'expéditeur du formulaire : « Répondre » sur la notification lui écrit. */
  replyTo: { email: string; name: string };
  /** Accusé envoyé à l'expéditeur, facultatif et « au mieux ». */
  acknowledgement?: BrevoEmailContent;
}) {
  const config = readBrevoConfig();
  if (!config) return unavailable("brevo_not_configured");

  try {
    const sent = await sendEmail(config, {
      to: { email: config.notificationEmail },
      replyTo,
      content: notification,
    });
    if (!isSuccess(sent)) {
      console.error(
        `[${label}] Brevo a refusé la notification (${sent.status})`,
        sent.payload ?? sent.raw.slice(0, 300),
        `— vérifier que ${config.senderEmail} est un expéditeur vérifié dans Brevo.`
      );
      return unavailable("brevo_unavailable");
    }
  } catch (error) {
    console.error(`[${label}] Brevo injoignable`, error);
    return unavailable("brevo_unavailable");
  }

  if (acknowledgement) {
    try {
      const ack = await sendEmail(config, {
        to: replyTo,
        replyTo: { email: config.notificationEmail, name: config.senderName },
        content: acknowledgement,
      });
      if (!isSuccess(ack)) {
        console.error(
          `[${label}] Accusé à l'expéditeur refusé (${ack.status})`,
          ack.payload ?? ack.raw.slice(0, 300)
        );
      }
    } catch (error) {
      // La demande est enregistrée : un accusé manqué ne doit pas faire
      // croire au visiteur que tout a échoué (il recommencerait — doublon).
      console.error(`[${label}] Accusé à l'expéditeur impossible`, error);
    }
  }

  return NextResponse.json({ ok: true });
}
