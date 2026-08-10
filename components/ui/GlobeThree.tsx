"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import GlobeSVG from "./GlobeSVG";
import { useInView } from "@/hooks/useInView";
import { GLOBE_CONTAINER_SIZE } from "./globe-config";

/**
 * Globe Three.js — Terre de nuit (§6.5, §16.1 : "Three.js ... selon le
 * prototype validé"). Texture "lumières de nuit" issue du domaine public
 * NASA Black Marble, reprise des exemples officiels three.js
 * (examples/textures/planets/earth_lights_2048.png) et hébergée localement
 * dans public/textures/ — aucune dépendance à un CDN externe en prod.
 *
 * La texture source a ses propres teintes (gris-bleu sur les terres non
 * éclairées) qui ne collent pas à la charte noir/or. Avant de la poser sur
 * la sphère, on la repasse pixel par pixel dans une rampe noir → terracota
 * → or pilotée par la luminance d'origine (voir recolorNightLights) — c'est
 * ce qui donne le rendu "duotone" proche de la référence, pas un simple
 * filtre de teinte global qui laisse transparaître le bleu du fichier NASA.
 *
 * Repli automatique sur GlobeSVG (SVG léger, zéro dépendance) si WebGL ou le
 * chargement de la texture échouent (§8.3 : "dégradation gracieuse").
 * Respecte prefers-reduced-motion en figeant la rotation plutôt qu'en
 * retirant le rendu 3D — l'état visuel final reste riche, seul le
 * mouvement s'arrête.
 */

const TEXTURE_URL = "/textures/earth_night_lights.png";
const AUTO_ROTATE_SPEED = 0.00006; // radians / ms, lent et lisible
const INITIAL_ROTATION_Y = -2.35; // oriente l'Afrique face caméra au chargement (§6.5)

// Rampe de couleur noir chaud → terracota → or, indexée sur la luminance
// (0-255) du pixel d'origine. Élimine la dominante bleu-gris du fichier
// NASA pour rester cohérent avec les tokens de marque (terracota #F2C94C).
const COLOR_RAMP: Array<[number, [number, number, number]]> = [
  [0, [8, 5, 4]],
  [45, [42, 24, 13]],
  [110, [242, 201, 76]],
  [255, [255, 214, 158]],
];

export default function GlobeThree({
  active: activeProp,
  size,
}: {
  // Contrôle externe du moment où la scène démarre (utilisé par
  // GlobeBackground.tsx, qui pilote lui-même la visibilité selon le scroll
  // de toute la page). Si omis, le composant reste autonome : il démarre
  // dès qu'il entre dans le viewport (usage inline classique, ex. mobile).
  active?: boolean;
  // Taille fixe en pixels du canvas (le composant appelant redimensionne
  // alors visuellement via CSS transform, ex. GlobeBackground). Si omis,
  // retombe sur la taille responsive standard.
  size?: number;
}) {
  // La scène ne démarre (chargement texture + boucle de rotation) qu'une
  // fois la section réellement visible à l'écran. Sans ça, la rotation
  // automatique tourne dès le montage de la page — souvent plusieurs
  // dizaines de secondes avant que le visiteur ne scrolle jusqu'ici — et le
  // globe se présente sur une orientation aléatoire au lieu de l'Afrique
  // (§6.5 : "Afrique visible au chargement initial").
  const { ref: viewRef, isInView } = useInView<HTMLDivElement>({
    threshold: 0.2,
  });
  const active = activeProp ?? isInView;
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    if (!active) return;
    const mount = viewRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup = () => {};

    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      try {
        cleanup = setupScene(mount, image, setWebglSupported);
      } catch {
        setWebglSupported(false);
      }
    };
    image.onerror = () => {
      if (!disposed) setWebglSupported(false);
    };
    image.src = TEXTURE_URL;

    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!webglSupported) return <GlobeSVG />;

  return (
    <div
      ref={viewRef}
      role="img"
      aria-label="Globe terrestre de nuit, centré sur l'Afrique, déplaçable au pointeur ou au toucher"
      className="mx-auto select-none"
      style={
        size
          ? { width: size, height: size }
          : {
              width: GLOBE_CONTAINER_SIZE,
              height: GLOBE_CONTAINER_SIZE,
              maxWidth: "80vw",
              maxHeight: "80vw",
            }
      }
    />
  );
}

