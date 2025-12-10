// src/components/landingpage/HeroSection.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common";
import { fetchAnalytics } from "@/store/analyticsSlice";
import { fetchCases } from "@/store/caseSlice";

// TODO: adjust path/name to where you place the India-justice image
import heroBg from "@/assets/Loginpage.png";

const HeroSection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const analytics = useSelector((s) => s.analytics);
  const casesState = useSelector((s) => s.cases);

  useEffect(() => {
    if (!analytics.byCaseType?.entries?.length && !analytics.loading) {
      dispatch(fetchAnalytics());
    }
    if (!casesState.list?.length && !casesState.loading) {
      dispatch(fetchCases());
    }
  }, [dispatch, analytics.byCaseType?.entries?.length, analytics.loading, casesState.list?.length, casesState.loading]);

  const caseTypeData = useMemo(() => {
    const entries = analytics.byCaseType?.entries || [];
    return entries
      .map((row, idx) => {
        const label =
          row.caseType ||
          row.type ||
          row._id ||
          `Type ${idx + 1}`;

        const value = Number(
          row.totalValue ??
            row.totalRevenue ??
            row.totalHours ??
            row.count ??
            0
        );

        return { name: label, value: isFinite(value) ? value : 0 };
      })
      .filter((d) => d.value > 0);
  }, [analytics.byCaseType]);

  const statusStats = useMemo(() => {
    const list = casesState.list || [];
    const counts = {
      inProgress: 0,
      won: 0,
      settled: 0,
    };

    list.forEach((c) => {
      const s = (c.status || "").toLowerCase();

      if (s.includes("won") || s.includes("success")) {
        counts.won += 1;
      } else if (s.includes("settled") || s.includes("settlement")) {
        counts.settled += 1;
      } else {
        counts.inProgress += 1;
      }
    });

    const total =
      counts.inProgress + counts.won + counts.settled || 1;

    const pct = (val) => Math.round((val / total) * 100);

    return {
      counts,
      total,
      percents: {
        inProgress: pct(counts.inProgress),
        won: pct(counts.won),
        settled: pct(counts.settled),
      },
    };
  }, [casesState.list]);

  const { percents, counts } = statusStats;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900">
      {/* Background image + white overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Lady Justice and Indian flag"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:py-16">
        {/* Left: copy & CTAs */}
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
            Built for Indian law firms
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            The AI-Powered{" "}
            <span className="text-amber-600">
              Legal Billable System
            </span>
          </h1>

          <p className="max-w-xl text-sm text-slate-600 sm:text-base">
            Track every matter, every minute, and every rupee in one
            place. Turn raw case data into real-time billable insights
            with automated analytics and AI drafting.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm"
              onClick={() => navigate("/login")}
            >
              Get Started
            </Button>
            <button
              type="button"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Learn More
            </button>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Realtime billables</span>
            <span>•</span>
            <span>Case-type analytics</span>
            <span>•</span>
            <span>Outcome tracking</span>
          </div>
        </div>

        {/* Right: data viz card */}
        <div className="rounded-2xl bg-white/90 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Live case analytics
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Distribution by case type & current outcomes.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              Auto-refresh
            </span>
          </div>

          {/* Doughnut chart */}
          <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_minmax(0,1fr)]">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={caseTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={4}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <p className="font-medium text-slate-700">
                Cases by type
              </p>
              <div className="max-h-32 space-y-1 overflow-y-auto pr-1">
                {caseTypeData.length ? (
                  caseTypeData.map((d) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate text-slate-600">
                        {d.name}
                      </span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {d.value.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">
                    Waiting for case-type data…
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status progress bars */}
          <div className="mt-5 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Case Outcomes
            </p>

            <StatusBar
              label="In Progress"
              count={counts.inProgress}
              percent={percents.inProgress}
            />
            <StatusBar
              label="Won"
              count={counts.won}
              percent={percents.won}
            />
            <StatusBar
              label="Settled"
              count={counts.settled}
              percent={percents.settled}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatusBar = ({ label, percent, count }) => {
  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500">
          {count} cases · {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default HeroSection;
