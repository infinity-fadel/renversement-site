"use client";

import { useState } from "react";
import { SECTIONS } from "@/config/sections.config";
import { useActiveSection } from "@/hooks/useActiveSection";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Section 01 — Navigation principale (§4.3, §6.2)
 * - Sticky, discrète, non intrusive
 * - État actif mis à jour selon la section visible (useActiveSection)
 * - Menu burger plein écran sur mobile
 * - Aucune interaction essentielle dépendante du survol
 * - Pas de menu burger en desktop (retiré des maquettes, cf. annotations du cahier des charges)
 */
export default function Nav() {
  const activeId = useActiveSection();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Ordre du menu (§6.2) indépendant de l'ordre du parcours — voir navOrder
  // dans config/sections.config.ts.
  const navItems = SECTIONS.filter((s) => s.inNav).sort(
    (a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0)
  );

  const handleNavigate = (id: string) => {
    setIsMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        aria-label="Navigation principale"
        className="flex items-center justify-between px-6 sm:px-10 py-4 bg-black/70 backdrop-blur-sm"
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate("hero");
          }}
          className="font-display text-sm tracking-widest2 uppercase text-light-grey"
        >
          <Wordmark />
        </a>

        {/* Menu desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigate(item.id);
                }}
                aria-current={activeId === item.id ? "true" : undefined}
                className={`text-xs tracking-widest2 uppercase transition-colors ${
                  activeId === item.id
                    ? "text-terracota"
                    : "text-light-grey/60 hover:text-light-grey"
                }`}
              >
                {item.navLabel}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-6">
          {/* CTA (§6.2) — renvoie directement au formulaire de la section 09 */}
          <a
            href="#circle"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate("circle");
            }}
            className="hidden sm:inline-block text-[11px] tracking-widest2 uppercase border border-terracota text-terracota px-5 py-2.5 hover:bg-terracota hover:text-black transition-colors"
          >
            Être prévenu
          </a>

          {/* Bouton burger mobile — icône standard (debrief V1 : le libellé
              texte « MENU » ne se lisait pas comme un bouton de menu). Le nom
              accessible reste textuel via aria-label. */}
          <button
            type="button"
            className="md:hidden text-light-grey p-1 -mr-1"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMobileOpen((v) => !v)}
          >
            {isMobileOpen ? <CloseIcon /> : <BurgerIcon />}
          </button>
        </div>
      </nav>

      {/* Menu mobile plein écran */}
      {isMobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 top-[64px] bg-black flex flex-col items-center justify-center gap-8"
        >
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigate(item.id);
              }}
              className={`text-lg tracking-widest2 uppercase font-display ${
                activeId === item.id ? "text-terracota" : "text-light-grey"
              }`}
            >
              {item.navLabel}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function BurgerIcon() {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
