import React from "react";

export default function SkeletonRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="animate-pulse">
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-3 py-3 border-b border-[color:var(--lb-border)]">
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
