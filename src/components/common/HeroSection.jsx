import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <header className="bg-white shadow-md py-12 px-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Legal Billables AI</h1>
      <p className="text-lg mb-6 max-w-2xl mx-auto">
        Automate and optimize your legal billing workflow — log emails, calls, meetings, and more in one click.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </header>
  );
};

export default HeroSection;
