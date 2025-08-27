import React from 'react';
import { FaUserTie, FaBriefcase, FaGavel } from 'react-icons/fa';

const features = [
  {
    title: 'Client Management',
    icon: <FaUserTie size={40} className="text-blue-500" />,
    desc: 'Easily create, update and manage client records.',
  },
  {
    title: 'Case Tracking',
    icon: <FaBriefcase size={40} className="text-green-500" />,
    desc: 'Organize billables and case-related activities per client.',
  },
  {
    title: 'Dashboard Insights',
    icon: <FaGavel size={40} className="text-purple-500" />,
    desc: 'Overview of all billable entries and client activities.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 px-6 bg-gray-100">
      <h2 className="text-2xl font-semibold text-center mb-12">Key Features</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="bg-white shadow hover:shadow-xl transition transform hover:-translate-y-1 p-6 text-center rounded-lg"
          >
            <div className="mb-4">{f.icon}</div>
            <h3 className="font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
