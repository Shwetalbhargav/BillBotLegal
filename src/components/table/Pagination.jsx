// src/components/table/Pagination.jsx
import React from "react";


function PageBtn({ disabled, active, children, onClick }) {
return (
<button
type="button"
disabled={disabled}
onClick={onClick}
className={[
"h-8 min-w-8 px-2 rounded-[var(--lb-radius-sm)] border",
active ? "bg-[color:var(--lb-primary-600)] text-white border-transparent" :
"bg-[color:var(--lb-bg)] border-[color:var(--lb-border)] text-[color:var(--lb-text)]",
"shadow-[var(--lb-shadow-xs)] disabled:opacity-50 disabled:cursor-not-allowed"
].join(" ")}
>
{children}
</button>
);
}


export default function Pagination({ page, pages, onPage }) {
if (pages <= 1) return null;
const to = (p) => () => onPage(Math.max(1, Math.min(pages, p)));
const nums = [page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages);
return (
<div className="flex items-center gap-2 p-3">
<PageBtn disabled={page === 1} onClick={to(1)}>{"«"}</PageBtn>
<PageBtn disabled={page === 1} onClick={to(page - 1)}>{"‹"}</PageBtn>
{nums.map((n) => (
<PageBtn key={n} active={n === page} onClick={to(n)}>{n}</PageBtn>
))}
<PageBtn disabled={page === pages} onClick={to(page + 1)}>{"›"}</PageBtn>
<PageBtn disabled={page === pages} onClick={to(pages)}>{"»"}</PageBtn>
</div>
);
}