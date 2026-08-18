# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

« RENVERSEMENT » — site teaser Next.js « coming soon » (V1) en français, pour
le lancement d'un livre/d'une campagne. Expérience one-page en scroll,
sections numérotées 00 → 11, compte à rebours et formulaire d'inscription.

Le contenu, les textes et les comportements sont pilotés par un cahier des
charges. **Les deux documents de référence sont dans le dépôt**, dans
[source/](source/) :

- `source/Cahier_des_charges_Site_RENVERSEMENT_V1.pdf` — les références `§`
  omniprésentes dans les commentaires (`§6.10`, `§16.3`…) pointent vers ses
  sections. Ces commentaires sont volontaires (traçabilité), pas des scories.
- `source/Brand Guidelines Renversement .pdf` — source des tokens de
  `tailwind.config.ts` (attention à l'espace avant `.pdf` dans le nom).

Les lire avant de trancher une question de contenu, de texte ou de charte
plutôt que d'inventer — la formulation exacte des textes est validée et ne
doit pas être paraphrasée.

Le projet est en français (contenu, commentaires, textes) — garder ce choix
pour tout nouveau code.

## Commandes

```bash
npm install
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_SITE_DOMAIN
npm run dev
npm run build                # compile ET vérifie les types
npm run start
npx tsc --noEmit             # vérification de types seule (rapide)
```

**`npm run lint` ne fonctionne pas en l'état** : le dépôt ne contient aucune
config ESLint (pas de `.eslintrc*` ni `eslint.config.*`), donc `next lint`
s'arrête sur un prompt interactif « How would you like to configure ESLint? »
et bloque toute exécution non interactive. Utiliser `npx tsc --noEmit` (ou
`npm run build`) comme filet de sécurité. `next lint` est par ailleurs
déprécié en Next 15 et supprimé en Next 16 — si le linting devient
nécessaire, migrer vers l'ESLint CLI plutôt que réparer `next lint`.

Aucune suite de tests n'est configurée.

`tsconfig.tsbuildinfo` est versionné alors que c'est un artefact de build : il
apparaîtra modifié après chaque `build`/`tsc`. Ne pas committer ce bruit
(idéalement, l'ajouter à `.gitignore` et le déversionner).

## Architecture

### Composition

[app/page.tsx](app/page.tsx) rend tout dans un ordre fixe : deux fonds de page
persistants, le loader en overlay conditionnel, `Nav`, `ProgressIndicator`,
les sections 02→10 dans `<main>`, puis le footer hors de `<main>`. Pas de
routing — site à page unique.

`page.tsx` porte `"use client"`, donc **tout ce qu'il importe finit dans le
bundle client**, y compris les sections sans directive `"use client"` en tête
de fichier (04, 08, 10, 11). [app/layout.tsx](app/layout.tsx) est le seul vrai
Server Component. Ne pas déduire de l'absence de `"use client"` qu'un
composant est rendu côté serveur.

La page entière est prérendue en statique (`○ (Static)` au build) — le HTML
servi est donc figé **au moment du build**, pas à la requête. Conséquence
directe sur le compte à rebours, voir « Déterminisme d'hydratation ».

### Registre des sections

`config/sections.config.ts` est la source unique des métadonnées de section
(id, numéro affiché, `navLabel`, `inNav`, `navOrder`, `progressLabel`). Il
pilote le menu, l'indicateur de progression et les cibles de
l'IntersectionObserver de `useActiveSection`. Pour ajouter/retirer/réordonner
une section, modifier ce fichier — ne jamais dupliquer la liste ailleurs.

Deux pièges de numérotation :

- Le tableau `SECTIONS` compte **11 entrées**, pas 12 : la « section 01 »
  est la navigation (`Nav.tsx`), qui n'a pas d'ancre propre et ne figure donc
  pas dans le registre. Les « 12 sections » des docs comptent le nav.
- `navOrder` pilote l'ordre du menu, distinct par construction de l'ordre du
  parcours. Depuis le debrief V1 les deux coïncident (« Compte à rebours »
  est repassé devant « Le Cercle », à rebours du §6.2 du cahier des charges) —
  le champ est conservé parce qu'il reste le seul point de réglage du menu.
  `Nav.tsx` trie par `navOrder`, `ProgressIndicator` suit l'ordre du tableau.

`useActiveSection` est appelé indépendamment par `Nav` et par
`ProgressIndicator` : deux IntersectionObserver distincts observent les mêmes
éléments. Voulu (chaque composant reste autonome), à ne pas confondre avec un
doublon accidentel.

### Configuration de lancement

`config/site.config.ts` centralise ce qui change avant/pendant le lancement
(domaine, date, feature flags, taglines) — les composants importent d'ici,
jamais de valeurs en dur.

- `SITE_DOMAIN` ← `NEXT_PUBLIC_SITE_DOMAIN`, repli `renversement.africa`.
- `LAUNCH_DATE` — **2 octobre 2026** (date validée au debrief V1), codée en
  dur comme valeur par défaut et surchargeable par
  `NEXT_PUBLIC_LAUNCH_DATE_ISO`. Elle est volontairement dans le code et non
  dans la seule variable d'environnement : la date est publique et figée, et le
  site doit décompter juste même sans configuration chez l'hébergeur.
- `CAMPAIGN_START_DATE` ← `NEXT_PUBLIC_CAMPAIGN_START_ISO`, défaut
  2026-08-17. Sert **uniquement** d'échelle à l'anneau de progression du
  compte à rebours : `durationHours` en est dérivé. Sans cette notion, l'anneau
  restait calé sur une fenêtre fixe de 120 h et, avec une révélation à plus de
  40 jours, serait resté plein et immobile pendant des semaines.
- `SITE_TIMEZONE` = `Africa/Abidjan`, UTC+0 toute l'année (pas de DST) — d'où
  le fait que `hooks/useCountdown.ts` compare directement des timestamps UTC
  sans conversion.
- `SITE_CONFIG.features` — flags booléens (`countdown`, `globe` actifs ;
  `commerce`, `payment` réservés V2, désactivés).

### Déterminisme d'hydratation

Contrainte transverse, à respecter dans tout nouveau code : le HTML prérendu
et le premier rendu client doivent être identiques au caractère près. Trois
mécanismes existants en découlent, à ne pas « simplifier » :

- `Countdown.tsx` et `Section05Clues.tsx` arrondissent les résultats de
  `Math.cos`/`Math.sin` à 3 décimales — le dernier bit peut différer entre V8
  (build) et JavaScriptCore (Safari), ce qui suffit à casser l'hydratation sur
  des coordonnées SVG codées en dur.
- `StarfieldBackground.tsx` génère les positions d'étoiles par une formule
  déterministe, jamais `Math.random()`.

Ne jamais introduire `Date.now()`, `Math.random()` ou une valeur dépendante du
navigateur dans un rendu initial ; les reporter dans un `useEffect`.

### Animations — deux couches

**Socle sans dépendance** : `hooks/useInView.ts` + `components/ui/SectionWrapper.tsx`
fournissent le fade/slide-in au scroll (IntersectionObserver, révélation
unique, `prefers-reduced-motion` respecté). `SectionWrapper` fournit aussi
l'`id` d'ancre et le `min-h-screen`. Section 00 (overlay) et section 11
(footer non animé, §6.12) s'en passent volontairement.

**GSAP par-dessus** (enregistré une seule fois dans `lib/gsap.ts`), pour les
cas explicitement demandés par le cahier des charges — **5 sections** :

| Section | Animation |
|---|---|
| `Section00Loader` | Apparition progressive du logo puis des lignes, et sortie en ouverture circulaire (`clip-path: circle()`) |
| `Section02Hero` | Titre révélé mot par mot par masque — déclenché par la prop `start`, pas par un observateur (voir plus bas) |
| `Section03Direction` | Rotation 0→180° pilotée par le scroll, **par paliers de 20°** (`ScrollTrigger` + `gsap.to` à chaque cran) |
| `Section05Clues` | Entrée séquentielle des cartes + tracé progressif des anneaux de pourcentage |
| `Section06Shift` | Flash d'opacité par ligne à l'activation + révélation de la phrase de conclusion |
| `Section10Final` | Halo de lumière puis apparition lente du texte (timeline > 3 s) |

**Deux pièges de déclenchement, corrigés au debrief V1 — ne pas les
réintroduire :**

- `Section02Hero` est monté dès le premier rendu et se trouve déjà dans le
  viewport : un `useInView` s'y déclenchait immédiatement, donc l'animation se
  jouait **sous l'overlay du loader** et était terminée quand il se levait.
  Elle est désormais commandée par `start`, passé par `app/page.tsx` à la fin
  du loader. Toute animation d'ouverture de cette section doit suivre la même
  voie.
- Ne jamais attacher le `ref` de `useInView` à un élément
  `className="contents"` : `display: contents` ne génère aucune boîte, le
  rectangle observé est vide et le seuil n'est jamais atteint — l'animation ne
  part alors jamais. C'était le cas dans les sections 02 et 05.

Deux règles suivies partout : l'**état final est déjà le rendu HTML par
défaut** (GSAP ne joue que l'entrée, jamais le contenu lisible), et chaque
composant teste `prefers-reduced-motion` **en JS** et sort avant d'animer —
pas seulement via le CSS de `globals.css`.

Section 03 : GSAP possède seul la transformation CSS via une ref DOM directe,
pour éviter tout conflit avec React pendant le scrub. Le bouton reste une
alternative clavier/tactile pleinement fonctionnelle (§6.4) et pilote la même
ref.

Section 07 (flip de carte) est en CSS pur (`transformStyle: preserve-3d`),
sans GSAP.

### Globe — architecture à deux rendus

Point le plus contre-intuitif du projet. Il y a **deux** points de montage
pour le même composant `GlobeThree` :

1. **Desktop** — `components/ui/GlobeBackground.tsx`, monté au niveau de
   `page.tsx` : globe en fond de page persistant (`fixed`, `-z-10`,
   `hidden md:block`), dont la taille et la position sont recalculées à chaque
   frame selon le scroll. Il part de l'état « repos » (place du globe en
   section 04), puis grossit et glisse vers le bas pour ne plus laisser
   dépasser qu'un arc en bas d'écran (« horizon ») sur toutes les sections
   suivantes. Réversible. Les légendes (§6.5) sont portées par ce composant et
   s'effacent quand le globe grossit.
2. **Mobile** — plus de globe du tout. Le debrief V1 demande explicitement de
   le masquer sur petit écran ; `Section04Observe.tsx` n'y affiche que les
   trois légendes. Conséquence utile : `three.js` ne part plus jamais dans le
   bundle mobile, puisque seul `GlobeBackground` (déjà `hidden md:block`) le
   charge, en `next/dynamic`.

`GlobeThree` accepte `active` (contrôle externe du démarrage, utilisé par
`GlobeBackground`), `size` (canvas à taille fixe, agrandi ensuite par
`transform: scale` CSS), `autoRotate` et `pulseRef`. Sans ces props il est
autonome et démarre à l'entrée dans le viewport.

**Houle de la lueur** : à l'état horizon, le liseré Fresnel respire lentement
(cycle de 6,5 s, ~9 par minute — registre « corps céleste », pas pouls).
`pulseEnvelope` somme deux gaussiennes larges et décalées : leur chevauchement
rend la montée plus vive que la descente, ce qui évite la symétrie molle d'une
sinusoïde. Elle pilote l'uniform `uPulse` du shader, qui multiplie l'intensité
**avant** le `clamp` : la zone non saturée s'élargit, donc l'anneau paraît
gonfler et pas seulement changer de teinte (mesuré : ×1,97 entre creux et pic).

Deux pièges si on retouche `PULSE_BUMPS` :

- Les centres sont placés vers le milieu du cycle **exprès**. Des bosses aussi
  larges centrées tôt laissent l'enveloppe à une valeur non nulle en `t=0`
  alors qu'elle finit à zéro en `t=1` — soit un flash sec à chaque bouclage.
  L'écart actuel entre les deux extrémités est de 0,005. À revérifier après
  tout déplacement.
- La somme est normalisée par `PULSE_PEAK` pour que le sommet de `uPulse` reste
  exactement `1 + PULSE_AMPLITUDE` quels que soient les réglages.

`pulseRef` est **une ref, pas une prop de valeur** : `GlobeBackground` la
recalcule à chaque frame depuis le scroll (`progress²`, pour que l'effet reste
imperceptible pendant la section 04 et ne s'affirme qu'en fin de descente). Une
prop d'état re-rendrait le composant 60 fois par seconde et remonterait la
scène WebGL en boucle. Le battement est neutralisé si
`prefers-reduced-motion: reduce`.

**La rotation automatique est désactivée sur le globe de fond**
(`autoRotate={false}`) : les légendes doivent désigner une géographie précise
(« Ici, les ressources » sur l'Afrique, « Ailleurs, la valeur » sur le reste du
monde), ce qui suppose que la planète ne tourne pas sous le texte. Le
glisser-déposer reste actif, donc l'exploration du §6.5 n'est pas perdue. Si
la rotation est réactivée un jour, les positions fixes des `CALLOUTS` n'ont
plus aucun sens et doivent être remplacées par une projection 3D → écran.

Détails à ne pas casser (chacun corrige un bug réel, commenté dans le code) :
le `setPixelRatio` est **forcé à 2 minimum** parce que le canvas est étiré
jusqu'à ~×5 ; le rayon horizon est plafonné à 1400 px car au-delà de ~5000 px
composés Chromium cesse silencieusement de composer le calque WebGL ;
`setClearColor(0x000000, 0)` est indispensable (sinon carré noir derrière le
globe) ; `GLOBE_FILL_RATIO` est une valeur mesurée sur capture d'écran, pas
calculée.

La texture est une image NASA Black Marble (domaine public) recolorée pixel
par pixel dans une rampe noir → or (`recolorNightLights`) pour coller à la
charte — pas un filtre de teinte global, qui laisserait passer le bleu du
fichier source.

`GlobeSVG.tsx` (SVG pur, zéro dépendance) est le fallback fonctionnel si WebGL
ou la texture échouent (§8.3) — pas du code mort. `prefers-reduced-motion` fige
la rotation plutôt que de supprimer le rendu 3D.

`components/ui/globe-config.ts` existe uniquement pour partager la taille du
conteneur sans que `Section04Observe` n'entraîne `three.js` dans le bundle
principal — ne pas y ajouter d'import lourd.

### Formulaire (section 09)

`Section09Circle.tsx` poste vers `/api/subscribe`, **qui n'existe pas** (pas
de dossier `app/api/`). Le client gère déjà `idle/submitting/success/error/duplicate`
avec la convention **409 = doublon**. À l'implémentation du route handler,
respecter ce contrat de code de statut plutôt que modifier le client.

### Polices

Montserrat et Cormorant Garamond via `next/font/google` dans
[app/layout.tsx](app/layout.tsx). La police de titre « Apollo » est premium et
absente — voir [public/fonts/README.md](public/fonts/README.md). Elle est
déclarée par un `@font-face` classique dans `app/globals.css` (pas
`next/font/local`, qui casserait le build tant que les fichiers manquent). La
cascade `--font-apollo` retombe sur Cormorant. Une fois les fichiers ajoutés,
Apollo prend le dessus sans autre modification ; migrer alors vers
`next/font/local`.

### Tokens de design

`tailwind.config.ts`, issus de la charte. **`terracota` vaut `#F2C94C`,
c'est-à-dire un or/jaune, pas une terre cuite** — le nom du token et sa valeur
divergent, c'est voulu et utilisé partout (y compris en dur dans les `stroke`
SVG). Ne pas « corriger » la couleur. Autres tokens : `black`, `light-grey`,
`granite`, `lavender`, `desert-sand`, plus `letterSpacing.widest2` (0.2em),
très utilisé.

