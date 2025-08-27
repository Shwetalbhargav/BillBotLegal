import React from "react";
import DatePicker from "./DatePicker";

/** Just wraps DatePicker with withTime=true */
export default function DateTimePicker(props) {
  return <DatePicker {...props} withTime />;
}
