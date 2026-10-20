import { ANCHORS, EXCERPTS, type Excerpt } from "@/config/v2.content";

function ExcerptCard({ excerpt }: { excerpt: Excerpt }) {
  return (
    <figure className="flex flex-col gap-6 bg-ink p-6">
      <blockquote className="text-base italic leading-[1.4] text-light-grey">
        <p>“{excerpt.quote}”</p>
      </blockquote>
      <figcaption className="text-base font-bold leading-[1.4] text-terracota">
        {excerpt.source}
      </figcaption>
    </figure>
  );
}
import { Container, Eyebrow, buttonClass } from "./ui";

/**
 * « Extraits » (maquette, nœud `28:34`) : cartes de citations en colonnes
 * décalées. Les colonnes CSS reproduisent la disposition « en maçonnerie » de
 * la maquette sans calcul de hauteur, et se replient seules sur petit écran.
 */
export default function Excerpts() {
  return (
    <section
      id={ANCHORS.excerpts}
      aria-labelledby="titre-extraits"
      className="bg-[#181818] py-16 md:py-[72px]"
    >
      <Container className="flex flex-col items-center gap-10 md:gap-[52px]">
        <Eyebrow>{EXCERPTS.eyebrow}</Eyebrow>
        <div className="flex flex-col items-center gap-2 text-center font-display leading-[1.2] text-light-grey">
          <h2 id="titre-extraits" className="text-[26px] tracking-[0.02em] sm:text-[32px]">
            {EXCERPTS.title}
          </h2>
          <p className="text-lg tracking-[0.02em] sm:text-xl">{EXCERPTS.subtitle}</p>
        </div>

        {/* Grand écran : les quatre colonnes exactes de la maquette. */}
        <div className="hidden w-full grid-cols-4 items-start gap-6 lg:grid">
          {EXCERPTS.columns.map((column, c) => (
            <div key={c} className="flex flex-col gap-6">
              {column.map((excerpt, i) => (
                <ExcerptCard key={i} excerpt={excerpt} />
              ))}
            </div>
          ))}
        </div>

        {/* En dessous : la même suite de cartes, réagencée en une ou deux
            colonnes. `display: none` sur la variante inutilisée la retire
            aussi de l'arbre d'accessibilité — pas de lecture en double. */}
        <div className="w-full columns-1 gap-6 sm:columns-2 lg:hidden">
          {EXCERPTS.columns.flat().map((excerpt, i) => (
            <div key={i} className="mb-6 break-inside-avoid">
              <ExcerptCard excerpt={excerpt} />
            </div>
          ))}
        </div>

        <a href={`#${ANCHORS.order}`} className={buttonClass("primary")}>
          {EXCERPTS.cta}
        </a>
      </Container>
    </section>
  );
}
