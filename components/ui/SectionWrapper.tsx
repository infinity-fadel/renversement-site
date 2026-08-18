"use client";

import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";

export default function SectionWrapper({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, isInView } = useInView<HTMLElement>();

  // Applique la classe .is-visible définie dans globals.css (transition fade + slide)
  useEffect(() => {
    if (isInView) ref.current?.classList.add("is-visible");
  }, [isInView, ref]);

  return (
    <section
      id={id}
      ref={ref}
      // `min-h-screen` sur mobile forçait chaque section à occuper tout le
      // viewport : avec un contenu court, ça produisait les grandes zones
      // vides signalées au debrief V1 (entre le CTA du hero et la section 03,
      // avant "Retournez la carte", avant "Le Cercle"…). Sur petit écran on
      // laisse donc la section se dimensionner à son contenu, avec un plancher
      // et un rembourrage réduits ; le plein écran ne reprend qu'à partir de
      // `md`, où le rythme d'une section par écran fait sens.
      // La gouttière `2xl:px-80` réserve la place de ProgressIndicator, qui
      // n'affiche son libellé qu'à partir de `2xl` (voir ce composant : les
      // deux valeurs sont couplées). Elle est symétrique pour ne pas décentrer
      // le contenu — le debrief demande au contraire de recentrer la section 09.
      className={`reveal min-h-[60vh] md:min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 2xl:px-80 py-14 sm:py-20 md:py-24 [@media(max-height:820px)]:py-10 ${className}`}
    >
      {children}
    </section>
  );
}
