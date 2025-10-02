// src/components/layout/NavBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/common";
import useAuth from "@/hooks/useAuth";
import { Bell, Menu, X } from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Right-side nav items (now sit beside the bell on desktop)
  const menuItems = [
    { to: "/#cases", label: "Cases" },
    { to: "/#clients", label: "Clients" },
    { to: "/#partners", label: "Partners" },
  ];

  return (
    // Full-width light bar with bigger height
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-100 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ~100px tall nav (nice, roomy) */}
        <div className="h-[100px] flex items-center justify-between">
          {/* Brand (bigger logo + highlighted product name) */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-90 transition"
            aria-label="Go to home"
          >
            <img
              src={logo}
              alt="Legal Billables"
              className="h-14 w-14 rounded-xl object-contain" // larger logo
            />
            {/* Highlighted product name: stronger weight, larger font, accent color */}
            <span className="text-2xl font-extrabold tracking-tight text-indigo-800">
              Legal Billables
            </span>
          </button>

          {/* Right cluster: menu (moved here), bell, profile/login */}
          <div className="flex items-center gap-5">
            {/* Desktop menu now on the right, next to bell */}
            <nav className="hidden md:flex items-center gap-2">
              {menuItems.map((i) => (
                <button
                  key={i.to}
                  onClick={() => navigate(i.to)}
                  className="px-4 py-2.5 rounded-md text-base font-semibold text-slate-700 hover:bg-white hover:shadow-sm hover:text-indigo-700 transition"
                >
                  {i.label}
                </button>
              ))}
            </nav>

            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p-3 text-gray-600 hover:text-indigo-700 hover:bg-white transition"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-6 h-6" />
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              /* Profile dropdown (desktop) */
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center"
                >
                  <img
                    src={user?.avatar || "https://via.placeholder.com/56"}
                    alt="profile"
                    className="h-12 w-12 rounded-full border border-gray-300"
                  />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg py-1 text-sm transform transition-all duration-200 ease-out origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  <button
                    onClick={() => navigate("/profile")}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    Profile Settings
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50"
                  >
                    General Settings
                  </button>
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              // Bigger login button to match taller navbar
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/login")}
                className="text-base px-5 py-3"
              >
                Login
              </Button>
            )}

            {/* Mobile hamburger (right edge) */}
            <button
              className="md:hidden flex items-center text-gray-700 hover:text-indigo-700 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer (includes menu + auth) */}
      <div
        className={`md:hidden transform transition-all duration-300 ease-in-out origin-top ${
          mobileOpen
            ? "max-h-[700px] opacity-100 scale-100"
            : "max-h-0 opacity-0 scale-95 overflow-hidden"
        }`}
      >
        <div className="bg-white border-t border-gray-200 shadow-sm px-4 py-4 space-y-2">
          {/* Menu (mobile) */}
          {menuItems.map((i) => (
            <button
              key={i.to}
              onClick={() => {
                navigate(i.to);
                setMobileOpen(false);
              }}
              className="block w-full text-left px-4 py-3 rounded-md text-base font-semibold hover:bg-gray-50 hover:text-indigo-700 transition"
            >
              {i.label}
            </button>
          ))}

          {/* Auth (mobile) */}
          {!isAuthenticated ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-2 text-base py-3"
              onClick={() => {
                navigate("/login");
                setMobileOpen(false);
              }}
            >
              Login
            </Button>
          ) : (
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-md text-base font-semibold text-red-600 hover:bg-gray-50 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
