/**
 * Monogramme "R∃NVERSEMENT." — les 1er et 3e "E" sont inversés
 * horizontalement (motif de marque repris dans toutes les maquettes de
 * référence du cahier des charges, nav comme footer). `aria-label` porte le
 * texte réel ; les fragments visuels sont masqués aux lecteurs d'écran pour
 * ne pas leur exposer une lettre à l'envers.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={className} aria-label="RENVERSEMENT.">
      <span aria-hidden="true">
        R
        <FlippedE />
        NVERS
        <FlippedE />
        MENT.
      </span>
    </span>
  );
}

function FlippedE() {
  return (
    <span
      className="inline-block"
      style={{ transform: "scaleX(-1)" }}
    >
      E
    </span>
  );
}
