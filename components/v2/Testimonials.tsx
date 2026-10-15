"use client";

import { useEffect, useRef, useState } from "react";
import { ANCHORS, TESTIMONIALS } from "@/config/v2.content";
import { Container, Eyebrow, SectionTitle, buttonClass } from "./ui";

/**
 * « Témoignages early readers » (maquette, nœud `30:120`).
 *
 * Carrousel à défilement natif (`scroll-snap`) plutôt qu'une piste animée en
 * JS : le doigt, la molette et le clavier fonctionnent sans code, et le
 * contenu reste lisible sans JavaScript. Les points de pagination suivent la
 * position réelle et permettent d'y sauter.
 *
 * Une « page » = ce que la largeur affiche (4 cartes en 1512, 1 sur mobile).
 * Avec les quatre témoignages actuels il n'y a qu'une page sur grand écran :
 * les points ne s'affichent alors pas, plutôt que d'en montrer trois qui ne
 * mènent nulle part comme dans la maquette.
 */
export default function Testimonials() {
  const trackRef = useRef<HTMLUListElement | null>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      // Largeur nulle tant que la piste n'est pas mise en page : la division
      // donnait alors Infinity, et `Array.from({ length: Infinity })` faisait
      // planter TOUTE la page (« Application error »). On garde l'état actuel.
      const width = track.clientWidth;
      if (width <= 0) return;
      const count = Math.min(
        TESTIMONIALS.items.length,
        Math.max(1, Math.round(track.scrollWidth / width))
      );
      setPages(count);
      setPage(Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / width))));
    };
    measure();

    const resize = new ResizeObserver(measure);
    resize.observe(track);
    track.addEventListener("scroll", measure, { passive: true });
    return () => {
      resize.disconnect();
      track.removeEventListener("scroll", measure);
    };
  }, []);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  };

  return (
    <section
      id={ANCHORS.testimonials}
      aria-labelledby="titre-temoignages"
      className="bg-black pb-8 pt-16 md:pb-10 md:pt-24"
    >
      <Container className="flex flex-col items-center gap-10 md:gap-[52px]">
        <Eyebrow className="text-center">{TESTIMONIALS.eyebrow}</Eyebrow>
        <SectionTitle className="text-center !tracking-[0.05em]">
          <span id="titre-temoignages">{TESTIMONIALS.title}</span>
        </SectionTitle>

        <ul
          ref={trackRef}
          className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:gap-8"
        >
          {TESTIMONIALS.items.map((t) => (
            <li
              key={t.name}
              className="flex w-full shrink-0 snap-start flex-col justify-center gap-8 border-b border-terracota bg-[rgba(179,114,32,0.15)] p-6 sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-96px)/4)]"
            >
              <blockquote className="text-base italic leading-[1.4] text-light-grey">
                <p>“{t.quote}”</p>
              </blockquote>
              <div className="flex items-start gap-3.5">
                <img
                  src={t.photo}
                  alt=""
                  width={52}
                  height={52}
                  className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
                />
                <div className="leading-[1.4]">
                  <p className="font-display text-[22px] tracking-[0.02em] text-light-grey">
                    {t.name}
                  </p>
                  <p className="text-sm italic tracking-[0.03em] text-light-grey/70">{t.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {pages > 1 && (
          <div className="flex items-center gap-2" role="group" aria-label="Pages des témoignages">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1} sur ${pages}`}
                aria-current={i === page}
                className={`h-4 w-4 rounded-full transition-colors ${
                  i === page ? "bg-terracota" : "bg-light-grey/20 hover:bg-light-grey/40"
                }`}
              />
            ))}
          </div>
        )}

        <a href={`#${ANCHORS.order}`} className={buttonClass("primary")}>
          {TESTIMONIALS.cta}
        </a>
      </Container>
    </section>
  );
}
