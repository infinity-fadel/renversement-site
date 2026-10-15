"use client";

import { BOOK } from "@/config/v2.content";
import { useArmedReveal } from "@/hooks/useArmedReveal";

/**
 * Logotype qui se « renverse » (maquette, composant `title`, nœud `54:1273`).
 *
 * La maquette en donne deux états :
 *  - `start` : RƎNVERSƎMƎИT — quatre lettres en miroir (le E en 2e, 8e et 10e
 *    position, le N en 11e), comme dans le logo ; le titre du livre est masqué.
 *  - `end`   : RENVERSEMENT lu à l'endroit, et le titre du livre apparaît.
 *
 * Les lettres en miroir de l'état `start` sont, dans la maquette, les mêmes
 * glyphes retournés horizontalement : on n'emploie donc qu'un jeu de lettres
 * (celui de l'état `end`) et on retourne les quatre lettres en CSS.
 *
 * Le rendu par défaut est l'état final (cf. hooks/useArmedReveal.ts) : le
 * renversement ne se joue que pour un visiteur qui fait défiler jusqu'ici.
 */

/** Lettres de l'état `end`, dans l'ordre, avec leur largeur dans la maquette. */
const LETTERS = [
  { file: "da8fd", width: 31.321 }, // R
  { file: "e0f7c", width: 28.564, mirrored: true }, // E
  { file: "c9735", width: 36.599 }, // N
  { file: "46a74", width: 39.473 }, // V
  { file: "e0f7c", width: 28.564 }, // E
  { file: "69ab9", width: 31.321 }, // R
  { file: "78de6", width: 29.385, tall: true }, // S
  { file: "707d4", width: 28.564, mirrored: true }, // E
  { file: "0319a", width: 44.811 }, // M
  { file: "6c309", width: 28.564, mirrored: true }, // E
  { file: "cddc0", width: 36.599, mirrored: true }, // N
  { file: "f2690", width: 32.846 }, // T
];

/** Largeur totale du logotype dans la maquette (lettres + 11 espaces de 7,332). */
const TOTAL_WIDTH = 477.258;
const pct = (n: number) => `${(n / TOTAL_WIDTH) * 100}%`;

export default function BookTitle() {
  const { ref, armed } = useArmedReveal<HTMLDivElement>(0.6);

  return (
    <div ref={ref} className="flex w-full max-w-[477px] flex-col gap-[5px]">
      <p
        // Bande de 70,97 px pour des lettres de 41,5 : 14,7 px de part et
        // d'autre, soit 3,1 % de la largeur (un padding en % se rapporte à la
        // largeur, ce qui garde la proportion à toutes les tailles).
        className="flex items-center justify-center py-[3.1%]"
        style={{ gap: pct(7.332) }}
        role="img"
        aria-label="RENVERSEMENT"
      >
        {LETTERS.map((letter, i) => (
          <img
            key={i}
            src={`/v2/titre-lettre-${letter.file}.svg`}
            alt=""
            width={letter.width}
            height={letter.tall ? 43.638 : 41.526}
            className="h-auto transition-transform duration-700 ease-flip"
            style={{
              width: pct(letter.width),
              transform: armed && letter.mirrored ? "scaleX(-1)" : "scaleX(1)",
              transitionDelay: armed ? "0ms" : `${300 + i * 60}ms`,
            }}
          />
        ))}
      </p>
      <h1
        // 28,4 px dans la maquette, en Avenir Next. Montserrat est nettement
        // plus large : à 25 px le titre tient sur une ligne dans les 477 px
        // du logotype, comme dans la maquette.
        className="font-body text-[20px] font-semibold leading-[1.2] text-terracota [text-wrap:balance] transition-[opacity,transform] duration-700 ease-reveal sm:text-[25px]"
        style={{
          opacity: armed ? 0 : 1,
          transform: armed ? "translateY(-12px)" : "none",
          transitionDelay: armed ? "0ms" : "1100ms",
        }}
      >
        {BOOK.title}
      </h1>
    </div>
  );
}
