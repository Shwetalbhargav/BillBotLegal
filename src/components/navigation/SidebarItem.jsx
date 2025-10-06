// SidebarItem.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function SidebarItem({ item, collapsed }) {
  const { to, label, icon: Icon } = item;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            : "text-gray-700 hover:text-indigo-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
        ].join(" ")
      }
      title={collapsed ? label : undefined}
    >
      {Icon ? <Icon className="w-5 h-5 shrink-0" /> : null}
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}
