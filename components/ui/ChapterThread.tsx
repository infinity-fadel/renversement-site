"use client";

import { useEffect, useRef } from "react";
import { SECTIONS } from "@/config/sections.config";
import { horizonGeometry } from "./globe-config";

/**
 * Transitions de chapitre (§7.1) — le fil d'horizon et la lumière de lecture.
 *
 * Le cahier des charges pose deux contraintes qui, ensemble, dictent la forme
 * de ce composant :
 *
 *   « Les transitions entre sections doivent conserver la continuité visuelle. »
 *   « Le scroll ne doit pas être verrouillé sur de longues séquences. »
 *
 * Donc pas de section épinglée ni de séquence qui confisque le défilement, et
 * surtout : *un seul objet* qui traverse tout le site en changeant d'état,
 * plutôt qu'un effet différent par frontière. Onze idées ne font pas une
 * continuité.
 *
 * L'objet est un filet or qui ne s'allume ni ne s'éteint — il se déforme :
 *
 *   02 hero      trait court sous le CTA, à peine posé
 *   03 direction le trait s'étend sur toute la largeur
 *   04 observe   il commence à s'incurver — l'horizon s'annonce
 *   05 indices   il épouse le limbe du globe et se scinde en quatre : les
 *                quatre indices posés sur la courbure de la Terre
 *   06 bascule   les segments se rejoignent, le fil se décolle et s'incline —
 *                le fléau de la balance, au moment exact du basculement
 *   07 carte     il redescend sous la carte
 *   08 rebours   il s'enroule en anneau autour du compte à rebours
 *   09 cercle    l'anneau se referme — le Cercle, c'est la ligne bouclée
 *   10 finale    il se dilate et se dilue dans le halo
 *   11 footer    il s'efface (le footer n'est pas animé, §6.12)
 *
 * Pourquoi le limbe du globe tombe sur le chapitre 05 et non 04 : le globe de
 * fond ne rejoint sa position « horizon » qu'après un viewport entier de
 * scroll au-delà du haut de la section 04 (cf. GlobeBackground). Quand la 04
 * est centrée, c'est encore une planète posée à droite de l'écran ; l'arc du
 * bas ne l'a rejointe qu'une section plus loin. Caler le raccord sur la 04
 * dessinait deux courbes sans rapport.
 *
 * Toutes ces formes sont le MÊME arc de cercle, décrit par quatre nombres :
 * courbure, longueur développée, position du sommet, rotation. Un trait droit
 * est simplement une courbure nulle, un anneau une courbure forte dont la
 * longueur boucle. C'est ce qui rend le morphing continu sans avoir à
 * interpoler des chemins SVG de topologies différentes — impossible à faire
 * proprement entre un segment, quatre segments et un cercle.
 *
 * On interpole la COURBURE (1/r) et non le rayon : de 0 à 1/230, le rayon
 * passerait par des valeurs immenses au début et l'arc resterait visuellement
 * plat pendant les trois quarts de la transition.
 *
 * La lumière de lecture partage cette boucle plutôt que d'en ouvrir une
 * seconde : elle lit la même progression, et la page fait déjà tourner deux
 * `requestAnimationFrame` (StarfieldBackground, GlobeBackground).
 */

/** Couleur du logo — cf. le token `terracota` de tailwind.config.ts. */
const GOLD = "#B4742A";

/** Points échantillonnés le long de l'arc. 96 suffit pour un filet d'1 px. */
const SAMPLES = 96;

/** Taille du cadran du compte à rebours — doit suivre Countdown.tsx (§ écrans bas). */
const COUNTDOWN_RING = (vh: number) => Math.min(380, vh * 0.38);

type Frame = {
  /** Longueur développée du fil, en fraction de la largeur de viewport. */
  len: number;
  /** Sommet de l'arc, en fraction de la hauteur de viewport. */
  apex: number;
  /** Inclinaison en degrés, autour du sommet. */
  rot: number;
  /** Nombre de segments (1 = fil continu, 4 = scindé). */
  seg: number;
  /** Opacité du filet. */
  op: number;
  /** Opacité de la lumière de lecture. */
  light: number;
  /** Rayon de la lumière, en fraction de la largeur de viewport. */
  lightR: number;
};

