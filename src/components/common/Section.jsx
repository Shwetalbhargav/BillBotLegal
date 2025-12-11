// src/components/common/Section.jsx
import React from "react";
import clsx from "clsx";

export default function Section({ id, className, children }) {
  return (
    <section
      id={id}
      className={clsx(
        "w-full py-12 sm:py-16",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-0">
        {children}
      </div>
    </section>
  );
}
