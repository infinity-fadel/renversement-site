/**
 * Couverture du livre dans son cadre arrondi et ombré (maquette, nœuds
 * `45:977` et `45:987`).
 *
 * Les fichiers sources débordent de la couverture (un liseré doré en haut,
 * des marges) : la maquette les recadre dans un cadre de 357 × 518 avec les
 * valeurs reprises ci-dessous telles quelles, identiques pour les deux faces.
 */
export default function BookCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[357/518] w-full max-w-[300px] overflow-hidden rounded-[12.5px] shadow-[0_31px_56px_rgba(0,0,0,0.4)] md:max-w-[357px]">
      <img
        src={src}
        alt={alt}
        className="absolute left-[3.43%] top-[-2.14%] h-[104.28%] w-[96.57%] max-w-none"
      />
    </div>
  );
}
