import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { clsx } from "../../utils/clsx.js";

const DEFAULT_DURATION = 4000;

const VARIANT_STYLES = {
  success: "border-[color:var(--lb-success-100)] bg-[color:var(--lb-success-50)] text-[color:var(--lb-success-700)]",
  error: "border-[color:var(--lb-danger-100)] bg-[color:var(--lb-danger-50)] text-[color:var(--lb-danger-700)]",
  warning: "border-[color:var(--lb-warning-100)] bg-[color:var(--lb-warning-50)] text-[color:var(--lb-warning-700)]",
  info: "border-[color:var(--lb-primary-100)] bg-[color:var(--lb-info-50)] text-[color:var(--lb-primary-900)]",
};

const VARIANT_ICON = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
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

export function ToastProvider({ children, position = "bottom-right" }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = toast.id ?? cryptoRandomId();
    setToasts((prev) => [
      ...prev,
      {
        id,
        variant: toast.variant ?? "info",
        duration: toast.duration ?? DEFAULT_DURATION,
        ...toast,
      },
    ]);
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
      <ToastViewport toasts={toasts} onDismiss={dismiss} position={position} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss, position }) {
  return (
    <div
      className={`pointer-events-none fixed z-[1100] ${positionToClass(position)} space-y-3 p-4 sm:p-6`}
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const { title, description, variant, duration, action } = toast;
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);
  const Icon = VARIANT_ICON[variant] ?? Info;

  useEffect(() => {
    if (!duration || hovered) return undefined;
    timerRef.current = setTimeout(onDismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [duration, hovered, onDismiss]);

  return (
    <div
      className={clsx(
        "pointer-events-auto w-full sm:w-[380px]",
        "rounded-[var(--lb-radius-lg)] border shadow-[var(--lb-shadow-md)]",
        "px-4 py-3 animate-[lb-scale-in_160ms_ease-out]",
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.info
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="status"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          {title && <div className="font-extrabold leading-5">{title}</div>}
          {description && (
            <div className="mt-0.5 text-sm leading-5 opacity-90">
              {description}
            </div>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-[var(--lb-radius-sm)] p-1 opacity-70 hover:bg-white/55 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
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
      return "top-4 left-4";
    case "top-center":
      return "top-4 left-1/2 -translate-x-1/2";
    case "top-right":
      return "top-4 right-4";
    case "bottom-left":
      return "bottom-4 left-4";
    case "bottom-center":
      return "bottom-4 left-1/2 -translate-x-1/2";
    case "bottom-right":
    default:
      return "bottom-4 right-4";
  }
}

export default ToastProvider;
