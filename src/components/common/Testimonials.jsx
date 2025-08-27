import React from 'react';

const testimonials = [
  {
    name: 'Early Beta User',
    text: 'The second I send an email, it logs a clean billable for me. I don’t even think about it. I just saved 5 minutes, 5 times a day.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Lawyer from NYC',
    text: 'I no longer forget to log time. It’s seamless and built right into my workflow.',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 px-6 bg-white">
      <h2 className="text-2xl font-semibold text-center mb-12">What Our Users Say</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {testimonials.map((t, idx) => (
          <div
            key={idx}
            className="bg-gray-100 p-6 rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1 text-center"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
            />
            <blockquote className="italic text-gray-700">“{t.text}”</blockquote>
            <footer className="mt-3 font-semibold">{t.name}</footer>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