const FRAMES: Record<string, Frame> = {
  hero: { len: 0.2, apex: 0.88, rot: 0, seg: 1, op: 0.3, light: 0.25, lightR: 0.5 },
  direction: { len: 0.74, apex: 0.85, rot: 0, seg: 1, op: 0.5, light: 0.3, lightR: 0.55 },
  observe: { len: 1.05, apex: 0.85, rot: 0, seg: 1, op: 0.4, light: 0.22, lightR: 0.7 },
  clues: { len: 1.25, apex: 0.83, rot: 0, seg: 4, op: 0.5, light: 0.3, lightR: 0.6 },
  // La seule éclipse du parcours, et elle est voulue — ne pas la « réparer ».
  //
  // La 06 est la seule section dont l'image de fond est claire et chargée
  // (chantier + ville dorée en plein cadre). Un filet d'1 px posé dessus ne se
  // lit plus comme un fil conducteur mais comme une rayure : on ne comprend
  // plus ce qu'il fait. Retour du 4e debrief, vérifié en capture.
  //
  // Il ne disparaît donc pas, il PASSE DERRIÈRE l'image : `op` tombe à 0 en
  // entrant dans le chapitre et remonte en sortant. Et comme l'inclinaison,
  // elle, reste dans la table, on le voit basculer pendant qu'il s'efface puis
  // revenir redressé de l'autre côté — la bascule a eu lieu pendant qu'il
  // était caché. C'est un meilleur récit qu'un fléau que personne ne
  // déchiffre.
  //
  // Sommet bas et non à mi-hauteur : posé à 0,66 vh, il traversait
  // « CONTINENT QUI AGIT » en plein milieu.
  shift: { len: 0.72, apex: 0.87, rot: -7.5, seg: 1, op: 0, light: 0.42, lightR: 0.5 },
  flip: { len: 0.6, apex: 0.84, rot: 0, seg: 1, op: 0.45, light: 0.3, lightR: 0.5 },
  urgency: { len: 1, apex: 0.5, rot: 0, seg: 1, op: 0.4, light: 0.28, lightR: 0.45 },
  circle: { len: 1, apex: 0.5, rot: 0, seg: 1, op: 0.5, light: 0.36, lightR: 0.42 },
  final: { len: 1.4, apex: 0.52, rot: 0, seg: 1, op: 0.2, light: 0.5, lightR: 0.75 },
  footer: { len: 0.6, apex: 0.9, rot: 0, seg: 1, op: 0, light: 0, lightR: 0.4 },
};

/** Ordre du parcours, filtré sur les sections qui ont une ancre dans le DOM. */
const ORDER = SECTIONS.map((s) => s.id).filter((id) => id in FRAMES);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Rend le morphing discret plutôt que continu : le fil se tient tranquille
 * pendant qu'on lit un chapitre et ne se déforme qu'au passage à l'autre.
 * Sans ça il bouge en permanence et ne raconte plus aucune frontière.
 */
function plateau(t: number) {
  const e = Math.min(1, Math.max(0, (t - 0.28) / 0.44));
  return e * e * (3 - 2 * e);
}

/**
 * Résout un chapitre en géométrie écran. Trois états empruntent leur courbure
 * à un élément réel de la page plutôt qu'à une constante — c'est ce qui fait
 * que le fil *rejoint* quelque chose au lieu de passer à côté.
 */
