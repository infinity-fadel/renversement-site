import type { Config } from "tailwindcss";

/**
 * Tokens directement issus de Brand_Guidelines_Renversement.pdf
 *  - Palette principale : Terracota / Black / Light Grey
 *  - Palette secondaire : Granite / Lavender / Desert sand
 *  - Typo titres : Apollo — Typo contenu : Montserrat
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        terracota: "#B4742A",
        black: "#000000",
        "light-grey": "#EFEFE8",
        granite: "#ABC9C6",
        lavender: "#CACEE5",
        "desert-sand": "#E0C8A6",
      },
      fontFamily: {
        // Apollo = police de titre custom (fichier à fournir, cf. public/fonts/README.md)
        display: ["var(--font-apollo)", "Georgia", "serif"],
        // Montserrat = police de contenu, chargée via next/font/google
        body: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
      transitionTimingFunction: {
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
        // Demi-tour de la phrase du hero (§6.3). `reveal` est une expo-out :
        // elle place 80 % du parcours dans ses 150 premières millisecondes.
        // Invisible sur un décalage de quelques pixels — c'est son emploi —
        // mais sur une rotation de 180° elle donne un à-coup sec (25° dans la
        // toute première frame) suivi de 300 ms où plus rien ne bouge. Mesuré
        // au debrief. `flip` démarre et se pose en douceur, donc le demi-tour
        // occupe réellement sa durée au lieu d'être fini au quart.
        flip: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
