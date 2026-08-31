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
| `Section05Clues` | Entrée séquentielle des cartes + tracé progressif des anneaux de pourcentage |
| `Section06Shift` | Flash d'opacité par ligne à l'activation + révélation de la phrase de conclusion |
| `Section10Final` | Halo de lumière puis apparition lente du texte (timeline > 3 s) |

La section 03 n'anime plus rien : son cadran « 180° » et sa rotation au scroll
ont été supprimés à la 2e passe de retours, avec la phrase renversée qu'ils
révélaient. Elle ne dépend donc plus de GSAP.

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
sans GSAP. Le retournement se déclenche au **survol** depuis le 3e debrief
(« il faut que la carte se retourne au passage de la souris, pas attendre qu'on
clique »). Le survol est un état séparé de l'état cliqué et la face affichée est
le OU des deux : une carte déjà retournée au clic ne se re-retourne pas au
survol, et sortir de la carte ne laisse pas d'état persistant faux derrière soi.
Le clic reste actif — c'est le seul chemin au doigt et au clavier, et le §6.8
interdit qu'une interaction essentielle dépende du survol. `onPointerEnter` est
filtré sur `pointerType === "mouse"` : sans ce filtre, un tap tactile émet aussi
un `pointerenter` et la carte revenait aussitôt à sa face de départ.

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

`tailwind.config.ts`, issus de la charte. **`terracota` vaut `#B4742A`,
c'est-à-dire l'or bronze du logo, pas une terre cuite** — le nom du token et sa
valeur divergent, c'est voulu et utilisé partout (y compris en dur dans les
`stroke` SVG). Ne pas « corriger » la couleur.

La valeur vient du 3e debrief (« utiliser la couleur du logo pour les textes en
couleur sur le site » et « pour les boutons, utiliser la même couleur que celle
du logo ») ; elle est échantillonnée sur `public/logo/wordmark.webp`, dont tous
les pixels colorés valent `#B4742A`. Elle **remplace** le `#F2C94C` de la charte
de marque : sur ce point le debrief prime sur `Brand Guidelines`. Contraste sur
fond noir : 5,5:1, au-dessus du seuil AA (4,5:1) mais nettement en dessous des
13,2:1 de l'ancienne valeur — vérifier ce ratio avant d'assombrir davantage.

**Seule exception assumée** : `COLOR_RAMP` dans `GlobeThree.tsx` garde
`[242, 201, 76]`. Cette rampe recolore une photo de lumières urbaines et
l'essentiel des pixels éclairés tombe sur ce palier ; y poser l'or sombre du
logo éteint le globe presque entièrement sur fond noir. Autres tokens : `black`, `light-grey`,
`granite`, `lavender`, `desert-sand`, plus `letterSpacing.widest2` (0.2em),
très utilisé.

### Divers

- Alias `@/*` → racine du dépôt (`tsconfig.json`).
- Le dossier `Logo/` à la racine **n'est pas servi** (seul `public/` l'est) ;
  le code référence `/logo/R-or.png` → `public/logo/R-or.png`.
- `.claude/settings.local.json` est versionné et contient des permissions
  pointant vers un chemin de machine obsolète.

## Manques connus (liste complète dans README.md)

- Fichiers de la police Apollo absents.
- La progression du loader est un timer simulé (1400 ms), pas un vrai suivi de
  ressources.
- **Mesure d'audience : le socle est posé, les événements ne le sont pas.**
  `app/layout.tsx` injecte Google Tag Manager (amorce + repli `<noscript>`), le
  pixel Meta (amorce `fbq` + repli `<noscript>`) et le pixel Metricool, tous
  pilotés par `config/site.config.ts` et rendus **uniquement** si leur
  identifiant est renseigné. Les trois identifiants du client sont désormais
  codés en valeur par défaut (`GTM-TMF7TVTG`, pixel Meta `1090469960114634`,
  empreinte Metricool) pour que la mesure parte même sans variable configurée
  chez l'hébergeur ; `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` /
  `NEXT_PUBLIC_METRICOOL_HASH` restent prioritaires — les définir vides coupe
  la balise correspondante (utile en recette). Les événements personnalisés du
  §12.1 (soumission du formulaire, lecture de la vidéo, activation du son…)
  restent **à câbler** : rien ne pousse encore dans `dataLayer`, et le pixel
  Meta n'envoie que `PageView`.
- Vidéo d'introduction : fichier non fourni. Le 3e debrief la situe **entre le
  hero (02) et la section 03** (et non plus entre 09 et 10 comme au debrief V1).
  `components/ui/IntroVideo.tsx` est monté à cet endroit dans `app/page.tsx` et
  ne rend **rien** tant que `SITE_CONFIG.introVideo` vaut `null` — pas de cadre
  vide en production. Déposer le fichier dans `public/video/` et renseigner le
  chemin suffit à l'activer. Pas de lecture automatique, volontairement : le
  fond sonore tournerait par-dessus.

## Fond sonore

`components/ui/SoundToggle.tsx`, monté depuis `Nav.tsx` (juste à gauche du CTA,
placement demandé par le client) derrière le drapeau `SITE_CONFIG.features.sound`.
Piste dans `public/audio/ambient.mp3`.

Démarrage automatique demandé par le client. Ce qui est réellement possible :

- La lecture est tentée dès le montage ; elle n'aboutit que pour les visiteurs
  que le navigateur juge engagés avec le domaine. Sinon elle démarre au premier
  geste (`pointerdown`, `click`, `keydown`, `touchend`…).
