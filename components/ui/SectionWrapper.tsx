"use client";

import { useEffect } from "react";
import { useInView } from "@/hooks/useInView";

export default function SectionWrapper({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, isInView } = useInView<HTMLElement>();

  // Applique la classe .is-visible définie dans globals.css (transition fade + slide)
  useEffect(() => {
    if (isInView) ref.current?.classList.add("is-visible");
  }, [isInView, ref]);

  return (
    <section
      id={id}
      ref={ref}
      className={`reveal min-h-screen w-full flex flex-col items-center justify-center px-6 sm:px-12 py-24 ${className}`}
    >
      {children}
    </section>
  );
}
