import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clsx } from "../../utils/clsx.js";

function PageBtn({ disabled, active, children, onClick, label }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "lb-reset h-9 min-w-9 rounded-[var(--lb-radius-md)] border px-2 text-[13px] font-bold",
        "transition-[background,border-color,box-shadow]",
        active
          ? "bg-[color:var(--lb-primary-600)] text-white border-[color:var(--lb-primary-700)] shadow-[var(--lb-shadow-blue)]"
          : "bg-[color:var(--lb-surface)] border-[color:var(--lb-border)] text-[color:var(--lb-text)] hover:bg-[color:var(--lb-primary-50)] hover:border-[color:var(--lb-primary-200)]",
        "disabled:cursor-not-allowed disabled:opacity-45"
      )}
    >
      {children}
    </button>
  );
}

export default function Pagination({ page = 1, pages = 1, onPage }) {
  if (pages <= 1) return null;

  const go = (target) => () => onPage?.(Math.max(1, Math.min(pages, target)));
  const nums = buildWindow(page, pages);

  return (
    <div className="flex items-center gap-2 p-3">
      <PageBtn disabled={page === 1} onClick={go(page - 1)} label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </PageBtn>
      {nums.map((item, index) =>
        item === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1 text-[color:var(--lb-muted)]"
          >
            ...
          </span>
        ) : (
          <PageBtn
            key={item}
            active={item === page}
            onClick={go(item)}
            label={`Page ${item}`}
          >
            {item}
          </PageBtn>
        )
      )}
      <PageBtn disabled={page === pages} onClick={go(page + 1)} label="Next page">
        <ChevronRight className="h-4 w-4" />
      </PageBtn>
    </div>
  );
}

function buildWindow(page, pages) {
  if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out = [];
  for (const n of sorted) {
    if (out.length && n - out[out.length - 1] > 1) out.push("...");
    out.push(n);
  }
  return out;
}
