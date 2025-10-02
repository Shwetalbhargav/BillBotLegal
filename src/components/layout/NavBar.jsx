// src/components/layout/NavBar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/common";
import useAuth from "@/hooks/useAuth";
import { Bell, Menu, X } from "lucide-react";

export default function NavBar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth(); // assume user object {name, email, avatar}
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const menuItems = [
    { to: "/#cases", label: "Cases" },
    { to: "/#clients", label: "Clients" },
    { to: "/#partners", label: "Partners" },
  ];

  const profileOptions = [
    { to: "/profile", label: "Profile Settings" },
    { to: "/settings", label: "General Settings" },
    { to: "/top-lawyers", label: "Top Lawyers" },
    { to: "/blogs", label: "Blogs" },
    { to: "/#cases", label: "Case Graph" },
    { to: "/#clients", label: "Clients" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="mx-auto max-w-7xl px-6 py-3">
        <div className="bg-[color:var(--lb-surface)]/70 backdrop-blur border border-[color:var(--lb-border)] rounded-full shadow-[var(--lb-shadow-sm)] flex items-center justify-between px-4 py-2">
          
          {/* Brand */}
          <button
            onClick={() => navigate("/")}
            className="lb-reset flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            aria-label="Go to home"
          >
            <img src={logo} alt="Legal Billables" className="h-10 w-10 rounded-full object-contain" />
            <span className="font-semibold">Legal Billables</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex gap-6 text-sm">
              {menuItems.map((i) => (
                <li key={i.to}>
                  <button
                    onClick={() => navigate(i.to)}
                    className="lb-reset hover:text-indigo-600 hover:underline transition"
                  >
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p-1 text-gray-500 hover:text-indigo-600 transition"
            >
              <Bell className="w-6 h-6" />
            </button>

            {isAuthenticated ? (
              // Profile Dropdown (Desktop only)
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center hover:opacity-80 transition"
                >
                  <img
                    src={user?.avatar || "https://via.placeholder.com/40"}
                    alt="profile"
                    className="h-9 w-9 rounded-full border"
                  />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 text-sm transform transition-all duration-200 ease-out origin-top-right ${
                    dropdownOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {profileOptions.map((opt) => (
                    <button
                      key={opt.to}
                      onClick={() => navigate(opt.to)}
                      className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {opt.label}
                    </button>
                  ))}
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
                Login
              </Button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden flex items-center text-gray-600 hover:text-indigo-600 transition"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu with Animation */}
        <div
          className={`md:hidden transform transition-all duration-300 ease-in-out origin-top ${
            mobileOpen
              ? "max-h-[700px] opacity-100 scale-100"
              : "max-h-0 opacity-0 scale-95 overflow-hidden"
          }`}
        >
          <div className="mt-2 rounded-lg bg-white shadow-lg border px-4 py-3">
            {/* Profile Header (Mobile only) */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                <img
                  src={user?.avatar || "https://via.placeholder.com/50"}
                  alt="profile"
                  className="h-12 w-12 rounded-full border"
                />
                <div>
                  <p className="font-medium">{user?.name || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.email || "user@email.com"}</p>
                </div>
              </div>
            )}

            <ul className="flex flex-col gap-3">
              {menuItems.map((i) => (
                <li key={i.to}>
                  <button
                    onClick={() => {
                      navigate(i.to);
                      setMobileOpen(false);
                    }}
                    className="w-full text-left hover:text-indigo-600 hover:bg-gray-50 px-3 py-2 rounded transition"
                  >
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Profile options in mobile */}
            {isAuthenticated && (
              <div className="mt-4 border-t pt-3">
                {profileOptions.map((opt) => (
                  <button
                    key={opt.to}
                    onClick={() => {
                      navigate(opt.to);
                      setMobileOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition"
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded text-red-500 hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-4 border-t pt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
