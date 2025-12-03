// src/pages/FirmSelectLanding.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchFirms, setSelectedFirmId } from "@/store/firmSlice";
import { Button, Loader } from "@/components/common";
import { FaBalanceScale, FaArrowRight } from "react-icons/fa";

// Hero artwork
import heroImg from "@/assets/firmselect1.png";

export default function FirmSelectLanding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: firms = [], loading, error, selectedFirmId } = useSelector(
    (state) => state.firm || {}
  );

  const [localFirmId, setLocalFirmId] = useState(selectedFirmId || "");

  // Load firms on first mount
  useEffect(() => {
    dispatch(fetchFirms());
  }, [dispatch]);

  // Keep local selection in sync with store / loaded firms
  useEffect(() => {
    if (selectedFirmId) {
      setLocalFirmId(selectedFirmId);
    } else if (!selectedFirmId && firms.length > 0 && !localFirmId) {
      setLocalFirmId(firms[0].id);
    }
  }, [selectedFirmId, firms, localFirmId]);

  const handleContinue = () => {
    if (!localFirmId) return;
    dispatch(setSelectedFirmId(localFirmId));
    navigate("/login"); // or wherever next
  };

  const selectedFirm = firms.find((f) => f.id === localFirmId);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background hero image */}
      <img
        src={heroImg}
        alt="Hero background"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90"
      />

      {/* Black gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />

      {/* Content */}
      <main className="relative z-10 flex min-h-screen flex-col">
        {/* Top bar (brand + CTA, not shared NavBar) */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-6">
          <div className="text-2xl font-semibold tracking-wide text-amber-200 font-serif">
            FirmSelection
          </div>
          <Button
            variant="secondary"
            className="rounded-full border border-amber-400/50 bg-black/40 px-4 py-1.5 text-sm font-medium text-amber-100 backdrop-blur-sm hover:bg-amber-500/90 hover:text-black"
          >
            Get Appointment
          </Button>
        </header>

        {/* Hero body */}
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-6 pb-16 pt-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: copy + selection card */}
          <div className="max-w-xl">
            <h1 className="font-serif text-4xl leading-tight text-amber-50 sm:text-5xl">
              We fight for your <span className="text-amber-300">justice</span>
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-amber-100/80 sm:text-base">
              Select your firm to continue to your AI-powered billing workspace.
              We’ll tailor billable rules, summaries, and integrations for your
              team.
            </p>

            {/* Card */}
            <div className="mt-8 max-w-md rounded-3xl border border-amber-400/40 bg-black/70 p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
                  <FaBalanceScale className="text-xl" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-amber-50">
                    Choose your firm
                  </h2>
                  <p className="text-xs text-amber-100/70">
                    Your selection controls access, matters, and billing data.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {/* Loading state */}
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader />
                  </div>
                )}

                {/* Error state */}
                {!loading && error && (
                  <div className="rounded-2xl border border-rose-300/70 bg-rose-900/60 px-3 py-2 text-xs text-rose-50">
                    {error || "Something went wrong loading firms."}
                  </div>
                )}

                {/* No firms */}
                {!loading && !error && firms.length === 0 && (
                  <p className="text-xs text-amber-100/70">
                    No firms are configured yet. Ask your administrator to
                    create a firm in the dashboard.
                  </p>
                )}

                {/* Firm select */}
                {!loading && !error && firms.length > 0 && (
                  <>
                    <label
                      htmlFor="firm-select"
                      className="block text-xs font-medium uppercase tracking-wide text-amber-200/80"
                    >
                      Select firm
                    </label>
                    <select
                      id="firm-select"
                      value={localFirmId || ""}
                      onChange={(e) => setLocalFirmId(e.target.value)}
                      className="w-full rounded-2xl border border-amber-400/40 bg-black/70 px-3 py-2 text-sm text-amber-50 outline-none ring-0 backdrop-blur-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-400/60"
                    >
                      <option value="" disabled>
                        — Choose a firm —
                      </option>
                      {firms.map((firm) => (
                        <option key={firm.id} value={firm.id}>
                          {firm.name}
                        </option>
                      ))}
                    </select>

                    {selectedFirm?.tagline && (
                      <p className="text-xs text-amber-100/70">
                        {selectedFirm.tagline}
                      </p>
                    )}

                    <Button
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-900/50 hover:bg-amber-400"
                      onClick={handleContinue}
                      disabled={!localFirmId}
                    >
                      Continue
                      <FaArrowRight className="text-sm" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right side spacer so layout stays two-column on large screens */}
          <div className="hidden lg:block flex-1" />
        </section>
      </main>
    </div>
  );
}
