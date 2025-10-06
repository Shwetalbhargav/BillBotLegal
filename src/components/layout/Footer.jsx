// src/components/layout/Footer.jsx (Soft-UI Redesign)
import React from "react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/common";

const NAV = {
  product: [
    { label: "Chrome Extension", to: "/#extension" },
    { label: "Dashboard", to: "/#dashboard" },
    { label: "Mobile (Soon)", to: "/#mobile" },
    { label: "Integrations", to: "/#integrations" },
  ],
  resources: [
    { label: "Docs", to: "/docs" },
    { label: "Roadmap", to: "/#roadmap" },
    { label: "Changelog", to: "/changelog" },
    { label: "Status", to: "/status" },
  ],
  legal: [
    { label: "Terms", to: "/legal/terms" },
    { label: "Privacy", to: "/legal/privacy" },
    { label: "Security", to: "/legal/security" },
    { label: "DPA", to: "/legal/dpa" },
  ],
};

export default function Footer({
  onNav,                // optional: (href) => void (use navigate) else falls back to window.location
  showNewsletter = true,
  className,
}) {
  const go = (to) => (onNav ? onNav(to) : (window.location.href = to));

  return (
    <footer className={`mt-20 border-t border-gray-200/70 dark:border-white/10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 ${className ?? ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Top: Brand + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Legal Billables"
                className="h-12 w-12 rounded-2xl object-contain border border-gray-200/70 shadow-sm"
              />
              <div>
                <div className="text-xl font-extrabold tracking-tight text-indigo-800 dark:text-indigo-300">
                  Legal Billables
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI that logs your time where you work — Gmail, meetings, docs. Recover billables effortlessly.
                </p>
              </div>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              <Social icon="x" label="Twitter / X" href="https://x.com" />
              <Social icon="github" label="GitHub" href="https://github.com" />
              <Social icon="linkedin" label="LinkedIn" href="https://linkedin.com" />
            </div>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/90 dark:bg-gray-950/60 backdrop-blur-sm shadow-sm p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Get product updates
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Monthly digest — new features, tips, and early access invites.
                </p>

                <form
                  className="mt-4 flex flex-col sm:flex-row gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    // connect to your newsletter service here
                  }}
                >
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="you@firm.com"
                    className="
                      w-full sm:flex-1 rounded-2xl border border-gray-200/70 dark:border-white/10
                      bg-white dark:bg-gray-900 shadow-sm px-4 py-2.5
                      text-gray-900 dark:text-white placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-indigo-400/60
                    "
                  />
                  <Button type="submit" className="sm:w-auto w-full">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Middle: Link columns */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          <LinkColumn title="Product" items={NAV.product} onNav={go} />
          <LinkColumn title="Resources" items={NAV.resources} onNav={go} />
          <LinkColumn title="Legal" items={NAV.legal} onNav={go} />
          {/* Room for two extra columns if you need later */}
          <CTACard onNav={go} />
          <SupportCard />
          <InstallCard onNav={go} />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-gray-200/70 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {new Date().getFullYear()} Legal Billables, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => go("/legal/privacy")} className="text-sm text-gray-600 hover:text-indigo-700 dark:text-gray-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded">
              Privacy
            </button>
            <button onClick={() => go("/legal/terms")} className="text-sm text-gray-600 hover:text-indigo-700 dark:text-gray-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded">
              Terms
            </button>
            <button onClick={() => go("/legal/security")} className="text-sm text-gray-600 hover:text-indigo-700 dark:text-gray-400 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded">
              Security
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- Subcomponents -------------------------------- */

function LinkColumn({ title, items = [], onNav }) {
  return (
    <nav aria-label={title}>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">{title}</h4>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.to}>
            <button
              onClick={() => onNav(item.to)}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-700 hover:underline underline-offset-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function CTACard({ onNav }) {
  return (
    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm p-5">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Start for Free</h4>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Install the Gmail assistant and log your first billable in minutes.
      </p>
      <Button onClick={() => onNav?.("/#extension")} className="mt-3 w-full">
        Add Extension
      </Button>
    </div>
  );
}

function SupportCard() {
  return (
    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm p-5">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Support</h4>
      <ul className="mt-3 space-y-2 text-sm">
        <li className="text-gray-600 dark:text-gray-300">help@legalbillables.com</li>
        <li className="text-gray-600 dark:text-gray-300">Mon–Fri · 9am–6pm</li>
        <li className="text-gray-600 dark:text-gray-300">Response under 24h</li>
      </ul>
    </div>
  );
}

function InstallCard({ onNav }) {
  return (
    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm p-5">
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Install Everywhere</h4>
      <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <li>
          <button onClick={() => onNav?.("/#extension")} className="hover:text-indigo-700 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 rounded">
            Chrome Extension
          </button>
        </li>
        <li>
          <span className="opacity-70">Desktop Agent (Soon)</span>
        </li>
        <li>
          <span className="opacity-70">Mobile Apps (Soon)</span>
        </li>
      </ul>
    </div>
  );
}

function Social({ icon, label, href }) {
  const Icon = ({ name }) => {
    switch (name) {
      case "github":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.48 2 2 6.77 2 12.44c0 4.6 2.87 8.49 6.84 9.87.5.1.68-.23.68-.5v-1.77c-2.78.62-3.37-1.2-3.37-1.2-.45-1.19-1.1-1.5-1.1-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.07 1.53 1.07.9 1.61 2.37 1.14 2.95.87.09-.67.36-1.14.65-1.4-2.22-.26-4.56-1.15-4.56-5.12 0-1.13.38-2.05 1.02-2.77-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.06A9.1 9.1 0 0 1 12 7.1c.85 0 1.7.12 2.5.36 1.9-1.34 2.74-1.06 2.74-1.06.55 1.42.2 2.47.1 2.73.64.72 1.02 1.64 1.02 2.77 0 3.98-2.35 4.85-4.58 5.11.37.33.7.97.7 1.96v2.9c0 .27.18.61.69.5A10.44 10.44 0 0 0 22 12.44C22 6.77 17.52 2 12 2z" clipRule="evenodd" />
          </svg>
        );
      case "linkedin":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.85-2.2 3.8-2.2C19.4 8 22 10.2 22 14.5V24h-4v-8.2c0-2-.03-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24H8V8z"/>
          </svg>
        );
      case "x":
      default:
        return (
          <svg className="h-5 w-5" viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true">
            <path d="M714.163 519.284L1133.65 0H1030.5L667.137 450.887L367.332 0H0L438.369 639.574L0 1226.37H103.157L488.58 748.433L812.668 1226.37H1180.03L714.137 519.284H714.163ZM535.806 690.396L494.91 631.289L140.827 89.533H313.232L596.934 509.441L637.83 568.548L1008.62 1137.84H836.214L535.806 690.396Z"/>
          </svg>
        );
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm text-gray-700 hover:text-indigo-700 hover:shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
      aria-label={label}
      title={label}
    >
      <Icon name={icon} />
    </a>
  );
}
