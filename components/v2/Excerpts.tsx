import { ANCHORS, EXCERPTS } from "@/config/v2.content";
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

        <div className="w-full columns-1 gap-6 sm:columns-2 lg:columns-4">
          {EXCERPTS.items.map((excerpt) => (
            <figure
              key={excerpt.source + excerpt.quote.slice(0, 12)}
              className="mb-6 flex break-inside-avoid flex-col gap-6 bg-ink p-6"
            >
              <blockquote className="text-base italic leading-[1.4] text-light-grey">
                <p>“{excerpt.quote}”</p>
              </blockquote>
              <figcaption className="text-base font-bold leading-[1.4] text-terracota">
                {excerpt.source}
              </figcaption>
            </figure>
          ))}
        </div>

        <a href={`#${ANCHORS.order}`} className={buttonClass("primary")}>
          {EXCERPTS.cta}
        </a>
      </Container>
    </section>
  );
}
