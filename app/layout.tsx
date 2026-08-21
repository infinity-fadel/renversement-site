import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG, SITE_URL } from "@/config/site.config";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Solution de repli temporaire pour la police de titre "Apollo" (fichiers
// pas encore fournis, voir public/fonts/README.md) — rendu premium/éditorial
// proche des maquettes en attendant. Branchée en aval d'Apollo dans la
// cascade --font-apollo (globals.css) : dès qu'Apollo sera disponible, ce
// repli redevient invisible sans aucune autre modification.
const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description:
    "Le monde regarde l'Afrique comme un continent à financer. Et si la réalité était exactement l'inverse ? Rejoignez le Cercle des premiers observateurs.",
  // §22 : indexation immédiate ou noindex temporaire — à trancher avant mise en ligne.
  // Décommenter la ligne suivante si le site ne doit pas être indexé pendant le teasing :
  // robots: { index: false, follow: false },
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    url: SITE_URL,
    siteName: SITE_CONFIG.name,
    locale: "fr_FR", 
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} ${cormorantGaramond.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
