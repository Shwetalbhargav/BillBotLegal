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

  const menuItems = [
    { to: "/#cases", label: "Cases" },
    { to: "/#clients", label: "Clients" },
    { to: "/#partners", label: "Partners" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gray-100 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          
          {/* Brand */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img src={logo} alt="Legal Billables" className="h-8 w-8 rounded-full object-contain" />
            <span className="font-semibold text-slate-800">Legal Billables</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((i) => (
              <button
                key={i.to}
                onClick={() => navigate(i.to)}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition"
              >
                {i.label}
              </button>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              className="relative rounded-full p-2 text-gray-500 hover:text-indigo-600 transition"
            >
              <Bell className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center"
                >
                  <img
                    src={user?.avatar || "https://via.placeholder.com/40"}
                    alt="profile"
                    className="h-9 w-9 rounded-full border border-gray-300"
                  />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 text-sm transform transition-all duration-200 ease-out origin-top-right ${
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
                    className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/login")}
              >
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
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
          <div className="px-4 py-3 space-y-2">
            {menuItems.map((i) => (
              <button
                key={i.to}
                onClick={() => {
                  navigate(i.to);
                  setMobileOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 hover:text-indigo-600 transition"
              >
                {i.label}
              </button>
            ))}
            {!isAuthenticated && (
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
