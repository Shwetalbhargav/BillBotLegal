// Testimonials.jsx (Soft-UI Refactor)
import React from "react";

/**
 * Props:
 *  - title?: string
 *  - subtitle?: string
 *  - items: Array<{
 *      id?: string | number,
 *      quote: string,
 *      name: string,
 *      role?: string,
 *      company?: string,
 *      avatarUrl?: string,
 *      rating?: number // 0..5 (optional)
 *    }>
 *  - columns?: 1 | 2 | 3 (default 3)
 *  - className?: string
 */
export default function Testimonials({
  title = "Loved by legal teams",
  subtitle = "Real lawyers. Real time saved.",
  items = [],
  columns = 3,
  className,
}) {
  const gridCols =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <section className={`w-full ${className ?? ""}`}>
      {(title || subtitle) && (
        <header className="mb-8 text-center">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              {subtitle}
            </p>
          )}
        </header>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm p-10 text-center">
          <p className="text-gray-500">No testimonials yet.</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${gridCols}`}>
          {items.map((t, i) => (
            <TestimonialCard key={t.id ?? i} {...t} />
          ))}
        </div>
      )}
    </section>
  );
}

function TestimonialCard({ quote, name, role, company, avatarUrl, rating }) {
  return (
    <figure
      className="
        h-full rounded-2xl border border-gray-200/70 bg-white
        shadow-sm p-6 flex flex-col
      "
    >
      {/* Quote */}
      <blockquote className="text-gray-700 leading-relaxed">
        <span className="select-none text-3xl text-gray-300 align-top">“</span>
        {quote}
        <span className="select-none text-3xl text-gray-300 align-bottom">”</span>
      </blockquote>

      {/* Rating */}
      {Number.isFinite(rating) && rating > 0 && (
        <div className="mt-3 flex items-center" aria-label={`Rated ${rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} filled={i < Math.round(rating)} />
          ))}
          <span className="ml-2 text-sm text-gray-500">{Math.round(rating * 10) / 10}</span>
        </div>
      )}

      {/* Person */}
      <figcaption className="mt-5 flex items-center gap-3">
        <Avatar src={avatarUrl} alt={`${name} avatar`} />
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">{name}</div>
          {(role || company) && (
            <div className="text-sm text-gray-500 truncate">
              {[role, company].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

function Avatar({ src, alt }) {
  return src ? (
    <img
      src={src}
      alt={alt}
      className="h-10 w-10 rounded-full object-cover border border-gray-200"
      loading="lazy"
      width={40}
      height={40}
    />
  ) : (
    <div
      className="
        h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200
        border border-gray-200 flex items-center justify-center text-gray-500
      "
      aria-hidden="true"
      title="No avatar"
    >
      <span className="text-sm">👤</span>
    </div>
  );
}

function Star({ filled }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? "text-amber-500" : "text-gray-300"}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.968 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10.5 14.347a1 1 0 00-1 0l-2.885 2.135c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.9 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
    </svg>
  );
}
