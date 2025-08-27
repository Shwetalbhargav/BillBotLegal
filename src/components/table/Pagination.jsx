import React from "react";
import { Button } from "@/components/common";

export default function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pages = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total || 0, page * pageSize);

  return (
    <div className="lb-reset flex items-center justify-between gap-4 py-3">
      <div className="text-sm text-[color:var(--lb-muted)]">
        {total ? `Showing ${start}–${end} of ${total}` : "No records"}
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            className="lb-input py-1 text-sm"
            value={pageSize}
            onChange={(e)=>onPageSizeChange(Number(e.target.value))}
          >
            {[10,20,50,100].map(s => <option key={s} value={s}>{s}/page</option>)}
          </select>
        )}
        <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>onPageChange(1)}>{'<<'}</Button>
        <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>onPageChange(page-1)}>{'<'}</Button>
        <span className="text-sm min-w-[80px] text-center">Page {page} / {pages}</span>
        <Button variant="secondary" size="sm" disabled={page>=pages} onClick={()=>onPageChange(page+1)}>{'>'}</Button>
        <Button variant="secondary" size="sm" disabled={page>=pages} onClick={()=>onPageChange(pages)}>{'>>'}</Button>
      </div>
    </div>
  );
}
