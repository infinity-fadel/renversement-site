# CLAUDE.md

Ce fichier fournit des indications à Claude Code (claude.ai/code) pour travailler avec le code de ce dépôt.

## Projet

« RENVERSEMENT » — un site teaser Next.js « coming soon » (V1) en français,
pour le lancement d'un livre/d'une campagne. Expérience one-page en scroll
composée de 12 sections numérotées (00 → 11), d'un compte à rebours et d'un
formulaire d'inscription par e-mail. Le contenu, les textes et le comportement
sont pilotés par un document de spécification externe désigné dans le code
comme « le cahier des charges » (références `§` dans les commentaires, ex.
`§6.10`, `§16.3`) — ces commentaires citant les sections du cahier des charges
sont volontaires (traçabilité), ce ne sont pas des scories.

Le projet est en français pour le contenu, les commentaires et les textes —
garder ce choix pour tout nouveau code/commentaire.

## Commandes

```bash
npm install
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_SITE_DOMAIN
npm run dev                  # serveur de dev
npm run build                # build de production
npm run start                # sert le build de production
npm run lint                 # next lint
```

Il n'y a pas de suite de tests configurée dans ce dépôt.

## Architecture

**Composition one-page** : [app/page.tsx](app/page.tsx) est un composant
client qui rend les 12 sections dans un ordre fixe à l'intérieur de `<main>`,
plus `Nav`, `ProgressIndicator` et l'écran de chargement en overlay. Il n'y a
pas de routing — c'est un site à page unique.

