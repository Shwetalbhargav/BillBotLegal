// src/components/navigation/SidebarItem.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { clsx } from "../../utils/clsx";

export default function SidebarItem({ item, collapsed, isCurrent }) {
  const { to, label, icon: Icon, readOnly, badge } = item;

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          "group flex items-center gap-3 rounded-2xl px-3 py-2 text-[13px] font-medium",
          "transition-colors",
          (isActive || isCurrent) &&
            "bg-[color:var(--lb-primary-50)] text-[color:var(--lb-primary-700)] shadow-[var(--lb-shadow-xs)]",
          !(isActive || isCurrent) &&
            "text-[color:var(--lb-muted)] hover:text-[color:var(--lb-primary-700)] hover:bg-[color:var(--lb-bg)]"
        )
      }
    >
      {Icon && (
        <span
          className={clsx(
            "inline-flex h-8 w-8 items-center justify-center rounded-2xl border",
            "border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-xs)]",
            "text-[color:var(--lb-muted)] group-hover:text-[color:var(--lb-primary-600)]"
          )}
        >
          <Icon className="w-4 h-4" />
        </span>
      )}

      {!collapsed && (
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <span className="truncate">{label}</span>
          {(readOnly || badge) && (
            <span
              className={clsx(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                "border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] text-[color:var(--lb-muted)]"
              )}
            >
              {badge || "READ"}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}
