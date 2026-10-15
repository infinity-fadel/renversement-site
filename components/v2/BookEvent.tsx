import { ANCHORS, BOOK, BOOK_EVENT, CTA_LABELS } from "@/config/v2.content";
import BookCover from "./BookCover";
import BookTitle from "./BookTitle";
import { Button, Container, Eyebrow, buttonClass } from "./ui";

/**
 * « Le livre événement » (maquette, nœuds `2:59` à `2:103` et `45:977`) :
 * logotype animé, présentation, les deux appels à l'action, la couverture.
 */
export default function BookEvent({ onJoin }: { onJoin: () => void }) {
  return (
    <section aria-labelledby="titre-livre" className="bg-black py-16 md:pb-[90px] md:pt-[140px]">
      <Container className="grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col items-start">
          <Eyebrow light>{BOOK_EVENT.eyebrow}</Eyebrow>
          <div id="titre-livre" className="mt-10 w-full md:mt-[52px]">
            <BookTitle />
          </div>
          <div className="mt-10 max-w-[400px] space-y-[1.6em] text-base leading-[1.6] text-light-grey md:mt-[66px]">
            <p>
              L&apos;Afrique possède les ressources, les talents et les capitaux nécessaires
              à son développement. Il est temps de les mobiliser pour construire sa
              souveraineté financière.
            </p>
            <p>
              Dans RENVERSEMENT,{" "}
              <a
                href={BOOK.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:text-terracota"
              >
                Ismaël Adam Cissé
              </a>{" "}
              propose une vision audacieuse et une feuille de route concrète pour mobiliser
              1 000 milliards de dollars d&apos;ici 2035.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-4 md:mt-[46px]">
            <a href={`#${ANCHORS.order}`} className={buttonClass("primary")}>
              {CTA_LABELS.order}
            </a>
            <Button variant="secondary" onClick={onJoin}>
              {CTA_LABELS.join}
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:justify-end md:pr-[10%]">
          <BookCover
            src="/v2/couverture-1.webp"
            alt="Couverture du livre « Et si l’Afrique finançait le monde ? » d’Ismaël Adam Cissé"
          />
        </div>
      </Container>
    </section>
  );
}
