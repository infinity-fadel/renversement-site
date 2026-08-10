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
- **Compte à rebours 120h**, calculé en heure d'Abidjan (UTC+0, sans DST) —
  `hooks/useCountdown.ts` + `components/ui/Countdown.tsx`.
- **Globe Three.js** texturé "Terre de nuit" (NASA Black Marble, domaine
  public) — `components/ui/GlobeThree.tsx`, chargé côté client uniquement
  (`next/dynamic`, `ssr:false`), avec repli automatique sur le globe SVG
  léger `components/ui/GlobeSVG.tsx` si WebGL n'est pas disponible.
- **Navigation + indicateur de progression** synchronisés sur la section
  visible (`hooks/useActiveSection.ts`).
- **Accessibilité de base** : focus visible, `aria-live`, `aria-pressed`,
  respect de `prefers-reduced-motion`, interactions clavier sur les
  composants interactifs (bascule, flip card, rotation).
- **Formulaire section 09** fonctionnel côté UI, avec gestion des états
  (succès, doublon, erreur) — l'endpoint `/api/subscribe` reste à créer.

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
3. **API `/api/subscribe`** + intégration CRM/emailing (Brevo, Mailchimp,
   HubSpot…) — actuellement non trituré, décision à prendre au §9.3 du
   cahier des charges.
4. **Section 00** : le préchargement est simulé (timer) ; à remplacer par un
   vrai suivi de chargement des ressources critiques si besoin.
5. **Pages légales** (`/confidentialite`, `/mentions-legales`) référencées
   dans le footer, à créer avant mise en production.
6. **Analytics / Tag Manager** à brancher (§21).
7. **Préparer la bascule V2** (§17) : routes `/le-livre`, `/auteur`,
   `/commander`, etc. — l'architecture App Router s'y prête nativement.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · GSAP (à intégrer) ·
déploiement recommandé : Vercel.
