"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { gsap } from "@/lib/gsap";

const TITLE = "Le monde regarde l'Afrique comme un continent à financer.";

/**
 * Section 02 — Hero (§6.3)
 *
 * Deux comportements demandés au debrief V1 :
 *
 * 1. Le titre se révèle mot par mot par masque (overflow-hidden + translation).
 *    Cette animation existait déjà mais restait invisible : le hero est monté
 *    dès le premier rendu et se trouve dans le viewport, donc elle se jouait
 *    intégralement *sous* l'écran de chargement (1,4 s + 0,9 s de sortie) et
 *    était terminée quand l'overlay se levait. Elle est désormais déclenchée
 *    par `start`, que app/page.tsx passe à `true` à la fin du loader — plus par
 *    un IntersectionObserver, inutile ici puisque la section est toujours en
 *    haut de page.
 *
 * 2. La phrase « Et si la réalité était exactement l'inverse ? » reste
 *    affichée renversée à 180° et ne se redresse qu'au survol (§6.3, precisé au
 *    debrief). Le retournement est en CSS et non en GSAP : c'est un état
 *    d'interaction, pas une animation d'entrée, et le CSS gère survol, focus
 *    clavier et `prefers-reduced-motion` sans code supplémentaire.
 *
 *    Deux réglages de fluidité à ne pas retirer (retour du 4e debrief, « le
 *    mouvement n'est pas fluide ») :
 *
 *    - la courbe est `ease-flip`, pas `ease-reveal` : voir tailwind.config.ts,
 *      l'expo-out des révélations expédiait le demi-tour en 150 ms puis
 *      s'immobilisait pendant 300 ms ;
 *    - `transform-gpu` + `will-change-transform` promeuvent la phrase sur sa
 *      propre couche de composition. Sans ça le navigateur re-rastérise les
 *      glyphes à chaque angle intermédiaire et les bords scintillent pendant
 *      la rotation. `backface-visibility:hidden` supprime le tremblement d'un
 *      demi-pixel au passage par 90°.
 */
export default function Section02Hero({ start = true }: { start?: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  // Alternative tactile au survol : sur mobile il n'y a pas de `:hover`, donc
  // un appui bascule l'état.
  const [isTapped, setIsTapped] = useState(false);

  useEffect(() => {
    if (!start || hasAnimated.current) return;
    hasAnimated.current = true;

    // L'état final est déjà le rendu HTML par défaut : on ne joue que l'entrée,
    // jamais le contenu lisible.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = titleRef.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words?.length) return;

    gsap.fromTo(
      words,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.9, stagger: 0.04, ease: "power3.out" }
    );
  }, [start]);

  return (
    <SectionWrapper id="hero" className="text-center relative overflow-hidden">
      {/* Visuel immersif de fond (debrief V1 : « impression plus
          cinématographique » dès les premières secondes). Volontairement très
          assombri et flouté sur les bords : il doit se deviner derrière le
          texte, pas concurrencer sa lisibilité. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <Image
          src="/images/hero-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        {/* Vignettage : assombrit les bords et le centre sous le titre pour
            garantir le contraste du texte clair par-dessus. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.94) 100%)",
          }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(180,116,42,0.12), transparent 60%)",
        }}
      />

      <h1
        ref={titleRef}
        className="font-display text-[clamp(1.75rem,5vw,3.5rem)] leading-tight max-w-4xl uppercase text-light-grey"
      >
        {/*
          L'espace inter-mots est un nœud texte placé ENTRE les masques, jamais
          à l'intérieur : dans un `inline-block` en `overflow-hidden`, l'espace
          finale est supprimée par le traitement des blancs CSS, et le titre se
          rendait en un seul mot (« LEMONDEREGARDEL'AFRIQUE… »).
        */}
        {TITLE.split(" ").map((word, i, words) => (
          <Fragment key={i}>
            <span className="inline-block overflow-hidden align-top">
              <span data-word className="inline-block">
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : ""}
          </Fragment>
        ))}
      </h1>

      {/*
        Affichée renversée en permanence, redressée au survol / au focus
        clavier / à l'appui. `tabIndex` la rend atteignable au clavier : sans
        ça, un utilisateur qui ne peut pas survoler n'aurait aucun moyen de la
        remettre à l'endroit. Le texte reste dans l'ordre normal dans le DOM,
        donc les lecteurs d'écran le lisent correctement quel que soit l'état.
      */}
      <p
        tabIndex={0}
        onClick={() => setIsTapped((v) => !v)}
        aria-label="Et si la réalité était exactement l'inverse ?"
        className={`group font-display text-[clamp(1.5rem,4.2vw,3rem)] leading-tight max-w-3xl mt-6 uppercase text-terracota cursor-pointer transition-transform duration-700 ease-flip transform-gpu will-change-transform [backface-visibility:hidden] hover:rotate-0 focus-visible:rotate-0 ${
          isTapped ? "rotate-0" : "rotate-180"
        }`}
      >
        Et si la réalité était exactement l&apos;inverse ?
      </p>

      <p className="mt-8 text-sm sm:text-base text-light-grey/60 max-w-md">
        Une question s&apos;apprête à changer le sens de la lecture.
      </p>

      <a
        href="#direction"
        className="mt-12 inline-block text-xs tracking-widest2 uppercase border border-terracota text-terracota px-8 py-4 hover:bg-terracota hover:text-black transition-colors"
      >
        Entrer dans le renversement
      </a>
    </SectionWrapper>
  );
}
