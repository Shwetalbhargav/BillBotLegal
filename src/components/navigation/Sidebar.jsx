// src/components/navigation/Sidebar.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { clsx } from "../../utils/clsx";

export default function Sidebar({ items = [], collapsed = false, onToggle }) {
  const location = useLocation();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [filter, items]);

  const width = collapsed ? "w-16" : "w-64";

  return (
    <aside
      aria-label="Primary navigation"
      className={clsx(
        "fixed top-16 bottom-0 left-0 z-40",
        width,
        "transition-[width] duration-200 ease-out",
        "border-r border-[color:var(--lb-border)]",
        "bg-[color:var(--lb-surface)]/95 backdrop-blur-sm shadow-[var(--lb-shadow-sm)]"
      )}
    >
      {/* Header: search + collapse toggle */}
      <div className="flex items-center gap-2 px-3 py-3">
        {!collapsed && (
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--lb-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search menu…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={clsx(
                "lb-reset w-full rounded-full border border-[color:var(--lb-border)]",
                "bg-[color:var(--lb-bg)] px-8 py-1.5 text-[12px] text-[color:var(--lb-text)]",
                "placeholder:text-[color:var(--lb-muted)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
              )}
            />
          </div>
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className={clsx(
            "inline-flex items-center justify-center rounded-2xl p-2",
            "border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)]",
            "shadow-[var(--lb-shadow-xs)] hover:shadow-[var(--lb-shadow-sm)]",
            "text-[color:var(--lb-muted)] hover:text-[color:var(--lb-primary-700)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav items */}
      <nav
        className="mt-1 px-2 space-y-1 overflow-y-auto h-[calc(100%-56px)] pb-6"
        aria-label="Sidebar menu"
      >
        {filtered.map((item) => (
          <SidebarItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            isCurrent={location.pathname === item.to}
          />
        ))}

        {filtered.length === 0 && (
          <div className="mt-4 rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] px-3 py-3 text-[11px] text-[color:var(--lb-muted)] leading-relaxed">
            No matches for <span className="font-semibold">“{filter}”</span>.  
            Try a different keyword.
          </div>
        )}
      </nav>
    </aside>
  );
}