**Les sections sont la source de vérité du contenu** : chaque section
numérotée (`components/sections/Section0XNom.tsx`) est autonome, avec son
texte français codé en dur dans le composant (texte validé issu du cahier des
charges, pas destiné à venir d'un CMS/i18n). La numérotation (00–11) suit le
cahier des charges et n'est pas séquentielle dans les imports de fichiers
(ex. la section « 01 » n'existe pas en tant que fichier — voir ci-dessous).

**`config/sections.config.ts` est le registre unique des métadonnées de
section** (id, numéro affiché, libellé de menu, flag `inNav`, `navOrder`,
`progressLabel`). Il pilote trois éléments d'UI indépendants qui doivent
rester synchronisés : les liens du menu de navigation, l'indicateur latéral
de progression, et (indirectement) les cibles de l'IntersectionObserver de
`useActiveSection`. Pour ajouter/retirer/réordonner une section, modifier ce
fichier — ne pas dupliquer la liste des sections ailleurs. Note : « Section01 »
(Nav) et « Section02Hero », etc., sont numérotés selon le cahier des charges,
pas selon l'ordre du tableau.

Le menu (`Nav.tsx`) suit désormais exactement le §6.2 du cahier des charges :
5 liens (Le Renversement, Les indices, La bascule, Le Cercle, Compte à
rebours), triés par `navOrder` — un champ distinct de l'ordre du tableau
`SECTIONS` (qui reste l'ordre réel du parcours 00→11) car le menu et le
parcours n'ont pas le même ordre (ex. "Le Cercle" est listé avant "Compte à
rebours" alors que la section 08 précède la section 09). `ProgressIndicator`
utilise `progressLabel` (titres courts repris du tableau §5) pour afficher le
libellé à côté du numéro de la section active ; il est passé à gauche de
l'écran (référence maquette), pas à droite.

**`config/site.config.ts` centralise tout ce qui est susceptible de changer
avant/pendant le lancement** (domaine, date de lancement, feature flags,
taglines), afin que les composants n'aient jamais ces valeurs en dur — ils les
importent depuis ce fichier. Points clés :
- `SITE_DOMAIN` lit `NEXT_PUBLIC_SITE_DOMAIN`, avec `renversement.africa` en
  valeur de repli.
- `LAUNCH_DATE` lit `NEXT_PUBLIC_LAUNCH_DATE_ISO` (chaîne ISO en UTC) ; si non
  définie, elle vaut par défaut « maintenant + 120h », calculée une seule fois
  au démarrage du serveur — ce défaut n'est PAS stable entre redémarrages/
  déploiements, donc toujours définir la variable d'environnement au-delà du
  dev local.
- `SITE_TIMEZONE` vaut `Africa/Abidjan`, qui est UTC+0 toute l'année (pas de
  DST) — c'est pourquoi le calcul du compte à rebours dans
  `hooks/useCountdown.ts` traite les timestamps UTC et l'heure d'Abidjan comme
  directement comparables, sans conversion.
- `SITE_CONFIG.features` contient de simples flags booléens (`countdown`,
  `globe`, et `commerce`/`payment` réservés à la V2, actuellement désactivés)
  pour activer/désactiver des fonctionnalités sans redéploiement de logique.

**La stratégie d'animation est en deux couches** :
`hooks/useInView.ts` + `components/ui/SectionWrapper.tsx` fournissent un
fade/slide-in au scroll générique, sans dépendance (basé sur
IntersectionObserver, respecte `prefers-reduced-motion`, révèle une seule
fois) — c'est le socle utilisé par la majorité des sections. GSAP
(+ ScrollTrigger, enregistré une seule fois dans `lib/gsap.ts`) est branché
par-dessus pour les animations spécifiques explicitement demandées par le
cahier des charges :
- `Section00Loader.tsx` — transition de sortie en ouverture circulaire
  (`clip-path: circle()` animé) vers la section 01/02.
- `Section02Hero.tsx` — révélation du titre mot par mot par masque
  (`overflow-hidden` + translation) et phrase secondaire qui apparaît
  inversée à 180° puis se stabilise, déclenchées une seule fois via
  `useInView`.
- `Section03Direction.tsx` — rotation continue 0→180° de l'élément central
  pilotée par le scroll (`ScrollTrigger` en mode `scrub`), GSAP possédant
  seul la transformation CSS via une ref DOM directe pour éviter tout
  conflit avec le rendu déclaratif de React pendant le scrub. Le bouton
  reste une alternative pleinement fonctionnelle au clavier/tactile (exigé
  par §6.4), et pilote la même ref via `gsap.to`.

Toutes ces animations GSAP se désactivent si `prefers-reduced-motion: reduce`
est détecté (vérifié explicitiement dans chaque composant, pas seulement via
CSS) et retombent sur l'état final déjà présent dans le HTML par défaut.

**Le globe de la section 04 est en Three.js** (`components/ui/GlobeThree.tsx`),
texturé avec une image "Terre de nuit" du domaine public (NASA Black Marble,
reprise des exemples officiels three.js) stockée dans
`public/textures/earth_night_lights.png`. Chargé via `next/dynamic` avec
`ssr: false` (WebGL exige `window`/`canvas`, indisponible côté serveur) et un
`loading:` qui rend `GlobeSVG` pendant le chargement du chunk — donc pas de
saut de mise en page et une dégradation progressive si JS est indisponible.
`GlobeThree` lui-même retombe sur `<GlobeSVG />` si `WebGLRenderer` échoue à
s'instancier (§8.3 : "dégradation gracieuse si WebGL n'est pas disponible").
Respecte `prefers-reduced-motion` en figeant la rotation plutôt qu'en
supprimant le rendu 3D. `GlobeSVG.tsx` (SVG pur, zéro dépendance) reste donc
dans le code comme fallback fonctionnel, pas comme code mort.

**Le formulaire de la section 09 (Le Cercle) est fonctionnel côté UI mais sans
backend** : il poste vers `/api/subscribe`, qui n'existe pas encore (pas de
dossier `app/api/`). Le composant gère déjà les états
`idle/submitting/success/error/duplicate`, avec une convention 409 = doublon —
lors de l'implémentation du route handler, respecter ce contrat de code de
statut plutôt que de modifier le client.

**Polices** : Montserrat est chargée via `next/font/google` dans
`app/layout.tsx` (texte courant). La police de titre « Apollo » est une
police premium/custom pas encore présente — voir
[public/fonts/README.md](public/fonts/README.md). Elle est branchée via un
`@font-face` classique dans `app/globals.css` (pas `next/font/local`), pour
que le build ne casse pas tant que les fichiers de police sont absents. En
attendant, la cascade `--font-apollo` (globals.css) retombe sur Cormorant
Garamond (`next/font/google`, variable `--font-cormorant`, chargée dans
`app/layout.tsx`) plutôt que directement sur `serif` — un repli premium
visuellement proche des maquettes du cahier des charges. Une fois les
fichiers Apollo ajoutés, Apollo prend automatiquement le dessus dans la
cascade sans aucune autre modification ; migrer vers `next/font/local` reste
la suite recommandée à ce moment-là.

**Tokens de design** dans `tailwind.config.ts` sont issus directement de
`Brand_Guidelines_Renversement.pdf` (absent de ce dépôt) — couleurs
(`terracota`, `black`, `light-grey`, `granite`, `lavender`, `desert-sand`) et
le système à deux polices (`font-display` = Apollo/serif, `font-body` =
Montserrat). Traiter ces noms/valeurs comme des tokens de marque fixes, pas
des choix arbitraires.

## Manques connus (voir README.md pour la liste complète)

- Endpoint `/api/subscribe` + intégration CRM/emailing non implémentés.
- Fichiers de la police Apollo absents.
- Pages légales (`/confidentialite`, `/mentions-legales`) référencées dans le
  footer, à créer.
- La progression de l'écran de chargement (section 00) est un timer simulé,
  pas un vrai suivi des ressources.
- Aucun des événements analytics listés au §12.1 du cahier des charges
  (`intro_complete`, `hero_cta_click`, `card_flip`, `form_submit_success`…)
  n'est câblé.
- Bug connu (préexistant, sans lien avec les animations) : `Countdown.tsx`
  déclenche une erreur d'hydratation React (le rendu serveur et le premier
  rendu client calculent `Date.now()` séparément, d'où un écart d'une
  seconde). À corriger en figeant la valeur affichée au premier rendu
  client avant de démarrer l'intervalle.
