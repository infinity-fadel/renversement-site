/**
 * Briques partagées de la V2 : boutons, surtitres, titres, champs.
 *
 * Elles traduisent les composants de la maquette (`Btn_Primary`,
 * `Btn_Secondary`) et ses styles récurrents. La police « Avenir Next » de la
 * maquette n'est pas reprise : elle est sous licence commerciale et absente
 * du projet. Le texte courant reste en Montserrat, police de contenu de la
 * charte (`font-body`), et les titres en `font-display` (Apollo, avec repli
 * Cormorant tant que les fichiers manquent — cf. public/fonts/README.md).
 */

import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

const BUTTON_BASE =
  "inline-flex h-12 items-center justify-center gap-2.5 px-7 text-[15px] uppercase leading-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracota disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-terracota text-light-grey hover:bg-[#9a6324]",
  secondary:
    "border-[1.5px] border-terracota text-terracota hover:bg-terracota hover:text-light-grey",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${extra}`;
}

/**
 * Bouton ou lien selon la présence de `href`.
 *
 * `href={null}` signale un lien PROVISOIRE (cible pas encore fournie par le
 * client) : on rend un bouton inactif plutôt qu'un `href="#"` qui ramènerait
 * le visiteur en haut de page sans rien lui dire.
 */
export function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  href?: string | null;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">) {
  const classes = buttonClass(variant, className);
  if (href) {
    const external = /^https?:\/\//.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      disabled={href === null}
      title={href === null ? "Lien à venir" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Surtitre gris espacé (« LE LIVRE », « EXTRAITS »…). */
export function Eyebrow({
  children,
  className = "",
  light = false,
}: {
  children: ReactNode;
  className?: string;
  /** Variante plus claire du hero (`#A09B8D` au lieu de `#716D63`). */
  light?: boolean;
}) {
  return (
    <p
      className={`text-[15px] uppercase tracking-widest2 sm:text-lg ${
        light ? "text-taupe-light" : "text-taupe"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/** Titre de section en police d'affichage, 32 px sur la maquette. */
export function SectionTitle({
  children,
  as: Tag = "h2",
  className = "",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag
      className={`font-display text-[26px] leading-[1.2] tracking-[0.02em] text-light-grey sm:text-[32px] ${className}`}
    >
      {children}
    </Tag>
  );
}

/** Conteneur horizontal : 1320 px utiles, soit les marges de 96 px de la maquette en 1512. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1320px] px-6 sm:px-10 2xl:px-0 ${className}`}>
      {children}
    </div>
  );
}

const FIELD_INPUT =
  "w-full border-[0.75px] border-light-grey/65 bg-transparent px-3 text-base tracking-[0.03em] text-light-grey placeholder:text-light-grey/65 focus:border-terracota focus:outline-none";

/**
 * Champ de formulaire au style de la maquette : libellé en capitales précédé
 * d'un tiret bas (« _EMAIL »), astérisque claire, cadre fin.
 */
export function Field({
  label,
  name,
  type = "text",
  required = true,
  multiline = false,
  className = "",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "name" | "type" | "className">) {
  const id = `champ-${name}`;
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <label
        htmlFor={id}
        className="flex items-center gap-2.5 text-base uppercase leading-[1.4] tracking-[0.03em]"
      >
        <span className="text-light-grey/65">_{label}</span>
        {required && (
          <span aria-hidden="true" className="text-light-grey">
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          required={required}
          rows={7}
          className={`${FIELD_INPUT} min-h-[200px] resize-y py-3`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          className={`${FIELD_INPUT} h-[52px]`}
          {...rest}
        />
      )}
    </div>
  );
}

/**
 * Champ-piège anti-robot, identique à celui du formulaire V1 : invisible pour
 * un humain, rempli par les robots qui complètent tous les champs. Contrôlé
 * des deux côtés (navigateur et route).
 */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="champ-website">Ne pas remplir</label>
      <input id="champ-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

/** Message d'état sous un formulaire (succès, erreur). */
export function FormMessage({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`text-sm leading-relaxed ${
        tone === "error" ? "text-[#e8a07a]" : "text-terracota"
      }`}
    >
      {children}
    </p>
  );
}
