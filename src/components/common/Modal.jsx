import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "../../utils/clsx.js";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  preventCloseOnBackdrop = false,
  hideClose = false,
}) {
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  useFocusTrap(dialogRef, triggerRef, open);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && open && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  const handleBackdrop = () => {
    if (!preventCloseOnBackdrop) onClose?.();
  };

  return (
    <div
      className="lb-reset fixed inset-0 z-[1000] grid place-items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-[#080f22]/35 backdrop-blur-[5px]"
        onClick={handleBackdrop}
      />

      <div
        ref={dialogRef}
        className={clsx(
          "relative z-[1001] w-[92vw] overflow-hidden",
          "rounded-[var(--lb-radius-xl)] bg-[color:var(--lb-surface)]",
          "border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-lg)]",
          "animate-[lb-scale-in_160ms_ease-out]",
          sizes[size] || sizes.md
        )}
      >
        {(title || !hideClose) && (
          <header className="flex items-start justify-between gap-3 px-6 py-5 border-b border-[color:var(--lb-border)]">
            {title && (
              <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.01em] text-[color:var(--lb-text)]">
                {title}
              </h2>
            )}
            {!hideClose && (
              <button
                className="rounded-[var(--lb-radius-sm)] p-2 text-[color:var(--lb-muted-strong)] hover:bg-[color:var(--lb-surface-subtle)] hover:text-[color:var(--lb-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
                onClick={onClose}
                aria-label="Close"
                ref={triggerRef}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </header>
        )}

        <div className="px-6 py-5 text-[14px] text-[color:var(--lb-text)]">
          {children}
        </div>

        {footer && (
          <footer className="px-6 py-5 border-t border-[color:var(--lb-border)] bg-[color:var(--lb-surface-subtle)] rounded-b-[var(--lb-radius-xl)] flex justify-end gap-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
