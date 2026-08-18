"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SITE_CONFIG } from "@/config/site.config";
import { gsap } from "@/lib/gsap";

/**
 * Section 00 — Écran de chargement (§6.1)
 * Installe l'univers premium, précharge les ressources critiques,
 * lien "Passer l'introduction" toujours disponible.
 */
export default function Section00Loader({
  onDone,
}: {
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const isFinishing = useRef(false);

  // Apparition progressive du logo puis du texte (§6.1 — signalé manquant au
  // debrief V1 : le logo s'affichait d'un bloc, en même temps que tout le
  // reste). Le logo monte en opacité et se desserre légèrement, les lignes de
  // texte suivent en cascade. L'état final est celui du HTML par défaut, donc
  // rien ne disparaît si l'animation ne se joue pas.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = introRef.current;
    if (!root) return;

    const logo = root.querySelector("[data-loader-logo]");
    const lines = root.querySelectorAll("[data-loader-line]");

    const tl = gsap.timeline();
    if (logo) {
      tl.fromTo(
        logo,
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, duration: 0.9, ease: "power2.out" }
      );
    }
    if (lines.length) {
      tl.fromTo(
        lines,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" },
        "-=0.45"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    // Simulation de préchargement — à remplacer par un vrai suivi des
    // ressources critiques (polices, image du hero, etc.) si besoin.
    const start = performance.now();
    const DURATION_MS = 1400; // court, ne bloque pas l'utilisateur (§6.1)

    const tick = (now: number) => {
      const pct = Math.min(100, Math.round(((now - start) / DURATION_MS) * 100));
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (isFinishing.current) return; // anti double-déclenchement (fin du timer + clic "Passer")
    isFinishing.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const node = containerRef.current;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!node || prefersReducedMotion) {
      setIsVisible(false);
      onDone();
      return;
    }

    // Transition de sortie en ouverture circulaire vers la section 01/02 (§6.1)
    gsap.to(node, {
      clipPath: "circle(0% at 50% 50%)",
      duration: 0.9,
      ease: "power2.inOut",
      onComplete: () => {
        setIsVisible(false);
        onDone();
      },
    });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-label="Chargement de l'expérience"
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-6"
      style={{ clipPath: "circle(150% at 50% 50%)" }}
    >
      <div
        ref={introRef}
        className="flex flex-col items-center gap-6"
      >
        <Image
          data-loader-logo
          src="/logo/R-or.png"
          alt=""
          aria-hidden="true"
          width={64}
          height={64}
          priority
          className="w-12 h-12 sm:w-14 sm:h-14"
        />
        <p
          data-loader-line
          className="font-display text-2xl tracking-widest2 uppercase text-light-grey"
        >
          {SITE_CONFIG.name}
        </p>
        <p
          data-loader-line
          className="text-xs tracking-widest2 uppercase text-light-grey/60"
        >
          Une autre lecture est en cours de chargement
        </p>
      </div>

      <div className="w-48 sm:w-64 h-px bg-light-grey/20 mt-4 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-terracota transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] tracking-widest2 text-light-grey/40 tabular-nums">
        {progress} — 100 %
      </p>

      <button
        type="button"
        onClick={finish}
        className="mt-8 text-[11px] tracking-widest2 uppercase text-light-grey/50 hover:text-terracota underline underline-offset-4"
      >
        Passer l&apos;introduction
      </button>
    </div>
  );
}
