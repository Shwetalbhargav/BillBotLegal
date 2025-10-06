// UserPicker.jsx (Soft-UI Refactor)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "../../utils/clsx";

/**
 * Props:
 *  - users: Array<{ id: string|number, name: string, email?: string, avatarUrl?: string }>
 *  - value: string|number | Array<string|number>  (controlled)
 *  - defaultValue: same shape as value (uncontrolled)
 *  - multiple?: boolean (default false)
 *  - placeholder?: string
 *  - disabled?: boolean
 *  - onChange?: (nextValue) => void
 *  - className?: string
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

  // Normalize selected ids to a Set for quick lookup
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
  const menuRef = useRef(null);
  const wrapperRef = useRef(null);

  // Filtered list
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

  // Close on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commitChange(Array.from(next));
    } else {
      commitChange(id);
      setOpen(false);
    }
  };

  const clearSelection = () => {
    commitChange(multiple ? [] : null);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
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
    return Array.isArray(selected) ? selected.map((id) => map.get(id)).filter(Boolean) : [];
  }, [multiple, selected, users]);

  return (
    <div ref={wrapperRef} className={clsx("w-full", className)}>
      {/* Input/Trigger */}
      <div
        className={clsx(
          "relative rounded-2xl border border-gray-200/70 bg-white/90 backdrop-blur-sm",
          "shadow-sm focus-within:ring-2 focus-within:ring-indigo-400/60",
          disabled && "opacity-60 cursor-not-allowed"
        )}
      >
        {/* Chips for multi-select */}
        {multiple && chipUsers.length > 0 && (
          <div className="px-3 pt-2 flex flex-wrap gap-2">
            {chipUsers.map((u) => (
              <Chip
                key={u.id}
                onRemove={() => toggleUser(u.id)}
                label={u.name}
                avatarUrl={u.avatarUrl}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-2.5">
          <svg
            className="h-5 w-5 text-gray-400 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12.9 14.32a8 8 0 111.414-1.414l3.387 3.387a1 1 0 01-1.414 1.414L12.9 14.32zM8 14a6 6 0 100-12 6 6 0 000 12z" />
          </svg>

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
              "text-gray-900 placeholder:text-gray-400"
            )}
            aria-expanded={open}
            aria-controls="userpicker-listbox"
            aria-autocomplete="list"
            role="combobox"
          />

          {/* Clear / Chevron */}
          {(multiple ? chipUsers.length > 0 : selectedSet.size > 0) ? (
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
              aria-label="Clear selection"
              disabled={disabled}
            >
              ×
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => !disabled && setOpen((v) => !v)}
            className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
            aria-label={open ? "Close" : "Open"}
            disabled={disabled}
          >
            <svg className={clsx("h-4 w-4 transition-transform", open && "rotate-180")} viewBox="0 0 20 20" fill="currentColor">
              <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={menuRef}
          id="userpicker-listbox"
          role="listbox"
          className={clsx(
            "absolute z-50 mt-2 w-full rounded-2xl border border-gray-200/70 bg-white shadow-lg",
            "max-h-72 overflow-auto p-1"
          )}
        >
          {items.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No users found.</div>
          ) : (
            items.map((u, i) => {
              const selected = selectedSet.has(u.id);
              const active = i === activeIndex;

              return (
                <div
                  key={u.id}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => e.preventDefault()} // keep input focus
                  onClick={() => toggleUser(u.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer",
                    active ? "bg-gray-100" : "hover:bg-gray-50",
                    selected && "ring-1 ring-indigo-400/60"
                  )}
                >
                  <Avatar url={u.avatarUrl} name={u.name} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {u.name}
                    </div>
                    {u.email && (
                      <div className="text-xs text-gray-500 truncate">{u.email}</div>
                    )}
                  </div>

                  {selected && (
                    <span className="ml-auto text-indigo-600" aria-hidden="true">
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
      className="
        inline-flex items-center gap-1.5 rounded-xl border border-gray-200/70 bg-gray-50
        px-2 py-1 text-xs text-gray-700 shadow-sm
      "
    >
      <MiniAvatar url={avatarUrl} />
      <span className="max-w-[12rem] truncate">{label}</span>
      <button
        type="button"
        className="ml-1 rounded-md p-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
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
        className="h-8 w-8 rounded-full object-cover border border-gray-200"
        loading="lazy"
        width={32}
        height={32}
      />
    );
  }
  return (
    <div
      className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-500"
      aria-hidden="true"
      title="No avatar"
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
      className="h-4 w-4 rounded-full object-cover border border-gray-200"
      loading="lazy"
      width={16}
      height={16}
    />
  ) : (
    <span className="h-4 w-4 rounded-full bg-gray-300 inline-block" aria-hidden="true" />
  );
}
