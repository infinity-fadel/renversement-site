"use client";

import { useState } from "react";
import Header from "@/components/v2/Header";
import Hero from "@/components/v2/Hero";
import BookEvent from "@/components/v2/BookEvent";
import QuoteBanner from "@/components/v2/QuoteBanner";
import BookSection from "@/components/v2/BookSection";
import AuthorSection from "@/components/v2/AuthorSection";
import Excerpts from "@/components/v2/Excerpts";
import Testimonials from "@/components/v2/Testimonials";
import OrderSection from "@/components/v2/OrderSection";
import News from "@/components/v2/News";
import ContactSection from "@/components/v2/ContactSection";
import Footer from "@/components/v2/Footer";
import MovementModal from "@/components/v2/MovementModal";

/**
 * V2 — site officiel du livre (§2.3, §17), d'après la maquette Figma
 * « Renversement V2 ». Même URL que la V1, qu'elle remplace au Jour J.
 *
 * Les sections suivent l'ordre de la maquette. La fenêtre « Rejoindre le
 * mouvement » est ouverte depuis trois endroits (en-tête, livre événement,
 * actualités), d'où son état porté ici.
 */
export default function Home() {
  const [joinOpen, setJoinOpen] = useState(false);
  const openJoin = () => setJoinOpen(true);

  return (
    <>
      <Header onJoin={openJoin} />
      <main>
        <Hero />
        <BookEvent onJoin={openJoin} />
        <QuoteBanner />
        <BookSection />
        <AuthorSection />
        <Excerpts />
        <Testimonials />
        <OrderSection />
        <News onJoin={openJoin} />
        <ContactSection />
      </main>
      <Footer />
      <MovementModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  );
}
