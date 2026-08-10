# Police Apollo (titres)

La charte graphique (Brand_Guidelines_Renversement.pdf) spécifie "Apollo" comme
police de titres, avec un lien "Télécharger la police Apollo" — c'est une
police custom/premium, pas disponible sur Google Fonts.

## À faire
1. Récupérer les fichiers de la police (idéalement en `.woff2`, le format le
   plus léger) depuis la source indiquée dans la charte.
2. Les placer ici : `public/fonts/Apollo-Regular.woff2`,
   `public/fonts/Apollo-Bold.woff2` (adapter les noms selon les graisses
   fournies).
3. Le `@font-face` est déjà préparé dans `app/globals.css` — il ne fait rien
   tant que les fichiers ne sont pas présents (le navigateur bascule
   silencieusement sur le fallback `serif` défini dans tailwind.config.ts).
4. Une fois les fichiers ajoutés, aucune autre modification n'est nécessaire :
   `font-display` est déjà utilisé partout via la classe Tailwind `font-display`.

## Repli temporaire

En attendant les fichiers Apollo, `app/layout.tsx` charge "Cormorant
Garamond" via `next/font/google` (variable `--font-cormorant`), branchée en
aval d'Apollo dans la cascade `--font-apollo` définie dans
`app/globals.css`. Rendu premium/éditorial proche des maquettes du cahier
des charges. Dès qu'Apollo est ajouté, ce repli redevient invisible sans
aucune modification à faire — Apollo prend simplement le dessus dans la
cascade `@font-face`.

## Pourquoi pas `next/font/local` ?
`next/font/local` est en théorie la méthode optimale (auto-hébergement +
préchargement + zéro CLS), mais elle échoue au build si le fichier n'existe
pas encore. Le `@font-face` classique permet de livrer le squelette du projet
dès maintenant sans bloquer le build. Dès que les fichiers sont ajoutés, on
peut migrer vers `next/font/local` pour gagner en performance de chargement
(recommandé avant la mise en production).
