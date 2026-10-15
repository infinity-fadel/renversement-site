/**
 * Formulaire de contact de la V2 (maquette, nœud `40:875`) : interviews,
 * invitations, partenariats, distribution, commandes institutionnelles.
 *
 * Le message part dans la boîte du client, « Répondre » écrivant directement
 * à l'expéditeur. Pas d'accusé à l'expéditeur : la maquette n'en prévoit pas,
 * et l'affichage de confirmation suffit. Contrat et repli : lib/form-route.ts.
 */

import { NextResponse } from "next/server";
import { isPlausibleEmail } from "@/lib/brevo-server";
import { deliver, invalid, readBody, text } from "@/lib/form-route";
import { buildContactNotification } from "@/lib/v2-emails";

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return invalid();

  if (text(body, "website")) return NextResponse.json({ ok: true });

  const contact = {
    name: text(body, "name"),
    email: text(body, "email").toLowerCase(),
    organization: text(body, "organization"),
    subject: text(body, "subject"),
    phone: text(body, "phone", 40),
    message: text(body, "message", 5000),
  };

  // Tous les champs sont marqués obligatoires dans la maquette.
  if (
    !contact.name ||
    !contact.organization ||
    !contact.subject ||
    !contact.phone ||
    !contact.message ||
    !isPlausibleEmail(contact.email)
  ) {
    return invalid();
  }

  return deliver({
    label: "Contact",
    notification: buildContactNotification(contact, new Date().toISOString()),
    replyTo: { email: contact.email, name: contact.name },
  });
}
