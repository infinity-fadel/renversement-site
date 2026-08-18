"use client";

import { useState } from "react";
import StarfieldBackground from "@/components/ui/StarfieldBackground";
import GlobeBackground from "@/components/ui/GlobeBackground";
import Nav from "@/components/Nav";
import ProgressIndicator from "@/components/ProgressIndicator";
import Section00Loader from "@/components/sections/Section00Loader";
import Section02Hero from "@/components/sections/Section02Hero";
import Section03Direction from "@/components/sections/Section03Direction";
import Section04Observe from "@/components/sections/Section04Observe";
import Section05Clues from "@/components/sections/Section05Clues";
import Section06Shift from "@/components/sections/Section06Shift";
import Section07FlipCard from "@/components/sections/Section07FlipCard";
import Section08Urgency from "@/components/sections/Section08Urgency";
import Section09Circle from "@/components/sections/Section09Circle";
import Section10Final from "@/components/sections/Section10Final";
import Section11Footer from "@/components/sections/Section11Footer";

export default function Home() {
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  return (
    <>
      <StarfieldBackground />
      <GlobeBackground />

      {!isLoaderDone && (
        <Section00Loader onDone={() => setIsLoaderDone(true)} />
      )}

      <Nav />
      <ProgressIndicator />

      <main>
        {/* L'animation d'entrée du hero ne démarre qu'une fois l'écran de
            chargement levé : sans ça elle se jouait derrière l'overlay et
            personne ne la voyait (cf. Section02Hero). */}
        <Section02Hero start={isLoaderDone} />
        <Section03Direction />
        <Section04Observe />
        <Section05Clues />
        <Section06Shift />
        <Section07FlipCard />
        <Section08Urgency />
        <Section09Circle />
        <Section10Final />
      </main>

      <Section11Footer />
    </>
  );
}
