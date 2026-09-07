import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// L'enregistrement du plugin ne doit se faire que côté navigateur : ScrollTrigger
// s'appuie sur des API DOM absentes lors du rendu serveur des composants "use client".
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
