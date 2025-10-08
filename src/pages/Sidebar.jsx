// src/pages/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { MENUS } from "@/components/navigation/menus";

export default function Sidebar({ role }) {
  const items = MENUS[role] || [];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b font-bold text-lg text-indigo-600">
        {role.charAt(0).toUpperCase() + role.slice(1)} Panel
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {Icon && <Icon className="w-5 h-5" />}
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
