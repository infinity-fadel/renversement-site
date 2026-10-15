/**
 * Formulaire de commande de la V2 (maquette, nœud `30:543`).
 *
 * Paiement à la livraison : pas de transaction ici, la commande est
 * transmise par e-mail à l'équipe (qui organise la livraison) et récapitulée à
 * l'acheteur. Contrat et repli : voir lib/form-route.ts.
 */

import { NextResponse } from "next/server";
import { isPlausibleEmail } from "@/lib/brevo-server";
import { deliver, invalid, readBody, text } from "@/lib/form-route";
import { buildOrderConfirmation, buildOrderNotification } from "@/lib/v2-emails";

/** Garde-fou contre une saisie aberrante ; une commande plus importante
 *  relève de la « commande institutionnelle » du formulaire de contact. */
const MAX_QUANTITY = 50;

export async function POST(request: Request) {
  const body = await readBody(request);
  if (!body) return invalid();

  // Champ-piège : « succès » sans rien envoyer (cf. /api/subscribe).
  if (text(body, "website")) return NextResponse.json({ ok: true });

  const order = {
    name: text(body, "name"),
    phone: text(body, "phone", 40),
    email: text(body, "email").toLowerCase(),
    address: text(body, "address", 300),
    city: text(body, "city", 120),
    quantity: Number.parseInt(String(body.quantity ?? ""), 10),
  };

  if (
    !order.name ||
    !order.phone ||
    !order.address ||
    !order.city ||
    !isPlausibleEmail(order.email) ||
    !Number.isInteger(order.quantity) ||
    order.quantity < 1 ||
    order.quantity > MAX_QUANTITY
  ) {
    return invalid();
  }

  return deliver({
    label: "Commande",
    notification: buildOrderNotification(order, new Date().toISOString()),
    replyTo: { email: order.email, name: order.name },
    acknowledgement: buildOrderConfirmation(order),
  });
}
