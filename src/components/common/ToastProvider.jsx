// src/components/common/ToastProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const DEFAULT_DURATION = 4000;

const VARIANT_STYLES = {
  success: "border-emerald-200/70 bg-emerald-50 text-emerald-900",
  error: "border-rose-200/70 bg-rose-50 text-rose-900",
  warning: "border-amber-200/70 bg-amber-50 text-amber-900",
  info: "border-indigo-200/70 bg-indigo-50 text-indigo-900",
};

const VARIANT_ICON = {
  /* ...same as your existing implementation... */
};

const ToastContext = createContext({
  toasts: [],
  push: () => {},
  dismiss: () => {},
  clear: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children, position = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = toast.id ?? cryptoRandomId();
    const next = {
      id,
      variant: toast.variant ?? "info",
      duration: toast.duration ?? DEFAULT_DURATION,
      ...toast,
    };
    setToasts((prev) => [...prev, next]);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const value = useMemo(
    () => ({ toasts, push, dismiss, clear }),
    [toasts, push, dismiss, clear]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport
        toasts={toasts}
        onDismiss={dismiss}
        position={position}
      />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss, position }) {
  const posClass = positionToClass(position);
  return (
    <div
      className={`pointer-events-none fixed z-[1000] ${posClass} space-y-3 sm:space-y-4 p-4 sm:p-6`}
      role="region"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { title, description, variant, duration, action } = toast;
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!duration || hovered) return;
    timerRef.current = setTimeout(onDismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [duration, hovered, onDismiss]);

  const tone = VARIANT_STYLES[variant] ?? VARIANT_STYLES.info;

  return (
    <div
      className={clsx(
        "pointer-events-auto w-full sm:w-[360px]",
        "rounded-2xl border shadow-[var(--lb-shadow-md)] ring-1 ring-black/5",
        "bg-[color:var(--lb-surface)]",
        tone
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="status"
    >
      {/* body same as your existing soft-UI version */}
    </div>
  );
}

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
