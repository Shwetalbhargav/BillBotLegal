export function clsx(...parts) {
  return parts.flatMap(p => {
    if (!p) return [];
    if (typeof p === 'string') return [p];
    if (Array.isArray(p)) return p.filter(Boolean);
    if (typeof p === 'object') return Object.entries(p).filter(([,v])=>Boolean(v)).map(([k])=>k);
    return [];
  }).join(' ');
}