function setupScene(
  mount: HTMLDivElement,
  image: HTMLImageElement,
  setWebglSupported: (v: boolean) => void
): () => void {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    setWebglSupported(false);
    return () => {};
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const size = mount.clientWidth || 400;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Ratio de pixels forcé à 2 minimum (pas juste plafonné à 2) : ce canvas
  // est parfois étiré jusqu'à ~×5 par transform CSS (état "horizon" de
  // GlobeBackground.tsx). Avec un écran non-Retina (devicePixelRatio: 1),
  // le liseré fin de la lueur de bord n'a alors qu'une poignée de pixels
  // réels pour se dessiner et disparaît quasiment une fois agrandi.
  renderer.setPixelRatio(Math.max(2, Math.min(window.devicePixelRatio, 3)));
  renderer.setSize(size, size);
  // `alpha: true` dans le constructeur active seulement le canal alpha du
  // contexte WebGL ; le renderer efface quand même en noir opaque par
  // défaut tant qu'on ne fixe pas explicitement l'alpha d'effacement à 0.
  // Sans ça, le canvas dessine un carré noir plein derrière le globe —
  // visible en contour contre le fond brun-noir de la section.
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 6;

  const globeGroup = new THREE.Group();
  globeGroup.rotation.y = INITIAL_ROTATION_Y;
  scene.add(globeGroup);

  const recoloredCanvas = recolorNightLights(image);
  const texture = new THREE.CanvasTexture(recoloredCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const globeMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const globeGeometry = new THREE.SphereGeometry(1.5, 48, 48);
  const globe = new THREE.Mesh(globeGeometry, globeMaterial);
  globeGroup.add(globe);

  // Lueur de bord (effet Fresnel) — coque légèrement plus grande, rendue
  // seulement sur les faces arrière, en fondu additif : donne le liseré fin
  // et brillant qui longe le limbe de la planète sur la référence (pas un
  // halo épais et diffus). Coque resserrée à 1.05× et chute très raide
  // (puissance 6) pour un anneau net ; couleur légèrement plus claire que
  // l'or de base (blanc-or) pour un rendu brillant plutôt que simplement
  // teinté. Un anneau aussi fin restait invisible à l'état "horizon" tant
  // que ce canvas devait être étiré jusqu'à ×8-10 par transform CSS — ce
  // problème est réglé côté GlobeBackground.tsx (rayon plafonné), donc plus
  // besoin de garder l'anneau épais ici pour compenser.
  // Le rayon reste bien à l'intérieur du cadre de la caméra (z: 6, cf. plus
  // haut), pas de découpe/débordement du cadre carré.
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0xfbe8ae) } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform vec3 glowColor;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
        gl_FragColor = vec4(glowColor, clamp(intensity, 0.0, 1.0));
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1.5 * 1.08, 48, 48), glowMaterial);
  globeGroup.add(glow);

  let raf = 0;
  let isDragging = false;
  let lastPointerX = 0;

  const animate = () => {
    if (!isDragging && !prefersReducedMotion) {
      globeGroup.rotation.y += AUTO_ROTATE_SPEED * 16.7; // ~1 frame @ 60fps
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  };
  animate();

  const dom = renderer.domElement;
  dom.style.touchAction = "none";
  dom.style.cursor = "grab";

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    lastPointerX = e.clientX;
    dom.style.cursor = "grabbing";
    dom.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - lastPointerX;
    lastPointerX = e.clientX;
    globeGroup.rotation.y += delta * 0.006;
  };
  const onPointerUp = () => {
    isDragging = false;
    dom.style.cursor = "grab";
  };

  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointerleave", onPointerUp);

  const resizeObserver = new ResizeObserver(() => {
    const s = mount.clientWidth || 400;
    renderer.setSize(s, s);
  });
  resizeObserver.observe(mount);

  return () => {
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    dom.removeEventListener("pointerdown", onPointerDown);
    dom.removeEventListener("pointermove", onPointerMove);
    dom.removeEventListener("pointerup", onPointerUp);
    dom.removeEventListener("pointerleave", onPointerUp);
    mount.removeChild(dom);
    globeGeometry.dispose();
    globeMaterial.dispose();
    texture.dispose();
    glow.geometry.dispose();
    glowMaterial.dispose();
    renderer.dispose();
  };
}

/** Repasse la texture "lumières de nuit" dans une rampe noir → terracota → or. */
function recolorNightLights(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const [r, g, b] = sampleRamp(luminance);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

function sampleRamp(luminance: number): [number, number, number] {
  for (let i = 0; i < COLOR_RAMP.length - 1; i++) {
    const [l0, c0] = COLOR_RAMP[i];
    const [l1, c1] = COLOR_RAMP[i + 1];
    if (luminance >= l0 && luminance <= l1) {
      const t = (luminance - l0) / (l1 - l0 || 1);
      return [
        c0[0] + (c1[0] - c0[0]) * t,
        c0[1] + (c1[1] - c0[1]) * t,
        c0[2] + (c1[2] - c0[2]) * t,
      ];
    }
  }
  return COLOR_RAMP[COLOR_RAMP.length - 1][1];
}