### Divers

- Alias `@/*` → racine du dépôt (`tsconfig.json`).
- Le dossier `Logo/` à la racine **n'est pas servi** (seul `public/` l'est) ;
  le code référence `/logo/R-or.png` → `public/logo/R-or.png`.
- `.claude/settings.local.json` est versionné et contient des permissions
  pointant vers un chemin de machine obsolète.

## Manques connus (liste complète dans README.md)

- **Endpoint `/api/subscribe` non implémenté** — c'est la cause du message
  « Une erreur technique est survenue » relevé au debrief V1 sur le formulaire
  de la section 09 : la requête part vers une route inexistante, donc 404,
  donc `catch`. Laissé de côté sur décision du client, mais le retour reste
  ouvert : le formulaire ne peut pas fonctionner tant que la route et le
  service d'emailing ne sont pas choisis.
- Fichiers de la police Apollo absents.
- La progression du loader est un timer simulé (1400 ms), pas un vrai suivi de
  ressources.
- Aucun événement analytics du §12.1 n'est câblé.
- Musique de fond et vidéo (entre les sections 09 et 10) demandées au debrief
  V1 : les fichiers n'ont pas encore été fournis. Pour la musique, prévoir un
  bouton son visible et coupé par défaut — l'autoplay est bloqué par les
  navigateurs sans interaction préalable.

