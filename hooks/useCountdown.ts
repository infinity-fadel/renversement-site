"use client";

import { useEffect, useState } from "react";
import { COUNTDOWN_CONFIG } from "@/config/site.config";

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
};

/**
 * Calcule le temps restant jusqu'à la date cible.
 *
 * Note fuseau horaire : Africa/Abidjan est UTC+0 en permanence (pas de DST),
 * donc `Date.now()` (toujours en UTC en interne) et la cible ISO en "Z"
 * sont directement comparables sans conversion. On n'a besoin d'un
 * formatage explicite "Africa/Abidjan" que si on affiche une heure lisible
 * (voir formatAbidjanTime ci-dessous) — pas pour le calcul du delta.
 */
function getTimeLeft(target: Date): TimeLeft {
  const totalMs = Math.max(0, target.getTime() - Date.now());

  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const seconds = Math.floor((totalMs / 1000) % 60);

  return { days, hours, minutes, seconds, totalMs, isExpired: totalMs === 0 };
}

export function useCountdown(targetDate: Date = COUNTDOWN_CONFIG.targetDate) {
  // Rendu initial neutre (SSR-safe) puis hydratation côté client
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    getTimeLeft(targetDate)
  );

  useEffect(() => {
    // Se resynchronise immédiatement au montage (au cas où le SSR ait un léger décalage)
    setTimeLeft(getTimeLeft(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/** Formate la date cible en heure lisible d'Abidjan, pour affichage (ex: mentions légales, footer). */
export function formatAbidjanTime(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Abidjan",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
