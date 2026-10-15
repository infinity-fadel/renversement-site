/**
 * E-mails des formulaires de la V2 : commande et contact.
 *
 * Même coquille et mêmes couleurs que les e-mails du Cercle
 * (lib/brevo-emails.ts), dont ce fichier réemploie `shell` et `escapeHtml`.
 *
 * ⚠ TEXTES À FAIRE VALIDER PAR LE CLIENT — en particulier la confirmation de
 * commande, qui part chez l'acheteur. Ils sont volontairement factuels : ils
 * récapitulent ce qui a été saisi et n'engagent sur aucun délai de livraison,
 * aucune information que la maquette ne donne pas.
 */

import { BOOK } from "@/config/v2.content";
import { SITE_CONFIG } from "@/config/site.config";
import {
  GRIS_CLAIR,
  OR,
  escapeHtml,
  shell,
  type BrevoEmailContent,
} from "@/lib/brevo-emails";

export type OrderFields = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  quantity: number;
};

export type ContactFields = {
  name: string;
  email: string;
  organization: string;
  subject: string;
  phone: string;
  message: string;
};

/** Montant affiché, au format ivoirien : « 50 000 FCFA ». */
export function formatFcfa(amount: number): string {
  // Espace insécable fine en séparateur de milliers, posée à la main :
  // `toLocaleString("fr-FR")` en dépend de l'ICU du serveur.
  return `${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}

function title(text: string): string {
  return `
          <tr>
            <td>
              <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;color:${OR};text-align:center;">
                ${text}
              </p>
            </td>
          </tr>`;
}

function details(rows: [string, string][]): string {
  const ligne = ([label, value]: [string, string]) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(232,230,225,0.1);">
                    <span style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(232,230,225,0.4);">${label}</span><br>
                    <span style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:${GRIS_CLAIR};white-space:pre-line;">${escapeHtml(value)}</span>
                  </td>
                </tr>`;
  return `
          <tr>
            <td>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${rows.map(ligne).join("")}
              </table>
            </td>
          </tr>`;
}

function paragraph(html: string): string {
  return `
          <tr>
            <td>
              <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:rgba(232,230,225,0.75);">
                ${html}
              </p>
            </td>
          </tr>`;
}

const asText = (rows: [string, string][]) =>
  rows.map(([label, value]) => `${label} : ${value}`).join("\n");

function orderRows(order: OrderFields): [string, string][] {
  return [
    ["Nom et prénoms", order.name],
    ["Téléphone", order.phone],
    ["Adresse e-mail", order.email],
    ["Lieu de livraison", order.address],
    ["Ville ou commune", order.city],
    ["Quantité", String(order.quantity)],
    ["Montant (hors livraison)", formatFcfa(order.quantity * BOOK.unitPrice)],
  ];
}

/** Commande → boîte du client. C'est l'ENREGISTREMENT de la commande. */
export function buildOrderNotification(order: OrderFields, date: string): BrevoEmailContent {
  const rows: [string, string][] = [...orderRows(order), ["Date", date]];
  return {
    subject: `${SITE_CONFIG.name} — nouvelle commande (${order.quantity} ex., ${order.city})`,
    htmlContent: shell(
      title("Nouvelle commande") +
        details(rows) +
        paragraph("Paiement à la livraison. Répondre à ce message écrit directement à l'acheteur.")
    ),
    textContent: `Nouvelle commande\n\n${asText(rows)}\n\nPaiement à la livraison.`,
  };
}

/** Commande → acheteur, récapitulatif. */
export function buildOrderConfirmation(order: OrderFields): BrevoEmailContent {
  const prenom = order.name.trim().split(/\s+/)[0] || "";
  const rows = orderRows(order);
  return {
    subject: `${SITE_CONFIG.name} — votre commande est enregistrée`,
    htmlContent: shell(
      title("Votre commande est enregistrée.") +
        paragraph(prenom ? `Bonjour ${escapeHtml(prenom)},` : "Bonjour,") +
        paragraph(
          "Merci pour votre commande de <em>RENVERSEMENT</em>. Notre équipe vous contactera pour organiser la livraison. Le paiement se fait à la livraison, frais de livraison compris."
        ) +
        details(rows)
    ),
    textContent: `Votre commande est enregistrée.

${prenom ? `Bonjour ${prenom},` : "Bonjour,"}

Merci pour votre commande de RENVERSEMENT. Notre équipe vous contactera pour organiser la livraison. Le paiement se fait à la livraison, frais de livraison compris.

${asText(rows)}`,
  };
}

/** Formulaire de contact → boîte du client. */
export function buildContactNotification(contact: ContactFields, date: string): BrevoEmailContent {
  const rows: [string, string][] = [
    ["Nom et prénoms", contact.name],
    ["Adresse e-mail", contact.email],
    ["Organisation / entreprise", contact.organization],
    ["Téléphone", contact.phone],
    ["Objet", contact.subject],
    ["Message", contact.message],
    ["Date", date],
  ];
  return {
    subject: `${SITE_CONFIG.name} — contact : ${contact.subject}`,
    htmlContent: shell(title("Nouvelle demande de contact") + details(rows)),
    textContent: `Nouvelle demande de contact\n\n${asText(rows)}`,
  };
}
