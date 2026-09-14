"use client";

import { useState } from "react";
import StarfieldBackground from "@/components/ui/StarfieldBackground";
import GlobeBackground from "@/components/ui/GlobeBackground";
import ReadingLight from "@/components/ui/ReadingLight";
import Nav from "@/components/Nav";
import ProgressIndicator from "@/components/ProgressIndicator";
import Section00Loader from "@/components/sections/Section00Loader";
import Section02Hero from "@/components/sections/Section02Hero";
import IntroVideo from "@/components/ui/IntroVideo";
import Section03Direction from "@/components/sections/Section03Direction";
import Section04Observe from "@/components/sections/Section04Observe";
import Section05Clues from "@/components/sections/Section05Clues";
import Section06Circle from "@/components/sections/Section06Circle";
import Section07Shift from "@/components/sections/Section07Shift";
import Section08FlipCard from "@/components/sections/Section08FlipCard";
import Section09Urgency from "@/components/sections/Section09Urgency";
import RejoinCircle from "@/components/ui/RejoinCircle";
import Section10Final from "@/components/sections/Section10Final";
import Section11Footer from "@/components/sections/Section11Footer";

export default function Home() {
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  return (
    <>
      <StarfieldBackground />
      <GlobeBackground />
      <ReadingLight />

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
        {/* Emplacement de la vidéo (3e debrief). Ne rend rien tant que le
            fichier n'est pas renseigné — voir components/ui/IntroVideo.tsx. */}
        <IntroVideo />
        <Section03Direction />
        <Section04Observe />
        <Section05Clues />
        {/* Le formulaire est remonté ici au 5e retour client : juste après la
            phrase « C'est peut-être un problème de clés. » qui ferme les
            indices. Il fermait la page auparavant. */}
        <Section06Circle />
        <Section07Shift />
        <Section08FlipCard />
        <Section09Urgency />
        {/* Sa place d'avant, occupée par un simple rappel vers #circle pour
            qui n'a pas rempli le formulaire en chemin. */}
        <RejoinCircle />
        <Section10Final />
      </main>

      <Section11Footer />
    </>
  );
}
