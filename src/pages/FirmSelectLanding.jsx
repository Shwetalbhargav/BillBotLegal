// src/pages/FirmSelectLanding.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchFirms, setSelectedFirmId } from "@/store/firmSlice";
import { Button, Card, EmptyState, Heading, HeroSection, Section, Loader } from "@/components/common";
import { NavBar, Footer } from "@/components/layout";
import FirmSwitchDropdown from "@/components/Firm/FirmSwitchDropdown";

export default function FirmSelectLanding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: firms, loading, error, selectedFirmId } = useSelector(
    (state) => state.firm || {}
  );

  // Load firms on first mount
  useEffect(() => {
    dispatch(fetchFirms());
  }, [dispatch]);

  const handleSelectFirm = (firmId) => {
    dispatch(setSelectedFirmId(firmId));

    // 🔁 Decide what "next step" is for your flow:
    // - send them to login for that firm
    // - or straight to dashboard if already authed
    navigate("/login"); // or "/dashboard"
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavBar />

      {/* Hero / Intro */}
      <main className="flex-1">
        <HeroSection
          title="Welcome to Legal Billables"
          subtitle="Select your firm to continue to your AI-powered billing workspace."
          cta={null}
        />

        <Section className="max-w-5xl mx-auto pb-16">
          <Heading
            title="Choose your firm"
            subtitle="We’ll tailor the experience, billing rules, and integrations to your firm."
          />

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader />
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-rose-200/70 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error || "Something went wrong loading firms."}
            </div>
          )}

          {/* No firms */}
          {!loading && !error && firms?.length === 0 && (
            <div className="mt-8">
              <EmptyState
                title="No firms found"
                description="It looks like there are no firms configured yet. An admin can create one from the dashboard."
                action={
                  <Button onClick={() => navigate("/register")}>
                    Create a firm
                  </Button>
                }
              />
            </div>
          )}

          {/* Firms grid */}
          {!loading && !error && firms?.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {firms.map((firm) => (
                <Card
                  key={firm.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200/70 bg-white/90 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {firm.name}
                    </h3>
                    {firm.tagline && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {firm.tagline}
                      </p>
                    )}
                    {firm.primaryContact && (
                      <p className="mt-2 text-xs text-gray-400">
                        Admin: {firm.primaryContact}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      className="w-full"
                      onClick={() => handleSelectFirm(firm.id)}
                    >
                      {selectedFirmId === firm.id
                        ? "Continue"
                        : "Use this firm"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Section>
      </main>
      {/* Firm Switcher */}
          <FirmSwitchDropdown />


      <Footer />
    </div>
  );
}