function resolve(id: string, vw: number, vh: number) {
  const f = FRAMES[id];
  const globe = horizonGeometry(vw, vh);
  let k = 0;
  let apex = f.apex * vh;
  let drawn = f.len * vw;

  if (id === "observe") {
    // Courbure encore lâche : l'horizon s'annonce sans prétendre être la Terre.
    k = 1 / (globe.radius * 2.4);
  } else if (id === "clues") {
    // Le raccord. Même cercle que le globe, au pixel près.
    k = 1 / globe.radius;
    apex = globe.apexY;
  } else if (id === "flip") {
    k = 1 / (globe.radius * 1.7);
    apex = globe.apexY - vh * 0.02;
  } else if (id === "urgency") {
    // Anneau autour du cadran, un cran plus large pour l'entourer et non le
    // doubler.
    const r = (COUNTDOWN_RING(vh) / 2) * 1.38;
    k = 1 / r;
    apex = vh / 2 - r;
    drawn = 2 * Math.PI * r;
  } else if (id === "circle") {
    const r = Math.min(vw, vh) * 0.29;
    k = 1 / r;
    apex = vh / 2 - r;
    drawn = 2 * Math.PI * r;
  } else if (id === "final") {
    // S'ouvre : grand rayon, arc large et très pâle, qui se confond avec le halo.
    k = 1 / (vh * 1.15);
  }

  return { k, apex, drawn, rot: f.rot, seg: f.seg, op: f.op, light: f.light, lightR: f.lightR };
}

/**
 * Échantillonne l'arc en polyligne. On n'utilise pas la commande `A` de SVG :
 * elle dégénère quand le rayon devient très grand (le trait droit) et ne sait
 * pas décrire un cercle complet d'un seul tenant.
 */
function buildPath(cx: number, apexY: number, k: number, len: number) {
  if (k < 1e-7) {
    const half = len / 2;
    return `M ${(cx - half).toFixed(2)} ${apexY.toFixed(2)} L ${(cx + half).toFixed(2)} ${apexY.toFixed(2)}`;
  }
  const r = 1 / k;
  const sweep = Math.min(len * k, Math.PI * 2);
  const cy = apexY + r;
  const a0 = -Math.PI / 2 - sweep / 2;
  let d = "";
  for (let i = 0; i <= SAMPLES; i++) {
    const a = a0 + (sweep * i) / SAMPLES;
    d += `${i === 0 ? "M" : "L"} ${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `;
  }
  return d.trim();
}

