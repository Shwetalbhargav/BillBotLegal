// src/components/table/Pagination.jsx
import React from "react";

function PageBtn({ disabled, active, children, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "lb-reset h-8 min-w-8 px-2 rounded-full border text-[12px] font-medium",
        active
          ? "bg-[color:var(--lb-primary-600)] text-white border-transparent shadow-[var(--lb-shadow-sm)]"
          : "bg-[color:var(--lb-bg)] border-[color:var(--lb-border)] text-[color:var(--lb-text)] shadow-[var(--lb-shadow-xs)] hover:bg-[color:var(--lb-surface)]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;

  const to = (p) => () =>
    onPage(Math.max(1, Math.min(pages, p)));

  const nums = [page - 1, page, page + 1].filter(
    (n) => n >= 1 && n <= pages
  );

  return (
    <div className="flex items-center gap-2 p-3">
      <PageBtn disabled={page === 1} onClick={to(1)}>
        {"«"}
      </PageBtn>
      <PageBtn disabled={page === 1} onClick={to(page - 1)}>
        {"‹"}
      </PageBtn>
      {nums.map((n) => (
        <PageBtn
          key={n}
          active={n === page}
          onClick={to(n)}
        >
          {n}
        </PageBtn>
      ))}
      <PageBtn disabled={page === pages} onClick={to(page + 1)}>
        {"›"}
      </PageBtn>
      <PageBtn disabled={page === pages} onClick={to(pages)}>
        {"»"}
      </PageBtn>
    </div>
  );
}