- **L'astuce du démarrage muet puis démasquage ne fonctionne pas ici.** La règle
  « muted autoplay toujours autorisé » de Chrome ne vaut que pour `<video>` ;
  un `<audio muted>` est refusé exactement comme un audio normal — vérifié,
  `NotAllowedError`, avec `preload` à `none` comme à `auto`. Ne pas réintroduire
  de pré-lecture muette en croyant gagner quelque chose.
- **Le défilement ne compte pas comme une interaction** au sens des
  navigateurs : un visiteur qui ne ferait que scroller n'entendrait rien. C'est
  la raison d'être du bouton, au-delà de WCAG 1.4.2.
- `preload="none"` : les 2,7 Mo ne partent qu'au premier `play()` accepté.
  Vérifié : aucune requête `/audio/` tant que rien n'a démarré.
- Le choix est mémorisé (`localStorage`) et le refus explicite **prime sur le
  démarrage automatique** : plus aucune tentative, plus aucun téléchargement.
- `startedRef` neutralise le double montage des effets en mode strict React :
  sans lui, deux séquences de `play()` se disputaient le même élément et aucune
  n'aboutissait.
- La piste source a été recoupée : elle tombait à −47 dB sur ses cinq dernières
  secondes, ce qui creusait un trou à chaque bouclage. Coupée à 238 s avec
  fondus symétriques.
- **Piste écartée — la porte d'entrée sur le loader.** Techniquement, le seul
  montage qui donne du son dès la première image est un loader qui s'arrête à
  100 % et attend un clic « ENTRER » : ce clic fournit l'activation utilisateur
  que le navigateur exige. Elle a été construite puis **retirée sur décision
  client (Victoire)** : « ce n'est pas grave si l'utilisateur va activer
  lui-même la musique ». Le loader se lève donc toujours seul après 1400 ms, et
  le site est **silencieux à l'arrivée** — c'est assumé, pas un défaut à
  corriger. Inutile de reproposer la porte : l'arbitrage est rendu.
- **L'état du bouton vient des événements de l'élément audio, pas d'un
  drapeau optimiste.** `isOn` était posé dans `start()` après un contrôle de
  `el.paused` à 80 ms ; Chrome peut repasser en pause bien après ce délai, et
  sur liaison lente `paused` vaut `false` pendant toute la mise en mémoire
  tampon des 2,7 Mo. Le bouton affichait alors « en lecture » sur du silence.
  On écoute désormais `playing` (et non `play`, qui se déclenche à l'appel de
  la méthode et non quand le son sort), `pause` et `ended`. Les pauses
  volontaires — vidéo en cours (`duckedRef`), onglet en arrière-plan
  (`hiddenRef`) — sont exclues de cette synchronisation, sinon elles
  éteindraient le bouton et la reprise ne se ferait plus.
- **Le bouton porte un libellé visible à deux états** — « Activer le son » /
  « Arrêter le son » — et non plus une icône seule. Arbitrage client rendu une
  fois la contrainte des navigateurs comprise : le démarrage automatique ne
  pouvant être garanti, c'est le libellé qui annonce au visiteur qu'une
  bande-son existe. Le rond barré se lisait comme un son déjà coupé par le
  site, pas comme une invitation. Ne pas revenir à l'icône nue. Le texte est en
  `sr-only sm:not-sr-only` (et non `hidden sm:inline`) pour rester le nom
  accessible du bouton sous `sm`, où seule l'icône s'affiche.

## Formulaire du Cercle

`app/api/subscribe/route.ts` relaie vers **FormSubmit**. L'appel part du serveur,
jamais du navigateur : l'adresse de destination resterait sinon dans le bundle
client, exploitable par n'importe qui pour spammer la boîte.

- Variable **`FORMSUBMIT_TARGET`** (adresse ou jeton FormSubmit). Sans préfixe
  `NEXT_PUBLIC_`, volontairement. Non définie ⇒ 500 `not_configured`.
- **FormSubmit n'envoie rien tant que l'adresse n'est pas confirmée** : la toute
  première soumission déclenche un e-mail d'activation à valider. Avant ça, le
  formulaire répond « succès » et rien n'arrive — c'est le piège classique de
  mise en service.
- `success` est renvoyé en **chaîne** (`"true"`) par FormSubmit, pas en booléen.
- Champ-piège `website` dans le formulaire : rempli ⇒ on répond 200 sans rien
  relayer. Un refus explicite apprendrait au robot à le contourner.
- **FormSubmit ne déduplique pas.** La branche 409 → « déjà inscrite » du client
  est donc inatteignable en l'état ; elle est conservée pour le jour où un vrai
  CRM prendra le relais.

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

  Les deux blocs de coordonnées décoratives qui flanquaient le cadran
  (« 05° 17' NORD », « 15° 53' EST ») ont été retirés au 3e debrief.

  **Toute cote interne du cadran doit passer par le helper `scaled()`** —
  tailles de police, gouttières, marges, largeur du filet. Le conteneur étant
  dimensionné en `vh`, une valeur en `px` fixe ou en `vw` ne rétrécit pas avec
  lui : c'est ainsi que « HEURES » et « SECONDES » sortaient de l'anneau de 13
  à 27 px sur les écrans larges et bas. `scaled(N)` rend `min(N px, N/10 vh)`,
  soit exactement l'échelle du conteneur.
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
