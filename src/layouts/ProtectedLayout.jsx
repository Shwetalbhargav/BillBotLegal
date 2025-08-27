// src/layouts/ProtectedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";

export default function ProtectedLayout() {
  return (
    <>
      <NavBar />
      <main className="pt-20 px-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
