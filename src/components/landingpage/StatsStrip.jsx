// src/components/landingpage/StatsStrip.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchKpiSummary } from "@/store/kpiSlice"; // KPI summary API 

const StatsStrip = () => {
  const dispatch = useDispatch();
  const { summary, summaryLoading } = useSelector((s) => s.kpi || {});

  useEffect(() => {
    if (!summary && !summaryLoading) {
      dispatch(fetchKpiSummary());
    }
  }, [dispatch, summary, summaryLoading]);

  const stats = useMemo(() => {
    const s = summary || {};

    // Very defensive: try multiple shapes, fall back to wireframe numbers
    const totalMatters =
      s.totalMatters ??
      s.matters?.active ??
      s.matters?.total ??
      631;

    const realizationPct =
      s.realizationPct ??
      s.metrics?.realizationPct ??
      s.realization ??
      50;

    const activeClients =
      s.clients?.active ??
      s.totalClients ??
      s.metrics?.activeClients ??
      47;

    const yearsExperience =
      s.firm?.years ??
      s.team?.yearsExperience ??
      s.metrics?.years ??
      12; // fallback

    return [
      {
        id: "matters",
        value: totalMatters,
        suffix: "+",
        label: "Matters tracked",
      },
      {
        id: "realization",
        value: realizationPct,
        suffix: "%",
        label: "Realization rate",
      },
      {
        id: "clients",
        value: activeClients,
        suffix: "",
        label: "Active clients",
      },
      {
        id: "years",
        value: yearsExperience,
        suffix: " yrs",
        label: "Combined experience",
      },
    ];
  }, [summary]);

  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-stretch justify-between gap-6 px-6 py-8 sm:px-10 lg:px-0">
      {stats.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </div>
  );
};

const StatCard = ({ value, suffix, label }) => {
  const display =
    typeof value === "number"
      ? value.toLocaleString()
      : String(value ?? "");

  return (
    <div className="flex-1 min-w-[140px]">
      <div className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {display}
        {suffix && <span className="text-slate-500"> {suffix}</span>}
      </div>
      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );
};

export default StatsStrip;
