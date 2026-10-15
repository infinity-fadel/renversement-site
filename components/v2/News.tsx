import { ANCHORS, NEWS } from "@/config/v2.content";
import { Button, Container, Eyebrow, SectionTitle } from "./ui";

/** « Actualités » (maquette, nœud `40:709`). */
export default function News({ onJoin }: { onJoin: () => void }) {
  return (
    <section
      id={ANCHORS.news}
      aria-labelledby="titre-actualites"
      className="bg-[#181818] py-16 md:py-[72px]"
    >
      <Container className="flex flex-col items-center gap-10 md:gap-[52px]">
        <Eyebrow>{NEWS.eyebrow}</Eyebrow>
        <SectionTitle className="text-center">
          <span id="titre-actualites">{NEWS.title}</span>
        </SectionTitle>

        <ul className="grid w-full max-w-[1247px] gap-8 md:grid-cols-3 md:gap-[43px]">
          {NEWS.items.map((item, i) => (
            <li
              key={i}
              className="relative flex aspect-[387/446] flex-col justify-end gap-6 overflow-hidden p-8"
            >
              <img
                src={item.image}
                alt=""
                width={387}
                height={446}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,14,0)_8.8%,#120F0E_100%)]"
              />
              <div className="relative flex flex-col gap-2 text-lg font-medium leading-[1.4] text-light-grey">
                <p>{item.kicker}</p>
                <h3>{item.title}</h3>
              </div>
              <Button href={item.url} className="relative self-start">
                {NEWS.readMore}
              </Button>
            </li>
          ))}
        </ul>

        <Button onClick={onJoin}>{NEWS.cta}</Button>
      </Container>
    </section>
  );
}
