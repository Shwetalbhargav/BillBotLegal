// src/components/landingpage/AboutFirm.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFirms } from "@/store/firmSlice"; // firms list :contentReference[oaicite:0]{index=0}

const AboutFirm = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.firms || {});

  useEffect(() => {
    if (!items?.length && !loading) {
      dispatch(fetchFirms());
    }
  }, [dispatch, items?.length, loading]);

  const { name, foundedYear, city, country, tagline } = useMemo(() => {
    const firm = items?.[0] || {};
    return {
      name: firm.name || "LexBill Legal Partners",
      foundedYear: firm.foundedYear || 2008,
      city: firm.city || firm.headquartersCity || "Mumbai",
      country: firm.country || "India",
      tagline:
        firm.tagline ||
        "Blending courtroom experience with data-driven billing intelligence.",
    };
  }, [items]);

  const years =
    foundedYear && !Number.isNaN(Number(foundedYear))
      ? new Date().getFullYear() - Number(foundedYear)
      : 15;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:px-0">
      {/* Left: story */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
          About the Firm
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          A legacy of courtroom excellence, built for the AI era.
        </h2>

        <p className="text-sm text-slate-600 sm:text-base">
          {name} began in {foundedYear} as a boutique litigation chamber in{" "}
          {city}, {country}. From its earliest matters, the firm focused on
          complex disputes, high-stakes commercial litigation, and regulatory
          work for fast-growing businesses.
        </p>

        <p className="text-sm text-slate-600 sm:text-base">
          Over the last {years}+ years, the team has grown into a full-service
          practice with partners drawn from top Indian courts and global firms.
          Today, every brief, hearing, and negotiation is backed by structured
          matter data and AI-ready billing workflows.
        </p>

        <p className="text-sm text-slate-600 sm:text-base">{tagline}</p>

        <div className="flex flex-wrap gap-3 pt-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            🏛️ Supreme Court & High Courts
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            📊 Data-driven billing
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1">
            🤝 Long-term client relationships
          </span>
        </div>
      </div>

      {/* Right: highlighted partner card */}
      <HighlightedPartnerCard />
    </div>
  );
};

const HighlightedPartnerCard = () => {
  // This could later read from a `managingPartner` field or a specific user.
  const name = "Arjun Mehta";
  const title = "Managing Partner, Disputes & Strategy";
  const blurb =
    "Leads the firm’s disputes practice with a focus on complex commercial and regulatory matters across India.";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-base font-semibold text-amber-700">
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-600">{blurb}</p>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div>
          <dt className="text-slate-500">Years at bar</dt>
          <dd className="font-semibold text-slate-900">18+</dd>
        </div>
        <div>
          <dt className="text-slate-500">Key sectors</dt>
          <dd className="font-semibold text-slate-900">
            Infra, FinTech, Gov.
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Matters led</dt>
          <dd className="font-semibold text-slate-900">350+</dd>
        </div>
      </dl>

      <button
        type="button"
        className="mt-5 inline-flex items-center text-xs font-medium text-amber-700 hover:text-amber-800"
      >
        Meet our full partner team
        <span className="ml-1">→</span>
      </button>
    </div>
  );
};

export default AboutFirm;
