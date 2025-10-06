// Sidebar.jsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ items = [], collapsed = false, onToggle }) {
  const location = useLocation();
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [filter, items]);

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-40 border-r border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-gray-900/80 backdrop-blur-md
        transition-all ${collapsed ? "w-16" : "w-64"}`}
      aria-label="Sidebar"
    >
      {/* Collapse button */}
      <div className="flex items-center justify-between px-2 py-2">
        {!collapsed && (
          <input
            type="text"
            placeholder="Search…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-lg border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
          />
        )}

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="ml-2 inline-flex items-center justify-center rounded-xl p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="mt-1 px-2 space-y-1 overflow-y-auto h-[calc(100%-56px)] pb-6">
        {filtered.map((item) => (
          <SidebarItem key={item.to} item={item} collapsed={collapsed} />
        ))}

        {/* Optional hint when search yields nothing */}
        {filtered.length === 0 && (
          <div className="text-xs text-gray-500 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            No matches for “{filter}”
          </div>
        )}
      </nav>
    </aside>
  );
}
