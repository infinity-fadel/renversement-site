import { ANCHORS } from "@/config/v2.content";

/**
 * Écran d'ouverture (maquette, nœud `2:58`, 1512 × 792).
 *
 * PROVISOIRE. Dans la maquette, ce cadre est vide côté calques : ce qu'on y
 * voit en capture (le mot « DEPUIS » en lumière, puis le monogramme) vient
 * d'un contenu animé que l'export ne transmet pas — vraisemblablement une
 * vidéo ou une animation de texte. À obtenir auprès de la designer avant
 * d'aller plus loin ; en attendant, l'écran garde sa hauteur et sa place dans
 * le parcours, avec le seul monogramme.
 */
export default function Hero() {
  return (
    <section
      id={ANCHORS.home}
      aria-label="Accueil"
      className="relative flex min-h-[70svh] items-center justify-center overflow-hidden bg-black md:min-h-[792px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(179,114,32,0.12),transparent_55%)]"
      />
      <img
        src="/v2/monogramme.svg"
        alt=""
        width={66}
        height={59}
        className="relative h-auto w-[66px]"
      />
    </section>
  );
}
