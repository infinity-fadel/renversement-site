"use client";

import { ANCHORS, AUTHOR } from "@/config/v2.content";
import { useArmedReveal } from "@/hooks/useArmedReveal";
import { Container, Eyebrow, SectionTitle } from "./ui";

/**
 * « L'auteur » (maquette, nœud `22:26`).
 *
 * Le portrait est le composant `Photo animation` (`54:1225`) : à l'état
 * `image start`, trois étiquettes — ENTREPRENEUR, INVESTISSEUR, BÂTISSEUR —
 * sont posées sur la photo mais transparentes ; elles apparaissent à l'état
 * `image end`. On les fait entrer l'une après l'autre quand le portrait arrive
 * à l'écran. Rendu par défaut : étiquettes visibles (cf. useArmedReveal).
 */
export default function AuthorSection() {
  const { ref, armed } = useArmedReveal<HTMLDivElement>(0.45);

  return (
    <section
      id={ANCHORS.author}
      aria-labelledby="titre-auteur"
      className="bg-black pt-16 md:pt-[68px]"
    >
      <Container className="grid items-center gap-12 lg:grid-cols-[539px_1fr] lg:justify-between">
        <div className="mx-auto flex max-w-[539px] flex-col items-center gap-10 text-center md:gap-[60px]">
          <Eyebrow>{AUTHOR.eyebrow}</Eyebrow>
          <SectionTitle>
            <span id="titre-auteur">{AUTHOR.name}</span>
          </SectionTitle>
          <div className="space-y-[1.4em] text-base leading-[1.4] text-light-grey">
            {AUTHOR.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>

        <div
          ref={ref}
          className="relative mx-auto aspect-[580/576] w-full max-w-[580px] lg:mr-0"
        >
          <img
            src="/v2/auteur-portrait.webp"
            alt="Ismaël Adam Cissé"
            width={580}
            height={576}
            className="h-full w-full object-contain"
          />
          {AUTHOR.labels.map((label, i) => (
            <span
              key={label.text}
              className="absolute border-b border-terracota bg-black px-2.5 py-1 text-[11px] tracking-widest2 text-light-grey transition-[opacity,transform] duration-700 ease-reveal sm:text-base"
              style={{
                left: label.left,
                right: label.right,
                top: label.top,
                opacity: armed ? 0 : 1,
                transform: armed ? "translateY(10px)" : "none",
                transitionDelay: armed ? "0ms" : `${250 + i * 350}ms`,
              }}
            >
              {label.text}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
