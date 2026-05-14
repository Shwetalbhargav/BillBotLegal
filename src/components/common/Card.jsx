// src/components/common/Card.jsx
import React from "react";
import { clsx } from "../../utils/clsx.js";


const PADS = { none: "p-0", sm: "p-3", md: "p-5", lg: "p-6", xl: "p-8" };

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
          "transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-[color:var(--lb-primary-200)] hover:shadow-[var(--lb-shadow-md)] focus-within:shadow-[var(--lb-shadow-md)]",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
