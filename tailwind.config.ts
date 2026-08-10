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
        terracota: "#F2C94C",
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
      },
    },
  },
  plugins: [],
};

export default config;
