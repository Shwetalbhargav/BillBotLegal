// src/pages/LandingPage.jsx
import React from "react";
import { NavBar, Footer } from "@/components/layout";
import {
  HeroSection,
  StatsStrip,
  AboutFirm,
  FeaturedPartners,
  LandmarkCases,
  Testimonials,
} from "@/components/landingpage";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 1. Header / Nav */}
      <NavBar />

      <main className="flex-1">
        {/* 2. Hero */}
        <Section
          id="hero"
          className="bg-slate-50 pt-6 pb-12 sm:pb-16"
        >
          <HeroSection />
        </Section>

        {/* 3. Stats Strip */}
        <Section
          id="stats"
          className="bg-white border-y border-slate-100"
        >
          <StatsStrip />
        </Section>

        {/* 4. About the Firm */}
        <Section
          id="about"
          className="bg-slate-50"
        >
          <AboutFirm />
        </Section>

        {/* 5. Featured Partners */}
        <Section
          id="partners"
          className="bg-white"
        >
          <FeaturedPartners />
        </Section>

        {/* 6. Landmark Cases */}
        <Section
          id="cases"
          className="bg-slate-50"
        >
          <LandmarkCases />
        </Section>

        {/* 7. Client Testimonials */}
        <Section
          id="testimonials"
          className="bg-white"
        >
          <Testimonials />
        </Section>
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
