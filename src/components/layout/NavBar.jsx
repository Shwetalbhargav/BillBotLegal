// src/components/layout/NavBar.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "@/components/common";
import { ThemeSwitch } from "@/components/common/ThemeProvider";
import useAuth from "@/hooks/useAuth";
import { Bell, Menu, X, ChevronDown } from "lucide-react";

function avatarFromUser(user) {
  if (!user) return "/assets/photos/default.jpg";
  if (user.avatar) return user.avatar;
  const role = String(user.role || "user").toLowerCase();
  const slug = String(
    user.username || (user.name || "user").split(" ")[0]
  ).toLowerCase();
  return `/assets/photos/${role}/${slug}.jpg`;
}

function profileRouteFor(role) {
  const r = String(role || "").toLowerCase();
  if (r === "admin") return "/profile/admin";
  if (r === "partner") return "/profile/partner";
  if (r === "lawyer") return "/profile/lawyer";
  if (r === "associate") return "/profile/associate";
  if (r === "intern") return "/profile/intern";
  return "/profile";
}

const NAV_ITEMS = [
  { to: "/#cases", label: "Cases" },
  { to: "/#clients", label: "Clients" },
  { to: "/#partners", label: "Partners" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const go = (to) => navigate(to);

  const linkBase =
    "px-3 py-2 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]";
  const linkActive =
    "bg-[color:var(--lb-primary-50)] text-[color:var(--lb-primary-700)]";
  const linkIdle =
    "text-[color:var(--lb-muted)] hover:bg-[color:var(--lb-surface)] hover:text-[color:var(--lb-primary-700)]";

  const avatarSrc = avatarFromUser(user);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Glassy bar */}
      <div className="backdrop-blur-md bg-[color:var(--lb-surface)]/80 border-b border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            {/* Brand */}
            <button
              onClick={() => go("/")}
              className="flex items-center gap-3 hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)] rounded-xl"
              aria-label="Go to home"
            >
              <img
                src={logo}
                alt="Legal Billables"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain border border-[color:var(--lb-border)] bg-white"
              />
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[color:var(--lb-primary-800)]">
                Legal Billables
              </span>
            </button>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  location.hash === item.to.replace("/", "") ||
                  location.pathname + location.hash === item.to;
                return (
                  <button
                    key={item.to}
                    onClick={() => go(item.to)}
                    className={`${linkBase} ${
                      isActive ? linkActive : linkIdle
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right cluster */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme */}
              <ThemeSwitch className="hidden sm:inline-flex" />

              {/* Notifications */}
              <button
                type="button"
                className="relative rounded-2xl p-2.5 text-[color:var(--lb-muted)] hover:text-[color:var(--lb-primary-700)] hover:bg-[color:var(--lb-surface)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-[color:var(--lb-surface)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
                    aria-expanded={profileOpen}
                    aria-haspopup="menu"
                  >
                    <img
                      src={avatarSrc}
                      alt="Profile"
                      className="h-9 w-9 rounded-full border border-[color:var(--lb-border)] object-cover"
                    />
                    <span className="text-sm font-medium">
                      {user?.name || "User"}
                    </span>
                    <ChevronDown className="h-4 w-4 text-[color:var(--lb-muted)]" />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-md)] p-1 transition transform origin-top-right
                    ${
                      profileOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 -translate-y-1 pointer-events-none"
                    }`}
                    role="menu"
                    aria-label="Profile"
                  >
                    <MenuItem
                      onClick={() =>
                        go(profileRouteFor(user?.role))
                      }
                    >
                      Profile Settings
                    </MenuItem>
                    <MenuItem onClick={logout} tone="danger">
                      Logout
                    </MenuItem>
                  </div>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => go("/login")}
                  className="hidden sm:inline-flex"
                >
                  Login
                </Button>
              )}

              {/* Mobile toggles */}
              <ThemeSwitch className="sm:hidden" />
              <button
                className="md:hidden inline-flex items-center rounded-2xl p-2.5 text-[color:var(--lb-muted)] hover:text-[color:var(--lb-primary-700)] hover:bg-[color:var(--lb-surface)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden bg-[color:var(--lb-surface)] border-b border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] transition-all overflow-hidden
        ${
          mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-2">
          {/* Links */}
          <nav className="grid gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.to}
                onClick={() => go(item.to)}
                className={`${linkBase} ${linkIdle} w-full text-left`}
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && (
              <button
                onClick={() => go(profileRouteFor(user?.role))}
                className={`${linkBase} ${linkIdle} w-full text-left`}
              >
                Profile Settings
              </button>
            )}
          </nav>

          {/* Auth */}
          {!isAuthenticated ? (
            <Button
              variant="primary"
              size="md"
              className="w-full mt-1"
              onClick={() => go("/login")}
            >
              Login
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              className="w-full mt-1"
              onClick={logout}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ children, onClick, tone }) {
  const base =
    "w-full text-left px-3 py-2 rounded-xl text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]";
  const idle =
    "text-[color:var(--lb-text)] hover:bg-[color:var(--lb-bg)]";
  const danger = "text-rose-600 hover:bg-rose-50";
  return (
    <button
      onClick={onClick}
      className={`${base} ${tone === "danger" ? danger : idle}`}
      role="menuitem"
    >
      {children}
    </button>
  );
}
