// src/components/common/UserPicker.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "../../utils/clsx";

/**
 * Soft-UI UserPicker
 *  - users: [{ id, name, email?, avatarUrl? }]
 *  - value / defaultValue: id or [ids]
 *  - multiple?: boolean
 *  - onChange: nextValue
 */
export default function UserPicker({
  users = [],
  value,
  defaultValue,
  multiple = false,
  placeholder = "Search users…",
  disabled = false,
  onChange,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(
    defaultValue ?? (multiple ? [] : null)
  );

  const selected = isControlled ? value : innerValue;

  const selectedSet = useMemo(() => {
    return new Set(
      multiple
        ? Array.isArray(selected)
          ? selected
          : []
        : selected != null
        ? [selected]
        : []
    );
  }, [selected, multiple]);

  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = `${u.name ?? ""}`.toLowerCase();
      const email = `${u.email ?? ""}`.toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [users, query]);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, query]);

  useEffect(() => {
    function onDocClick(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const commitChange = (next) => {
    if (isControlled) onChange?.(next);
    else {
      setInnerValue(next);
      onChange?.(next);
    }
  };

  const toggleUser = (id) => {
    if (multiple) {
      const next = new Set(selectedSet);
      next.has(id) ? next.delete(id) : next.add(id);
      commitChange(Array.from(next));
    } else {
      commitChange(id);
      setOpen(false);
    }
  };

  const clearSelection = () => {
    commitChange(multiple ? [] : null);
    setQuery("");
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open && ["ArrowDown", "Enter", " "].includes(e.key)) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) toggleUser(item.id);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const chipUsers = useMemo(() => {
    if (!multiple) return [];
    const map = new Map(users.map((u) => [u.id, u]));
    return Array.isArray(selected)
      ? selected.map((id) => map.get(id)).filter(Boolean)
      : [];
  }, [multiple, selected, users]);

  const hasSelection =
    multiple ? chipUsers.length > 0 : selectedSet.size > 0;

  return (
    <div ref={wrapperRef} className={clsx("relative w-full", className)}>
      {/* Trigger */}
      <div
        className={clsx(
          "rounded-2xl border border-[color:var(--lb-border)] bg-[color:var(--lb-surface)]/95 backdrop-blur-sm",
          "shadow-[var(--lb-shadow-sm)] focus-within:ring-2 focus-within:ring-[color:var(--lb-primary-600)]",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Chips */}
        {multiple && chipUsers.length > 0 && (
          <div className="px-3 pt-2 flex flex-wrap gap-2">
            {chipUsers.map((u) => (
              <Chip
                key={u.id}
                onRemove={() => !disabled && toggleUser(u.id)}
                label={u.name}
                avatarUrl={u.avatarUrl}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2.5">
          <span
            className="h-5 w-5 inline-flex items-center justify-center text-[color:var(--lb-muted)]"
            aria-hidden="true"
          >
            🔍
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={clsx(
              "w-full bg-transparent outline-none",
              "text-[13px] text-[color:var(--lb-text)] placeholder:text-[color:var(--lb-muted)]"
            )}
            aria-expanded={open}
            aria-controls="userpicker-listbox"
            aria-autocomplete="list"
            role="combobox"
          />

          {/* Clear / Chevron */}
          {hasSelection && (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl p-1.5 text-[color:var(--lb-muted)] hover:bg-[color:var(--lb-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
              aria-label="Clear selection"
              disabled={disabled}
            >
              ×
            </button>
          )}

          <button
            type="button"
            onClick={() => !disabled && setOpen((v) => !v)}
            className="rounded-xl p-1.5 text-[color:var(--lb-muted)] hover:bg-[color:var(--lb-bg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
            aria-label={open ? "Close" : "Open"}
            disabled={disabled}
          >
            <svg
              className={clsx(
                "h-4 w-4 transition-transform",
                open && "rotate-180"
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          id="userpicker-listbox"
          role="listbox"
          className={clsx(
            "absolute z-50 mt-2 w-full rounded-2xl border border-[color:var(--lb-border)]",
            "bg-[color:var(--lb-surface)] shadow-[var(--lb-shadow-md)] max-h-72 overflow-auto p-1"
          )}
        >
          {items.length === 0 ? (
            <div className="px-3 py-2 text-[13px] text-[color:var(--lb-muted)]">
              No users found.
            </div>
          ) : (
            items.map((u, i) => {
              const isSelected = selectedSet.has(u.id);
              const active = i === activeIndex;

              return (
                <div
                  key={u.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => toggleUser(u.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-2xl cursor-pointer",
                    active && "bg-[color:var(--lb-bg)]",
                    !active && "hover:bg-[color:var(--lb-bg)]/80",
                    isSelected &&
                      "ring-1 ring-[color:var(--lb-primary-600)]"
                  )}
                >
                  <Avatar url={u.avatarUrl} name={u.name} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[color:var(--lb-text)] truncate">
                      {u.name}
                    </div>
                    {u.email && (
                      <div className="text-[11px] text-[color:var(--lb-muted)] truncate">
                        {u.email}
                      </div>
                    )}
                  </div>

                  {isSelected && (
                    <span
                      className="ml-auto text-[color:var(--lb-primary-600)] text-sm"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove, avatarUrl, disabled }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] px-2 py-1 text-[11px] text-[color:var(--lb-text)] shadow-[var(--lb-shadow-xs)]"
    >
      <MiniAvatar url={avatarUrl} />
      <span className="max-w-[10rem] truncate">{label}</span>
      <button
        type="button"
        className="ml-1 rounded-md p-0.5 hover:bg-[color:var(--lb-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--lb-primary-600)]"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        disabled={disabled}
      >
        ×
      </button>
    </span>
  );
}

function Avatar({ url, name }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name ?? "User"} avatar`}
        className="h-8 w-8 rounded-full object-cover border border-[color:var(--lb-border)]"
        loading="lazy"
      />
    );
  }
  return (
    <div
      className="h-8 w-8 rounded-full bg-gradient-to-br from-[color:var(--lb-bg)] to-[color:var(--lb-surface)] border border-[color:var(--lb-border)] flex items-center justify-center text-[color:var(--lb-muted)]"
      aria-hidden="true"
    >
      <span className="text-sm">👤</span>
    </div>
  );
}

function MiniAvatar({ url }) {
  return url ? (
    <img
      src={url}
      alt=""
      className="h-4 w-4 rounded-full object-cover border border-[color:var(--lb-border)]"
      loading="lazy"
    />
  ) : (
    <span
      className="h-4 w-4 rounded-full bg-[color:var(--lb-bg)] border border-[color:var(--lb-border)] inline-block"
      aria-hidden="true"
    />
  );
}
