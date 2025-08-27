import React, { useId } from "react";
import { useFormContext } from "react-hook-form";
import FormLabel from "./FormLabel";
import FormHelp from "./FormHelp";
import FormError from "./FormError";

/**
 * Usage:
 *  <FormField name="email" label="Email">
 *    {({ id, describedBy, error }) => (
 *      <Input id={id} aria-describedby={describedBy} aria-invalid={!!error} {...form.register("email")} />
 *    )}
 *  </FormField>
 */
export default function FormField({ name, label, help, required, children, className }) {
  const { formState: { errors } } = useFormContext();
  const id = useId();
  const errMsg = errors?.[name]?.message;
  const describedBy = [help ? `${id}-help` : null, errMsg ? `${id}-err` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={className ?? "lb-field"}>
      {label && <FormLabel htmlFor={id} required={required}>{label}</FormLabel>}
      {children({ id, describedBy, error: errMsg })}
      {!errMsg && help && <FormHelp id={`${id}-help`}>{help}</FormHelp>}
      <FormError id={`${id}-err`}>{errMsg}</FormError>
    </div>
  );
}
