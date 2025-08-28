import React from "react";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Button, Badge } from "@/components/common";
import Loginpage from "@/assets/Loginpage.png";
import { useNavigate } from "react-router-dom";


export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      {/* Hero */}
      <section className="pt-28 md:pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge color="primary">MVP: Email → Billable</Badge>
            <h1 className="text-3xl md:text-4xl font-semibold mt-3">
              Capture every billable minute — automatically.
            </h1>
            <p className="mt-3 text-[color:var(--lb-muted)]">
              We track time while you draft emails, generate clean summaries with AI,
              and push entries to Clio in one click.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="primary" size="lg" onClick={() =>  navigate("/register")}>
                Get Started
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate("/login")}>
                Sign in
              </Button>
            </div>
            <p className="mt-3 text-sm text-[color:var(--lb-muted)]">
              No new tabs to learn. Lives inside Gmail.
            </p>
          </div>
          <div>
            <div className="border rounded-[var(--lb-radius-lg)] p-4 bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-md)]">
              {/* lightweight placeholder mock — replace with product shot later */}
              <div className="h-64 rounded border grid place-items-center overflow-hidden">
                {<img src={Loginpage} alt="Loginpage" className="object-contain h-full w-full" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="py-10 bg-[color:var(--lb-surface)]/50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            ["Real-time tracking", "Typing time is captured as you compose — pauses on inactivity."],
            ["GPT billable summaries", "Crisp, client‑friendly descriptions you can edit before logging."],
            ["One‑click push", "Send entries to PracticePanther instantly with status feedback."],
          ].map(([title, desc]) => (
            <div key={title} className="p-5 border rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-bg)]">
              <div className="font-semibold">{title}</div>
              <p className="text-sm mt-2 text-[color:var(--lb-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip (placeholder logos) */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="text-sm text-[color:var(--lb-muted)]">Works with</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-6">
            <div className="px-3 py-1 border rounded">Gmail</div>
            <div className="px-3 py-1 border rounded">Clio (soon)</div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
