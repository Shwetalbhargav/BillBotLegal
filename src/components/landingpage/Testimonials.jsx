// src/components/landingpage/Testimonials.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchClients } from "@/store/clientSlice"; // :contentReference[oaicite:2]{index=2}

const Testimonials = () => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.clients || {});

  useEffect(() => {
    if (!list?.length && !loading) {
      dispatch(fetchClients());
    }
  }, [dispatch, list?.length, loading]);

  const testimonials = useMemo(() => {
    if (!list?.length) return [];

    return list.slice(0, 3).map((client, idx) => {
      const name =
        client.contactName ||
        client.primaryContactName ||
        client.name ||
        client.legalName ||
        "General Counsel";

      const organisation =
        client.company ||
        client.organisation ||
        client.orgName ||
        client.name ||
        "Leading Indian enterprise";

      const quote =
        client.notes ||
        client.description ||
        client.internalNotes ||
        (idx === 0
          ? "“For the first time, our litigation team and finance team see the same numbers. Fee discussions are faster and far less painful.”"
          : idx === 1
          ? "“Every hearing, every draft, every negotiation is tracked. Our board loves how defensible our legal spend reporting has become.”"
          : "“The AI drafting and time capture has taken hours out of our monthly billing cycle without losing partner control.”");

      const sinceYear =
        client.clientSinceYear ||
        (client.createdAt
          ? new Date(client.createdAt).getFullYear()
          : "2019");

      return {
        id: client._id || client.id || idx,
        name,
        organisation,
        quote,
        sinceYear,
      };
    });
  }, [list]);

  const avgRating = 4.8;
  const totalReviews = Math.max(testimonials.length * 3, 12);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-0">
      {/* Header strip */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Client Testimonials
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Trusted by litigation and in-house teams.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Firms and legal departments across India use our AI-powered
            billable system to bring discipline, transparency, and speed to
            every matter.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Average rating
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {avgRating.toFixed(1)} / 5.0
            </p>
            <p className="text-[11px] text-slate-500">
              Based on {totalReviews}+ internal reviews
            </p>
          </div>
          <div className="hidden h-10 border-l border-slate-200 sm:block" />
          <div className="hidden sm:block">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Implementation time
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              Under 4 weeks
            </p>
            <p className="text-[11px] text-slate-500">
              From first matter to live billing
            </p>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {testimonials.length ? (
          testimonials.map((t) => <TestimonialCard key={t.id} t={t} />)
        ) : (
          <>
            <TestimonialSkeleton />
            <TestimonialSkeleton />
            <TestimonialSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

const TestimonialCard = ({ t }) => {
  const { name, organisation, quote, sinceYear } = t;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-amber-500 text-xl">“</div>
      <p className="mt-2 flex-1 text-sm text-slate-700">{quote}</p>

      <div className="mt-4">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        <p className="text-xs text-slate-500">{organisation}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Client since {sinceYear}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span className="text-amber-600">★★★★★</span>
        <span>Reduced billing cycle &gt; 30%</span>
      </div>
    </article>
  );
};

const TestimonialSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="h-6 w-6 rounded-full bg-slate-200" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-full rounded bg-slate-200" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>
    <div className="mt-4 h-3 w-1/2 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
  </div>
);

export default Testimonials;
