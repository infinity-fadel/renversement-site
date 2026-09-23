import SectionWrapper from "@/components/ui/SectionWrapper";

/**
 * Rappel vers le formulaire — bas de page (5e retour client).
 *
 * Le formulaire ayant été remonté sous « Les indices » (section 06), ce bloc
 * occupe sa place d'avant et sert de seconde chance : « pour permettre aux
 * visiteurs qui ne se sont pas inscrits plus tôt de pouvoir le faire
 * facilement ». Il ne fait que renvoyer vers l'ancre `#circle`.
 *
 * CE N'EST PAS UNE SECTION DU REGISTRE. Il n'apparaît volontairement pas dans
 * `config/sections.config.ts` : pas de numéro, pas d'entrée de menu, pas de
 * pas dans l'indicateur de progression. C'est un rappel, pas un chapitre —
 * lui donner un numéro décalerait « Phrase finale » et « Informations » sans
 * rien apporter. Conséquence assumée : pendant qu'on le traverse, l'indicateur
 * reste sur la section voisine. Le bloc est court (`compact`), donc l'écart se
 * voit à peine.
 *
 * Son ancre est `rejoin`, surtout pas `circle` : `circle` doit rester celle du
 * formulaire, visée par Nav.tsx, Section09Urgency.tsx et le bouton ci-dessous.
 *
 * Le défilement est fluide sans JavaScript : `scroll-behavior: smooth` est posé
 * globalement dans globals.css, et repasse à `auto` sous
 * `prefers-reduced-motion`. Un lien d'ancre suffit donc — c'est exactement ce
 * que fait déjà le CTA de la section 09.
 */
export default function RejoinCircle() {
  return (
    <SectionWrapper id="rejoin" compact className="text-center">
      {/* Titre en deux temps, même traitement bicolore que les autres
          sections. Textes dictés mot à mot au 5e retour client. */}
      <h2 className="font-display text-2xl sm:text-3xl uppercase leading-tight">
        <span className="text-light-grey">Vous êtes arrivé jusqu&apos;ici.</span>
        <br />
        <span className="text-terracota">Vous voulez connaître la suite ?</span>
      </h2>

      <span aria-hidden="true" className="w-10 h-px bg-terracota/40 mt-6" />

      {/* Bouton plein, là où le CTA de la section 09 est en contour : les deux
          renvoient vers #circle et se suivent de près, la différence de
          traitement évite de les lire comme un doublon et pose celui-ci comme
          le dernier appel. */}
      <a
        href="#circle"
        className="mt-8 inline-block text-xs tracking-widest2 uppercase bg-terracota text-black px-10 py-4 hover:bg-light-grey transition-colors"
      >
        Rejoignez le Cercle
      </a>
    </SectionWrapper>
  );
}