## Gouttière latérale et indicateur de progression

`ProgressIndicator` n'affiche son libellé qu'à partir de `xl`, et
`SectionWrapper` réserve en contrepartie `xl:px-60`. **Les deux réglages sont
solidaires** : en dessous de `xl`, le libellé débordait sur la colonne de texte
des sections (le debrief V1 signale « OBSERVER DEPUIS L'AUTRE CÔTÉ » qui
chevauche le titre de la section 04). Ne pas en changer un sans l'autre.

La gouttière est symétrique à dessein : le debrief demande par ailleurs de
recentrer la section 09, donc aucun `pl-` asymétrique ici.

## Écrans bas (hauteur de viewport)

Le globe de fond est en `fixed` : son arc occupe toujours la même bande en bas
d'écran, quel que soit le scroll. Tout contenu qui descend dans cette bande
passe donc devant la Terre. Sur les portables bas (≤ 820 px de haut), c'est ce
qui faisait atterrir « 44 JOURS » sur le globe.

Trois réglages, tous fonction de la **hauteur** du viewport et non de sa
largeur — les breakpoints Tailwind habituels ne servent à rien ici :

- `HORIZON_VISIBLE_PX` est plafonné par `HORIZON_VISIBLE_VH` (15 %) dans
  `GlobeBackground.tsx`. Une valeur fixe de 190 px vaut 18 % d'un écran de
  1080 px mais 25 % d'un écran de 760 px.
- Le cadran du compte à rebours est plafonné à `38vh` (`Countdown.tsx`).
  `RING_SIZE` reste la référence du dessin SVG, seul l'affichage est mis à
  l'échelle via `viewBox` + `w-full h-full`.
- `SectionWrapper` réduit son rembourrage vertical via la variante arbitraire
  `[@media(max-height:820px)]:py-10`, et la section 08 resserre ses `mt-14`.

Vérifié à 1280×680, 1440×760, 1500×959 et 1920×1080 : toutes les sections
tiennent dans le viewport (sauf 07 et 09, qui dépassent de 27 px et 8 px — sans
conséquence, elles défilent).

## Images

`public/images/` — visuels du debrief V1, convertis en WebP depuis les PNG
sources (~16 Mo au total à l'origine, 732 Ko après conversion) : `hero-bg`,
`bascule-bg`, et `indice-{minerais,terres,hydro,pib}` pour les quatre cartes
de la section 05, qui se retournent au survol pour les révéler. Toutes sont
posées derrière un voile sombre — le texte clair de la charte doit rester
lisible par-dessus.