export default function ChapterThread() {
  const haloRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // §7.1 : « possibilité de lecture sans animation ». On dessine alors un
    // horizon fixe, une bonne fois, et on n'ouvre aucune boucle : le fil existe
    // toujours comme élément de composition, il ne suit simplement plus le
    // scroll. Sans ce tracé unique il resterait sur son `d` initial dégénéré,
    // donc purement invisible — ce qui n'est pas « lisible sans animation »,
    // c'est absent.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const d = buildPath(vw / 2, vh * 0.85, 0, vw * 0.74);
      haloRef.current?.setAttribute("d", d);
      lineRef.current?.setAttribute("d", d);
      groupRef.current?.setAttribute("opacity", "0.45");
      return;
    }

    let raf = 0;
    const tick = () => {
      const halo = haloRef.current;
      const line = lineRef.current;
      const group = groupRef.current;
      const light = lightRef.current;

      if (halo && line && group && light) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Progression continue à travers les chapitres : `i + frac` vaut i
        // quand le chapitre i est centré, i+0,5 à la frontière avec le
        // suivant. On se repère sur le centre de chaque section et non sur son
        // bord haut, pour que les sections de hauteurs différentes (03 et 10
        // sont `compact`) pèsent pareil dans le parcours.
        const centers = ORDER.map((id) => {
          const el = document.getElementById(id);
          return el ? el.getBoundingClientRect().top + el.offsetHeight / 2 : NaN;
        });
        const anchor = vh / 2;
        let i = 0;
        let frac = 0;
        if (anchor >= centers[centers.length - 1]) {
          i = centers.length - 1;
        } else if (anchor > centers[0]) {
          for (let j = 0; j < centers.length - 1; j++) {
            if (anchor >= centers[j] && anchor <= centers[j + 1]) {
              i = j;
              const span = centers[j + 1] - centers[j];
              frac = span > 0 ? (anchor - centers[j]) / span : 0;
              break;
            }
          }
        }

        const a = resolve(ORDER[i], vw, vh);
        const b = resolve(ORDER[Math.min(i + 1, ORDER.length - 1)], vw, vh);
        const t = plateau(frac);

        const k = lerp(a.k, b.k, t);
        const apex = lerp(a.apex, b.apex, t);
        const drawn = lerp(a.drawn, b.drawn, t);
        const rot = lerp(a.rot, b.rot, t);
        const seg = lerp(a.seg, b.seg, t);
        const op = lerp(a.op, b.op, t);

        const cx = vw / 2;
        const d = buildPath(cx, apex, k, drawn);
        halo.setAttribute("d", d);
        line.setAttribute("d", d);

        // Le fil se scinde par pointillés plutôt qu'en quatre chemins : la
        // géométrie reste un seul tracé, seul l'espacement s'ouvre, donc le
        // passage de 1 à 4 segments est interpolable.
        const circumference = k > 1e-7 ? (Math.PI * 2) / k : Infinity;
        const total = Math.min(drawn, circumference);
        const gap = (seg - 1) * 26;
        const dash = seg > 1.01 ? `${(total - gap * 3) / 4} ${gap}` : "none";
        halo.setAttribute("stroke-dasharray", dash);
        line.setAttribute("stroke-dasharray", dash);

        group.setAttribute("transform", `rotate(${rot.toFixed(3)} ${cx} ${apex.toFixed(2)})`);
        group.setAttribute("opacity", op.toFixed(3));

        // La lumière de lecture. Son intensité creuse au milieu de chaque
        // transition (`frac` proche de 0,5) : la respiration entre deux
        // chapitres se sent avant de se voir.
        const dip = 1 - 0.45 * Math.sin(Math.PI * frac);
        const lightR = lerp(a.lightR, b.lightR, t) * vw;
        light.style.opacity = (lerp(a.light, b.light, t) * dip).toFixed(3);
        light.style.width = `${(lightR * 2).toFixed(0)}px`;
        light.style.height = `${(lightR * 2).toFixed(0)}px`;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {/*
        Lumière de lecture, DERRIÈRE le contenu : c'est une atmosphère, elle
        n'a rien à dire par-dessus le texte. Purement `opacity` et dimensions,
        aucun repaint de glyphe.
      */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div
          ref={lightRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: "60vw",
            height: "60vw",
            opacity: 0.25,
            background:
              "radial-gradient(circle, rgba(180,116,42,0.15) 0%, rgba(180,116,42,0.05) 42%, transparent 72%)",
            willChange: "opacity",
          }}
        />
      </div>

      {/*
        Le fil, lui, passe DEVANT le contenu. Posé derrière (`-z-10`), il
        disparaissait entièrement sous les sections à image plein cadre — 02,
        05, 06, 07, 08, 09 en ont une — c'est-à-dire sur la majorité du
        parcours : le fil conducteur ne conduisait plus rien. `z-20` le place
        au-dessus des sections mais sous ProgressIndicator (z-40) et Nav
        (z-50), qui doivent rester nets.

        Le `d` initial est un segment dégénéré : le HTML prérendu et le premier
        rendu client sont donc identiques au caractère près, la géométrie
        réelle n'arrivant qu'au premier tour de boucle (contrainte
        d'hydratation, cf. CLAUDE.md).
      */}
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none z-20"
        fill="none"
      >
        <g ref={groupRef} opacity="0.3">
          {/* Deux traits superposés plutôt qu'un filtre de flou : le halo large
              et faible coûte un chemin de plus, là où un feGaussianBlur sur un
              calque plein écran se recalcule à chaque frame. */}
          <path
            ref={haloRef}
            d="M 0 0 L 0 0"
            stroke={GOLD}
            strokeWidth={5}
            strokeOpacity={0.16}
            strokeLinecap="round"
          />
          <path
            ref={lineRef}
            d="M 0 0 L 0 0"
            stroke={GOLD}
            strokeWidth={1}
            strokeOpacity={0.9}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </>
  );
}
