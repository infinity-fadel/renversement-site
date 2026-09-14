/**
 * Contenu des deux e-mails envoyés à chaque inscription au Cercle (§6.10).
 *
 * Séparé de la route pour que les TEXTES restent modifiables sans toucher à la
 * logique d'envoi. Deux messages, deux destinataires :
 *
 *   1. `buildWelcomeEmail`      → l'inscrit·e ; souhaite la bienvenue au Cercle.
 *   2. `buildNotificationEmail` → contact@lerenversement.com ; annonce l'inscription.
 *
 * ⚠ TEXTES À FAIRE VALIDER PAR LE CLIENT. Le reste du site suit des
 * formulations validées mot à mot (cf. CLAUDE.md) ; ces deux messages sont
 * nouveaux. Ils réemploient volontairement des phrases déjà validées ailleurs
 * — « Votre place est réservée. », « Le Cercle des premiers observateurs »,
 * la tagline — plutôt que d'inventer un registre parallèle.
 *
 * Si le client préfère composer ces e-mails dans l'éditeur visuel de Brevo,
 * renseigner BREVO_WELCOME_TEMPLATE_ID / BREVO_NOTIFICATION_TEMPLATE_ID : la
 * route utilise alors le modèle Brevo et ignore le HTML ci-dessous (voir
 * app/api/subscribe/route.ts).
 */

import { SITE_CONFIG, SITE_URL } from "@/config/site.config";

// Or bronze du logo (cf. token `terracota`, tailwind.config.ts). En dur ici :
// un e-mail n'a pas accès à Tailwind, et le HTML doit porter ses couleurs.
const OR = "#B4742A";
const NOIR = "#0A0A0A";
const GRIS_CLAIR = "#E8E6E1";

// PNG et non WebP : Outlook pour Windows ne sait toujours pas afficher le WebP,
// et public/logo/ contient justement les deux formats.
const LOGO_URL = `${SITE_URL}/logo/R-or.png`;

export type BrevoEmailContent = {
  subject: string;
  htmlContent: string;
  textContent: string;
};

/**
 * Coquille commune aux deux messages.
 *
 * Écrite en `<table>` et en styles en ligne — pas en flex/grid ni en
 * `<style>` : la plupart des clients de messagerie (Outlook en tête) ignorent
 * les feuilles de style et ne connaissent pas la mise en page moderne. C'est
 * du HTML d'e-mail, volontairement archaïque.
 */
function shell(body: string): string {
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:${NOIR};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${NOIR};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="${LOGO_URL}" width="48" height="48" alt="${SITE_CONFIG.name}" style="display:block;border:0;">
            </td>
          </tr>
          ${body}
          <tr>
            <td align="center" style="padding-top:40px;border-top:1px solid rgba(232,230,225,0.12);">
              <p style="margin:24px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;letter-spacing:0.12em;text-transform:uppercase;color:rgba(232,230,225,0.35);">
                ${SITE_CONFIG.name}
              </p>
              <p style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:rgba(232,230,225,0.35);">
                <a href="${SITE_URL}" style="color:rgba(232,230,225,0.35);text-decoration:none;">${SITE_CONFIG.domain}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Message envoyé à la personne qui vient de s'inscrire. */
export function buildWelcomeEmail(name: string): BrevoEmailContent {
  // Le prénom seul sonne plus juste qu'un « Bonjour Nom Prénom » ; on retombe
  // sur le champ complet s'il ne contient qu'un mot.
  const prenom = name.trim().split(/\s+/)[0] || "";
  // Deux variantes : le nom vient d'un formulaire public, il doit être échappé
  // pour la partie HTML — mais surtout PAS pour la partie texte, où « O'Brien »
  // s'afficherait alors « O&#39;Brien ».
  const salutationHtml = prenom ? `Bonjour ${escapeHtml(prenom)},` : "Bonjour,";
  const salutationTexte = prenom ? `Bonjour ${prenom},` : "Bonjour,";

  const htmlContent = shell(`
          <tr>
            <td align="center">
              <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;color:${OR};">
                Votre place est réservée.
              </p>
              <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:${GRIS_CLAIR};">
                ${salutationHtml}
              </p>
              <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:rgba(232,230,225,0.75);">
                Vous faites désormais partie du <strong style="color:${GRIS_CLAIR};font-weight:normal;">${SITE_CONFIG.circleName}</strong>.
              </p>
              <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:rgba(232,230,225,0.75);">
                Vous serez parmi les premiers à voir les certitudes basculer.
                D'ici là, nous vous écrirons peu — et seulement lorsque cela en
                vaudra la peine.
              </p>
              <p style="margin:32px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;font-style:italic;color:${OR};">
                ${SITE_CONFIG.tagline}
              </p>
            </td>
          </tr>`);

  const textContent = `Votre place est réservée.

${salutationTexte}

Vous faites désormais partie du ${SITE_CONFIG.circleName}.

Vous serez parmi les premiers à voir les certitudes basculer. D'ici là, nous vous écrirons peu — et seulement lorsque cela en vaudra la peine.

${SITE_CONFIG.tagline}

${SITE_CONFIG.name} — ${SITE_URL}`;

  return {
    subject: `Bienvenue dans le ${SITE_CONFIG.circleName}`,
    htmlContent,
    textContent,
  };
}

/**
 * Message envoyé à la boîte du client à chaque inscription.
 *
 * Sobre et informatif : c'est un accusé interne, pas une pièce de marque. Le
 * `replyTo` est posé sur l'adresse de l'inscrit·e par la route, de sorte
 * qu'un simple « Répondre » écrive directement à la personne.
 */
export function buildNotificationEmail(fields: {
  name: string;
  email: string;
  source: string;
  date: string;
}): BrevoEmailContent {
  const ligne = (label: string, value: string) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid rgba(232,230,225,0.1);">
              <span style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(232,230,225,0.4);">${label}</span><br>
              <span style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:${GRIS_CLAIR};">${escapeHtml(value)}</span>
            </td>
          </tr>`;

  const htmlContent = shell(`
          <tr>
            <td>
              <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.5;color:${OR};text-align:center;">
                Nouvelle inscription au Cercle
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${ligne("Nom et prénom", fields.name)}
                ${ligne("Adresse e-mail", fields.email)}
                ${ligne("Source", fields.source)}
                ${ligne("Date", fields.date)}
              </table>
            </td>
          </tr>`);

  const textContent = `Nouvelle inscription au Cercle

Nom et prénom : ${fields.name}
Adresse e-mail : ${fields.email}
Source : ${fields.source}
Date : ${fields.date}`;

  return {
    subject: `${SITE_CONFIG.name} — nouvelle inscription au Cercle`,
    htmlContent,
    textContent,
  };
}

/**
 * Les valeurs viennent d'un formulaire public : elles sont injectées dans du
 * HTML, donc échappées. Sans cela, un nom contenant `<script>` partirait tel
 * quel dans la boîte du client.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
