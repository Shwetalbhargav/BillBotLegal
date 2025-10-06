import React from 'react';
import { FaUserTie, FaBriefcase, FaGavel } from 'react-icons/fa';

const features = [
  {
    title: 'Client Management',
    icon: <FaUserTie size={40} className="opacity-90" />,
    desc: 'Easily create, update and manage client records.',
  },
  {
    title: 'Case Tracking',
    icon: <FaBriefcase size={40} className="opacity-90" />,
    desc: 'Organize billables and case-related activities per client.',
  },
  {
    title: 'Dashboard Insights',
    icon: <FaGavel size={40} className="opacity-90" />,
    desc: 'Overview of all billable entries and client activities.',
  },
];
export default function Features() {
  return (
    <section id="features" className="py-16 px-6 bg-[color:var(--lb-bg)]">
      <h2 className="text-2xl font-semibold text-center mb-10 text-[color:var(--lb-text)]">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-[var(--lb-radius-xl)] bg-[color:var(--lb-surface)] border border-[color:var(--lb-border)] p-6 text-center shadow-[var(--lb-shadow-sm)] hover:shadow-[var(--lb-shadow-md)] transition-transform hover:-translate-y-[2px]"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--lb-bg)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)] mx-auto">
              {f.icon}
            </div>
            <h3 className="font-semibold text-lg text-[color:var(--lb-text)]">{f.title}</h3>
            <p className="mt-2 text-sm text-[color:var(--lb-muted)]">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}