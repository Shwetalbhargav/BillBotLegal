// src/layouts/PublicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
