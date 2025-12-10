// src/components/form/DateTimePicker.jsx
import React from "react";
import DatePicker from "./DatePicker";

/**
 * Soft-UI DateTimePicker – just DatePicker with time enabled.
 */
export default function DateTimePicker({ inputClassName, ...props }) {
  return (
    <DatePicker
      {...props}
      withTime
      inputClassName={inputClassName}
    />
  );
}
