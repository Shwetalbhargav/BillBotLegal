// DateTimePicker.jsx
import React from "react";
import DatePicker from "./DatePicker";

/**
 * Soft-UI wrapper for DatePicker with time selection enabled.
 * Adds rounded corners, subtle shadow, and accessible focus rings.
 *
 * Props:
 *  - className: merges with Soft-UI input styles
 *  - popoverClassName: optional, merged for calendar popover (if supported by DatePicker)
 *  - ...props: forwarded to DatePicker
 */
export default function DateTimePicker({
  className,
  popoverClassName,
  ...props
}) {
  const softInput =
    "w-full rounded-2xl border border-gray-200/70 bg-white/90 " +
    "backdrop-blur-sm shadow-sm px-3 py-2.5 text-gray-900 " +
    "placeholder:text-gray-400 transition " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-400/60";

  const softPopover =
    "rounded-2xl border border-gray-200/70 bg-white shadow-lg p-2";

  return (
    <DatePicker
      {...props}
      withTime
      className={`${softInput} ${className ?? ""}`}
      // If your DatePicker exposes popover/panel class prop, this will apply Soft-UI there as well.
      popoverClassName={`${softPopover} ${popoverClassName ?? ""}`}
    />
  );
}
