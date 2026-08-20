"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { gsap } from "@/lib/gsap";

/**
 * Section 06 — Le basculement (§6.7)
 * Les deux colonnes (avant/après) restent toujours visibles et lisibles
 * (référence maquette) ; seul le mot-clé mis en avant passe en or à
 * l'activation. Chaque flèche double au centre d'une ligne est cliquable et
 * n'anime QUE sa propre ligne (référence maquette) ; le bouton
 * "Activez la bascule" reste disponible pour basculer les trois d'un coup.
 */
const SHIFTS: Array<{ before: string; afterPrefix: string; afterHighlight: string }> = [
  { before: "Continent aidé", afterPrefix: "Continent ", afterHighlight: "moteur" },
  { before: "Continent financé", afterPrefix: "Continent ", afterHighlight: "financeur" },
  { before: "Continent observé", afterPrefix: "Continent ", afterHighlight: "qui agit" },
];

const DOT_PATTERN = {
  backgroundImage:
    "radial-gradient(rgba(239,239,232,0.16) 1px, transparent 1px)",
  backgroundSize: "10px 10px",
};

export default function Section06Shift() {
  const [activated, setActivated] = useState<boolean[]>(
    SHIFTS.map(() => false)
  );
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const conclusionRef = useRef<HTMLParagraphElement>(null);
  const conclusionWrapperRef = useRef<HTMLDivElement>(null);

  const flashRow = (index: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const row = rowRefs.current[index];
    if (!row) return;
    gsap.fromTo(
      row,
      { opacity: 0.35 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  };

  const toggleRow = (index: number) => {
    setActivated((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    flashRow(index);
  };

  const toggleAll = () => {
    const nextValue = !activated.every(Boolean);
    setActivated(SHIFTS.map(() => nextValue));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = rowRefs.current.filter(Boolean) as HTMLElement[];
    if (rows.length) {
      gsap.fromTo(
        rows,
        { opacity: 0.35 },
        { opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }
      );
    }
  };

  const allActivated = activated.every(Boolean);

  // Phrase de conclusion demandée au debrief V1 : elle doit apparaître en grand
  // sous le bouton « Activez la bascule », une fois la bascule effectuée.
  //
  // C'est la HAUTEUR du conteneur qui est animée, pas seulement l'opacité : en
  // laissant la phrase occuper sa place dans le flux à l'état masqué, elle
  // ajoutait ~150 px de vide sous le bouton sur mobile — exactement le défaut
  // que le debrief demande de corriger entre « ACTIVEZ LA BASCULE » et
  // « RETOURNEZ LA CARTE ». Le conteneur part donc de 0 et s'ouvre au clic.
  useEffect(() => {
    const wrapper = conclusionWrapperRef.current;
    const node = conclusionRef.current;
    if (!wrapper || !node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(wrapper, { height: allActivated ? "auto" : 0 });
      gsap.set(node, { opacity: allActivated ? 1 : 0, y: 0 });
      return;
    }

    gsap.to(wrapper, {
      height: allActivated ? "auto" : 0,
      duration: allActivated ? 0.7 : 0.35,
      ease: "power2.out",
    });
    gsap.to(node, {
      opacity: allActivated ? 1 : 0,
      y: allActivated ? 0 : 16,
      duration: allActivated ? 0.9 : 0.25,
      delay: allActivated ? 0.15 : 0,
      ease: "power2.out",
    });
  }, [allActivated]);

  return (
    <SectionWrapper id="shift" className="text-center relative overflow-hidden">
      {/* Image de fond (debrief V1).
          Le voile est un vignettage *inversé* : sombre au centre, clair sur les
          bords. Tout le contenu de la section (titre, colonnes avant/après,
          bouton) tient dans une colonne centrale d'au plus 768 px, donc c'est
          au centre qu'il faut protéger la lisibilité — et sur les côtés, en
          haut et en bas, qu'on peut laisser l'image se voir vraiment.
          Un vignettage classique (bords sombres) faisait exactement l'inverse
          et ne laissait plus que ~7 % de la luminosité de l'image. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <Image
          src="/images/bascule-bg.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 58% 62% at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.42) 75%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </div>

      <h2 className="font-display text-lg sm:text-2xl uppercase max-w-2xl text-light-grey leading-relaxed">
        Les mots fixent les rôles.
        <br />
        Le renversement <span className="text-terracota">les déplace.</span>
      </h2>

      {/* Repère décoratif (cf. sections 04/05) */}
      <div aria-hidden="true" className="flex flex-col items-center my-6">
        <span className="w-24 sm:w-40 h-px bg-[repeating-linear-gradient(to_right,#B4742A_0,#B4742A_2px,transparent_2px,transparent_6px)]" />
        <span className="w-3 h-3 rounded-full border border-dashed border-terracota flex items-center justify-center mt-1.5">
          <span className="w-1 h-1 rounded-full bg-terracota" />
        </span>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex justify-between px-1 sm:px-4 mb-3 text-[11px] tracking-widest2 uppercase text-light-grey/80">
          <span>Avant</span>
          <span>Après</span>
        </div>

        <div className="flex flex-col gap-4">
          {SHIFTS.map((shift, i) => (
            <div
              key={shift.before}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className="flex items-center gap-2 sm:gap-6"
            >
              <div
                className="flex-1 min-w-0 border border-terracota/30 bg-black/70 py-4 sm:py-5 pl-6 sm:pl-9 pr-3 sm:pr-6 text-left"
                style={{
                  clipPath:
                    "polygon(10px 0, 100% 0, 100% 100%, 10px 100%, 0 50%)",
                  ...DOT_PATTERN,
                }}
              >
                <span className="text-xs sm:text-base uppercase tracking-wide text-light-grey">
                  {shift.before}
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleRow(i)}
                aria-pressed={activated[i]}
                aria-label={`Basculer la ligne « ${shift.before} »`}
                className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-dashed border-terracota/60 flex items-center justify-center hover:bg-terracota/10 transition-colors"
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B4742A"
                  strokeWidth="1.5"
                >
                  <path
                    d="M3 12h18M3 12l5-5M3 12l5 5M21 12l-5-5M21 12l-5 5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                className="flex-1 min-w-0 border border-terracota/30 bg-black/70 py-4 sm:py-5 pr-7 sm:pr-10 pl-3 sm:pl-6 text-right"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                  ...DOT_PATTERN,
                }}
              >
                {/* `whitespace-nowrap` seulement à partir de `sm` : sur mobile
                    il empêchait le retour à la ligne, et la fin du mot passait
                    sous la pointe du chevron (signalé au debrief V1 — « les
                    derniers mots au niveau de APRÈS ne sont pas totalement
                    visibles »). */}
                <span className="text-xs sm:text-base uppercase tracking-wide text-light-grey sm:whitespace-nowrap">
                  {shift.afterPrefix}
                  <span
                    className={`font-display transition-colors duration-500 ${
                      activated[i] ? "text-terracota" : "text-light-grey/70"
                    }`}
                  >
                    {shift.afterHighlight}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 max-w-lg text-sm text-light-grey/60">
        Une place n&apos;est jamais définitive.
        <br />
        Elle dépend du <span className="text-terracota">regard</span>, des{" "}
        <span className="text-terracota">choix</span> et du{" "}
        <span className="text-terracota">mouvement</span>.
      </p>

      <button
        type="button"
        onClick={toggleAll}
        aria-pressed={allActivated}
        className="mt-8 flex items-center gap-4 group"
      >
        <span className="w-14 h-14 rounded-full border border-terracota/60 flex items-center justify-center group-hover:bg-terracota/10 transition-colors">
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B4742A"
            strokeWidth="1.5"
          >
            <path d="M9 3a9 9 0 1 0 6 15.5" strokeLinecap="round" />
            <path d="M14 2l2 3-3 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs tracking-widest2 uppercase text-terracota">
          {allActivated ? "Revenir à avant" : "Activez la bascule"}
        </span>
      </button>

      <div
        ref={conclusionWrapperRef}
        style={{ height: 0, overflow: "hidden" }}
        className="w-full flex justify-center"
      >
        <p
          ref={conclusionRef}
          aria-live="polite"
          style={{ opacity: 0 }}
          className="mt-8 max-w-3xl font-display text-[clamp(1.1rem,2.5vw,1.85rem)] uppercase leading-tight text-light-grey"
        >
          Le renversement commence lorsque nous cessons de confondre une
          habitude avec <span className="text-terracota">une vérité.</span>
        </p>
      </div>
    </SectionWrapper>
  );
}
