import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <header className="bg-[color:var(--lb-surface)] border-b border-[color:var(--lb-border)] py-14 px-6 text-center shadow-[var(--lb-shadow-sm)]">
      <h1 className="text-4xl font-bold mb-3 text-[color:var(--lb-text)] tracking-[-0.01em]">Legal Billables AI</h1>
      <p className="text-[var(--lb-text)]/80 text-lg mb-6 max-w-2xl mx-auto">
        Automate and optimize your legal billing workflow — log emails, calls, meetings, and more in one click.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 rounded-[var(--lb-radius-md)] bg-[color:var(--lb-primary-600)] text-white font-semibold shadow-[var(--lb-shadow-sm)] hover:shadow-[var(--lb-shadow-md)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
      >
        Go to Dashboard
      </Link>
    </header>
  );
}