import { ANCHORS, BOOK_SECTION } from "@/config/v2.content";
import BookCover from "./BookCover";
import { Container, Eyebrow, SectionTitle, buttonClass } from "./ui";

/** « Le livre » (maquette, nœuds `102:1751`, `45:987` et `2:139`). */
export default function BookSection() {
  return (
    <section
      id={ANCHORS.book}
      aria-labelledby="titre-le-livre"
      className="bg-black pb-10 pt-20 md:pb-[68px] md:pt-[100px]"
    >
      <Container className="grid items-center gap-14 md:grid-cols-2 md:gap-10">
        <div className="order-2 flex justify-center md:order-1">
          <BookCover src="/v2/couverture-2.webp" alt="Quatrième de couverture du livre" />
        </div>

        <div className="order-1 flex max-w-[581px] flex-col items-start gap-8 md:order-2 md:gap-11">
          <Eyebrow>{BOOK_SECTION.eyebrow}</Eyebrow>
          <SectionTitle className="-mt-2">
            <span id="titre-le-livre">{BOOK_SECTION.title}</span>
          </SectionTitle>
          <p className="max-w-[486px] text-base leading-[1.6] text-light-grey">
            {BOOK_SECTION.body}
          </p>
          <Eyebrow>{BOOK_SECTION.discoverLabel}</Eyebrow>
          <ul className="flex max-w-[460px] flex-col gap-5">
            {BOOK_SECTION.discover.map((item) => (
              <li key={item} className="flex items-center gap-[22px]">
                <img
                  src="/v2/puce-re.svg"
                  alt=""
                  width={16}
                  height={10}
                  className="shrink-0"
                />
                <span className="text-base leading-[1.4] text-light-grey">{item}</span>
              </li>
            ))}
          </ul>
          <a href={`#${ANCHORS.excerpts}`} className={buttonClass("primary", "mt-2 md:mt-1")}>
            {BOOK_SECTION.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
