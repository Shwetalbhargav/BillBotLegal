// ToastProvider.jsx (Soft-UI Refactor)
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---- Types & Defaults -------------------------------------------------------

/**
 * Toast shape:
 * {
 *   id: string,
 *   title?: string,
 *   description?: string,
 *   variant?: "success" | "error" | "warning" | "info",
 *   duration?: number, // ms; default 4000
 *   action?: { label: string, onClick: () => void },
 *   onClose?: () => void
 * }
 */

const DEFAULT_DURATION = 4000;

const VARIANT_STYLES = {
  success:
    "border-emerald-200/70 bg-emerald-50 text-emerald-900",
  error:
    "border-rose-200/70 bg-rose-50 text-rose-900",
  warning:
    "border-amber-200/70 bg-amber-50 text-amber-900",
  info:
    "border-indigo-200/70 bg-indigo-50 text-indigo-900",
};

const VARIANT_ICON = {
  success: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 011.06 0L10 7.94l.66-.72a.75.75 0 111.08 1.04L11.06 9l.68.72a.75.75 0 11-1.08 1.04L10 10.06l-.66.7a.75.75 0 11-1.08-1.04l.7-.72-.68-.72a.75.75 0 010-1.06z" clipRule="evenodd"/>
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.596c.75 1.335-.212 3.005-1.742 3.005H3.481c-1.53 0-2.492-1.67-1.742-3.005L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V8a1 1 0 112 0v3a1 1 0 01-1 1z"/>
    </svg>
  ),
  info: (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zM9 9.5A1.5 1.5 0 1012 9.5 1.5 1.5 0 009 9.5zM11 14a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd"/>
    </svg>
  ),
};

// ---- Context ----------------------------------------------------------------

const ToastContext = createContext({
  toasts: [],
  push: (_t) => {},
  dismiss: (_id) => {},
  clear: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ---- Provider ----------------------------------------------------------------

export function ToastProvider({ children, position = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = t.id ?? cryptoRandomId();
    const toast = {
      id,
      variant: t.variant ?? "info",
      duration: t.duration ?? DEFAULT_DURATION,
      ...t,
    };
    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => {
      const toast = prev.find((x) => x.id === id);
      if (toast?.onClose) {
        // Fire after animation completes via timeout handled by viewport item
        setTimeout(() => toast.onClose?.(), 180);
      }
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setToasts((prev) => {
      prev.forEach((t) => setTimeout(() => t.onClose?.(), 180));
      return [];
    });
  }, []);

  const value = useMemo(() => ({ toasts, push, dismiss, clear }), [toasts, push, dismiss, clear]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

// ---- Viewport & Item ---------------------------------------------------------

function ToastViewport({ toasts, onDismiss, position }) {
  const posClass = positionToClass(position);

  return (
    <div
      className={`pointer-events-none fixed z-[1000] ${posClass} space-y-3 sm:space-y-4 p-4 sm:p-6`}
      role="region"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { id, title, description, variant, duration, action } = toast;
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  // Auto-dismiss logic with pause-on-hover
  useEffect(() => {
    if (!duration) return;
    if (hovered) return;
    timerRef.current = setTimeout(onDismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [duration, hovered, onDismiss]);

  const tone =
    VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;

  return (
    <div
      className={`
        pointer-events-auto w-full sm:w-[360px]
        rounded-2xl border shadow-md
        ${tone}
        ring-1 ring-black/5
        transition-all data-[state=closed]:opacity-0 data-[state=closed]:translate-y-1
        animate-in fade-in slide-in-from-top-2
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-state="open"
      role="status"
      aria-atomic="true"
      aria-live="polite"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 text-current">
            {VARIANT_ICON[variant] ?? VARIANT_ICON.info}
          </div>

          <div className="min-w-0 flex-1">
            {title && (
              <div className="text-sm font-semibold leading-5 truncate">
                {title}
              </div>
            )}
            {description && (
              <div className="mt-0.5 text-sm leading-5 text-black/70 dark:text-white/80">
                {description}
              </div>
            )}

            {action && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => {
                    action.onClick?.();
                    onDismiss();
                  }}
                  className="
                    inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm
                    bg-white/70 hover:bg-white active:bg-white
                    text-gray-900 border border-white/60 shadow-sm
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10
                  "
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="
              shrink-0 rounded-xl p-1 text-black/50 hover:text-black
              hover:bg-white/60 active:bg-white/80
              focus:outline-none focus-visible:ring-2 focus-visible:ring-black/10
            "
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Utils -------------------------------------------------------------------

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

function positionToClass(pos) {
  switch (pos) {
    case "top-left":
      return "top-4 left-4 items-start";
    case "top-center":
      return "top-4 inset-x-0 mx-auto items-center";
    case "top-right":
      return "top-4 right-4 items-end";
    case "bottom-left":
      return "bottom-4 left-4 items-start";
    case "bottom-center":
      return "bottom-4 inset-x-0 mx-auto items-center";
    case "bottom-right":
    default:
      return "bottom-4 right-4 items-end";
  }
}

export default ToastProvider;
