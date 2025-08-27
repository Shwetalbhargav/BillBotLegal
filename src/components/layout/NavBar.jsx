// src/components/layout/NavBar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/common";
import useAuth from "@/hooks/useAuth";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="bg-[color:var(--lb-surface)]/70 backdrop-blur border border-[color:var(--lb-border)] rounded-full shadow-[var(--lb-shadow-sm)] flex items-center justify-between px-4 py-2">
          {/* Brand */}
          <button
            onClick={() => navigate("/")}
            className="lb-reset flex items-center gap-3 cursor-pointer"
            aria-label="Go to home"
          >
            <img src={logo} alt="Legal Billables" className="h-10 w-10 rounded-full object-contain" />
            <span className="font-semibold">Legal Billables</span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-sm">
              {[
                { to: "/", label: "Home" },
                { to: "/features", label: "Features" },
                { to: "/services", label: "Services" },
                { to: "/work", label: "Our Work" },
              ].map((i) => (
                <li key={i.to}>
                  <button
                    onClick={() => navigate(i.to)}
                    className="lb-reset hover:underline"
                  >
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="danger" size="sm" onClick={logout}>
                Logout
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
