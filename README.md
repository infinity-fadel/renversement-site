# RENVERSEMENT — Site V1 "Coming Soon"

Squelette Next.js (App Router) + TypeScript + Tailwind, conforme au cahier
des charges V1 (12 sections, 00 → 11).

## Installation

```bash
npm install
cp .env.example .env.local
# éditer .env.local : renseigner NEXT_PUBLIC_SITE_DOMAIN
npm run dev
```

## Ce qui est déjà en place

- **Structure des 12 sections** (§5), dans l'ordre officiel, avec le contenu
  texte validé du cahier des charges intégré directement dans chaque
  composant (`components/sections/`).
- **Domaine configurable** sans toucher au code — `config/site.config.ts` lit
  `NEXT_PUBLIC_SITE_DOMAIN`.
- **Compte à rebours jusqu'au 2 octobre 2026**, calculé en heure d'Abidjan
  (UTC+0, sans DST) — `hooks/useCountdown.ts` +
  `components/ui/Countdown.tsx`.
- **Globe Three.js** texturé "Terre de nuit" (NASA Black Marble, domaine
  public) — `components/ui/GlobeThree.tsx`, chargé côté client uniquement
  (`next/dynamic`, `ssr:false`), avec repli automatique sur le globe SVG
  léger `components/ui/GlobeSVG.tsx` si WebGL n'est pas disponible.
- **Navigation + indicateur de progression** synchronisés sur la section
  visible (`hooks/useActiveSection.ts`).
- **Accessibilité de base** : focus visible, `aria-live`, `aria-pressed`,
  respect de `prefers-reduced-motion`, interactions clavier sur les
  composants interactifs (bascule, flip card, rotation).
- **Formulaire section 09** fonctionnel de bout en bout : validation côté
  serveur, champ-piège anti-robot et relais des inscriptions par e-mail via
  FormSubmit (`app/api/subscribe/route.ts`).

## Ce qu'il reste à faire (prochaines itérations)

1. **Police Apollo** : voir `public/fonts/README.md` — fichiers à ajouter.
2. **Animations avancées GSAP/ScrollTrigger** — fait pour les trois cas
   prioritaires du cahier des charges : transition en ouverture circulaire
   à la sortie du loader (`Section00Loader.tsx`), révélation du titre par
   masques + phrase inversée qui se stabilise en Hero (`Section02Hero.tsx`),
   rotation 0→180° pilotée par le scroll en section 03
   (`Section03Direction.tsx`, bouton conservé comme alternative clavier).
   Le setup GSAP/ScrollTrigger partagé est dans `lib/gsap.ts`. Reste
   ouvert : affiner le flip de la section 07 (déjà fonctionnel en CSS pur)
   si un rendu plus riche est souhaité.
3. **API `/api/subscribe`** — en place et **opérationnelle** : relais
   FormSubmit vers `contact@lerenversement.com`, formulaire activé et testé
   de bout en bout (surchargeable par `FORMSUBMIT_TARGET`). Le passage à un
   vrai CRM (Brevo, Mailchimp…) reste ouvert §9.3.
4. **Section 00** : le préchargement est simulé (timer) ; à remplacer par un
   vrai suivi de chargement des ressources critiques si besoin.
5. **Vidéo** entre « Le Cercle » et « Phrase finale » (debrief V1) — fichier
   non encore fourni. La musique de fond, elle, est en place
   (`components/ui/SoundToggle.tsx`, coupée par défaut).
6. **Analytics / Tag Manager** à brancher (§21).
7. **Préparer la bascule V2** (§17) : routes `/le-livre`, `/auteur`,
   `/commander`, etc. — l'architecture App Router s'y prête nativement.

> Les pages légales (`/confidentialite`, `/mentions-legales`) ont été retirées
> du périmètre V1 à la demande du client (debrief V1) : les liens du footer ont
> été supprimés.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · GSAP (à intégrer) ·
déploiement recommandé : Vercel.
