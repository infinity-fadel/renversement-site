import { SOCIAL_LINKS } from "@/config/v2.content";

/**
 * Icônes des réseaux, dans l'ordre et aux couleurs de la maquette.
 *
 * Deux icônes ont un fond propre dans la maquette : Facebook (pastille
 * blanche derrière le « f » or) et TikTok (pastille or, logo réduit de moitié).
 * `size` met le tout à l'échelle : 16 px dans le pied de page, 22 px dans la
 * fenêtre « Rejoindre le mouvement », 30 px dans le message de confirmation.
 *
 * Tant que l'adresse d'un compte n'est pas fournie (`url: null`), l'icône
 * s'affiche sans lien.
 */
export default function SocialLinks({ size = 16 }: { size?: number }) {
  const gap = Math.round(size * 0.625);
  return (
    <ul className="flex items-center" style={{ gap }}>
      {SOCIAL_LINKS.map((link) => {
        const icon = <SocialIcon name={link.name} src={link.icon} size={size} />;
        return (
          <li key={link.name} className="flex">
            {link.url ? (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="flex transition-opacity hover:opacity-75"
              >
                {icon}
              </a>
            ) : (
              <span className="flex" aria-label={link.name} role="img">
                {icon}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SocialIcon({ name, src, size }: { name: string; src: string; size: number }) {
  // L'icône YouTube est plus large que haute (20 × 16 à l'échelle 16).
  if (name === "YouTube") {
    return <img src={src} alt="" width={size * 1.25} height={size} />;
  }
  if (name === "Facebook") {
    return (
      <span
        className="flex overflow-hidden rounded-full bg-white"
        style={{ width: size, height: size }}
      >
        <img src={src} alt="" width={size} height={size} />
      </span>
    );
  }
  if (name === "TikTok") {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-terracota"
        style={{ width: size, height: size }}
      >
        <img src={src} alt="" width={size / 2} height={size / 2} />
      </span>
    );
  }
  return <img src={src} alt="" width={size} height={size} />;
}
