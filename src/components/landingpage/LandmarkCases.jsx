// src/components/landingpage/LandmarkCases.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCases } from "@/store/caseSlice";          // :contentReference[oaicite:0]{index=0}
import { fetchClients } from "@/store/clientSlice";      // :contentReference[oaicite:1]{index=1}

const LandmarkCases = () => {
  const dispatch = useDispatch();
  const { list: caseList, loading: casesLoading } = useSelector(
    (s) => s.cases || {}
  );
  const { list: clientList, loading: clientsLoading } = useSelector(
    (s) => s.clients || {}
  );

  useEffect(() => {
    if (!caseList?.length && !casesLoading) dispatch(fetchCases());
  }, [dispatch, caseList?.length, casesLoading]);

  useEffect(() => {
    if (!clientList?.length && !clientsLoading) dispatch(fetchClients());
  }, [dispatch, clientList?.length, clientsLoading]);

  const clientById = useMemo(() => {
    const map = {};
    (clientList || []).forEach((c) => {
      const id = c._id || c.id;
      if (!id) return;
      map[id] = c;
    });
    return map;
  }, [clientList]);

  const items = useMemo(() => {
    if (!caseList?.length) return [];

    // Heuristic “landmark”: prefer high-value / closed matters, else just pick first few
    const scored = caseList.map((c) => {
      const isClosed = /closed|won|settled|disposed/i.test(c.status || "");
      const value =
        Number(c.disputeValue || c.amountInDispute || c.totalBilled || 0) || 0;
      const score = (isClosed ? 2 : 0) + value / 1_00_00_000; // rough crore scaling
      return { case: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, 3).map(({ case: c }, idx) => {
      const client =
        clientById[c.clientId] ||
        clientById[c.client?.id] ||
        clientById[c.client?._id] ||
        {};

      const title =
        c.title ||
        c.matterName ||
        c.caption ||
        `Landmark matter #${idx + 1}`;

      const clientName =
        c.clientName ||
        client.name ||
        client.displayName ||
        client.legalName ||
        "Confidential Client";

      const jurisdiction =
        c.court ||
        c.venue ||
        c.jurisdiction ||
        "Supreme Court & High Courts across India";

      const practice =
        c.practiceArea || c.caseType || "Commercial & regulatory disputes";

      const rawValue =
        c.disputeValue || c.amountInDispute || c.valueInCr || c.totalBilled;

      const valueLabel =
        rawValue && !Number.isNaN(Number(rawValue))
          ? `₹${Number(rawValue).toLocaleString("en-IN")}`
          : "Multi-crore exposure";

      const summary =
        c.summary ||
        c.description ||
        c.brief ||
        "Complex multi-party dispute with precedent-setting questions on enforcement and regulatory overlap.";

      return {
        id: c._id || c.id || idx,
        title,
        clientName,
        jurisdiction,
        practice,
        valueLabel,
        summary,
      };
    });
  }, [caseList, clientById]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 lg:px-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            Landmark Cases
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Matters that shaped our practice.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            From high-stakes arbitrations to regulatory challenges, our cases
            are built on meticulous preparation—and billing data that stands up
            to scrutiny.
          </p>
        </div>
        <p className="hidden text-xs text-slate-500 md:block">
          Selected highlights from hundreds of active and closed matters.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.length ? (
          items.map((item) => <CaseCard key={item.id} item={item} />)
        ) : (
          <>
            <CaseSkeleton />
            <CaseSkeleton />
            <CaseSkeleton />
          </>
        )}
      </div>
    </div>
  );
};

const CaseCard = ({ item }) => {
  const { title, clientName, jurisdiction, practice, valueLabel, summary } =
    item;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        {clientName} &middot; {jurisdiction}
      </p>

      <p className="mt-3 text-xs text-slate-600 line-clamp-4">{summary}</p>

      <dl className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Practice area</dt>
          <dd className="font-medium text-slate-900 text-right">
            {practice}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-slate-500">Dispute value</dt>
          <dd className="font-medium text-slate-900 text-right">
            {valueLabel}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-700">
        <span className="inline-flex items-center gap-1">
          ●
          <span className="text-slate-500">Fully time-tracked</span>
        </span>
        <span className="text-slate-400">Data-backed billing story</span>
      </div>
    </article>
  );
};

const CaseSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-5">
    <div className="h-4 w-3/4 rounded bg-slate-200" />
    <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
    <div className="mt-4 space-y-2">
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 w-5/6 rounded bg-slate-100" />
      <div className="h-3 w-2/3 rounded bg-slate-100" />
    </div>
    <div className="mt-4 h-3 w-1/2 rounded bg-slate-100" />
  </div>
);

export default LandmarkCases;
