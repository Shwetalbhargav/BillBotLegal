import React, { createContext, useCallback, useContext, useId, useMemo, useState } from "react";
import { clsx } from "../../utils/clsx";

/** Simple toast + inline Alert */
const ToastCtx = createContext(null);

export function ToastProvider({ children, placement = "bottom-right", duration = 4000 }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), []);
  const add = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, ...toast }]);
    if (!toast.persistent) setTimeout(() => remove(id), toast.duration || duration);
    return id;
  }, [duration, remove]);

  const value = useMemo(() => ({ addToast: add, removeToast: remove }), [add, remove]);

  const pos = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  }[placement];

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className={clsx("fixed z-[1100] pointer-events-none", pos)}>
        <ul className="m-0 p-0 list-none flex flex-col gap-3">
          {toasts.map(t => (
            <li key={t.id} className="pointer-events-auto">
              <Alert
                tone={t.tone}
                title={t.title}
                description={t.description}
                onClose={() => remove(t.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function Alert({ tone = "default", title, description, onClose }) {
  const id = useId();
  const tones = {
    default: ["var(--lb-surface)", "var(--lb-text)"],
    success: ["var(--lb-success-100)", "var(--lb-success-600)"],
    danger: ["var(--lb-danger-100)", "var(--lb-danger-700)"],
    info: ["var(--lb-primary-100)", "var(--lb-primary-700)"],
  };
  const [bg, fg] = tones[tone] ?? tones.default;

  return (
    <div
      className="lb-reset min-w-[260px] max-w-[360px] rounded-[var(--lb-radius-md)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] p-3"
      style={{ background: bg, color: fg }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <div id={`${id}-title`} className="font-semibold">{title}</div>}
          {description && <div id={`${id}-desc`} className="text-sm opacity-90">{description}</div>}
        </div>
        {onClose && (
          <button className="rounded p-1 hover:bg-black/10 focus:outline-none" onClick={onClose} aria-label="Dismiss">✕</button>
        )}
      </div>
    </div>
  );
}

export default ToastProvider;
