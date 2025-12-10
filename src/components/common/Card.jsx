// src/components/common/Card.jsx
import React from "react";
import { clsx } from "../../utils/clsx";

const PADS = { sm: "p-3", md: "p-4", lg: "p-6" };

export default function Card({
  as: Tag = "div",
  className,
  children,
  padding = "md",
  interactive = false,
  ...props
}) {
  return (
    <Tag
      className={clsx(
        "lb-reset rounded-[var(--lb-radius-xl)] bg-[color:var(--lb-surface)]",
        "border border-[color:var(--lb-border)]",
        "shadow-[var(--lb-shadow-sm)]",
        PADS[padding],
        interactive &&
          "transition-shadow hover:shadow-[var(--lb-shadow-md)] focus-within:shadow-[var(--lb-shadow-md)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
