import { useEffect } from "react";

/**
 * Simple focus trap for modals/drawers.
 * Pass the ref of the container and the element to restore focus to on unmount.
 */
export function useFocusTrap(containerRef, restoreToRef, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = () =>
      Array.from(container.querySelectorAll(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));

    const previouslyFocused = document.activeElement;
    const list = focusable();
    if (list.length) list[0].focus();

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      if (restoreToRef?.current) restoreToRef.current.focus();
      else if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [containerRef, restoreToRef, enabled]);
}
