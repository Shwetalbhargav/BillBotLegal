// src/components/common/Heading.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";

const SIZE_MAP = {
  1: "text-[28px] sm:text-[32px]",
  2: "text-[22px] sm:text-[24px]",
  3: "text-[18px]",
  4: "text-[15px]",
};

export default function Heading({
  level = 2,
  className,
  children,
  subtle = false,
}) {
  const Tag = `h${level}`;
  return (
    <Tag
      className={clsx(
        SIZE_MAP[level] || SIZE_MAP[2],
        "font-semibold tracking-[-0.01em]",
        subtle
          ? "text-[color:var(--lb-muted)]"
          : "text-[color:var(--lb-text)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
