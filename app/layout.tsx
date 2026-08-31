import type { Metadata } from "next";
import Script from "next/script";
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
  const { gtmId, metaPixelId, metricoolHash } = SITE_CONFIG;

  return (
    <html
      lang="fr"
      className={`${montserrat.variable} ${cormorantGaramond.variable}`}
    >
      {/* Google Tag Manager — amorce du conteneur.
          `afterInteractive` et non `beforeInteractive` : GTM n'a pas besoin de
          précéder l'hydratation, et le faire retarderait le premier rendu d'un
          site dont toute la promesse est l'entrée en matière. La balise n'est
          rendue QUE si un identifiant est configuré : sans lui, le script
          appellerait googletagmanager.com avec un `id=null` et échouerait à
          chaque chargement. */}
      {gtmId && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* Pixel Meta (Facebook/Instagram) — amorce officielle, `afterInteractive`
          pour la même raison que GTM : la mesure n'a pas à précéder
          l'hydratation. `fbq('track','PageView')` est appelé ici et une seule
          fois ; le site étant en page unique sans routing, il n'y a pas de
          changement de route à re-signaler. Rendu uniquement si un
          identifiant est configuré. */}
      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      <body>
        {/* Repli GTM sans JavaScript. Doit rester le tout premier élément du
            <body>, c'est la position prescrite par Google. */}
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Repli sans JavaScript du pixel Meta. `img` brute et non
            `next/image` : l'optimiseur réécrirait l'URL vers /_next/image et
            l'appel ne partirait jamais chez Meta. */}
        {metaPixelId && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}

        {children}

        {/* Pixel de suivi Metricool. Balise `img` brute et non `next/image` :
            c'est une balise de mesure, pas une illustration — l'optimiseur
            réécrirait l'URL vers /_next/image et le suivi ne partirait jamais
            chez Metricool.

            Sorti du flux plutôt que masqué en `display:none` : certains
            bloqueurs et quelques navigateurs anciens sautent le chargement des
            images non affichées, ce qui ferait taire le pixel sans prévenir. */}
        {metricoolHash && (
          <img
            src={`https://tracker.metricool.com/c3po.jpg?hash=${metricoolHash}`}
            alt=""
            aria-hidden="true"
            width={1}
            height={1}
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        )}
      </body>
    </html>
  );
}
