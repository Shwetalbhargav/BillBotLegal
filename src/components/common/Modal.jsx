import React, { useEffect, useRef } from "react";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { clsx } from "../../utils/clsx";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md", // sm | md | lg | xl
  preventCloseOnBackdrop = false,
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

  const onBackdrop = () => {
    if (preventCloseOnBackdrop) return;
    onClose?.();
  };

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="lb-reset fixed inset-0 z-[1000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onBackdrop} />
      <div
        ref={dialogRef}
        className={clsx(
          "relative z-[1001] w-[90vw] rounded-[var(--lb-radius-lg)] bg-[color:var(--lb-bg)] shadow-[var(--lb-shadow-lg)]",
          "border border-[color:var(--lb-border)]",
          sizes[size]
        )}
      >
        <header className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--lb-border)]">
          <h2 className="text-[var(--lb-fs-lg)] m-0">{title}</h2>
          <button
            className="rounded p-2 hover:bg-[color:var(--lb-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
            onClick={onClose}
            aria-label="Close"
            ref={triggerRef}
          >
            ✕
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <footer className="px-5 py-4 border-t border-[color:var(--lb-border)] flex justify-end gap-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
