// src/components/form/Form.jsx
import React from "react";
import { FormProvider } from "react-hook-form";

export default function Form({ form, onSubmit, className, children }) {
  return (
    <FormProvider {...form}>
      <form
        className={
          className ??
          "lb-reset space-y-6 text-[14px] text-[color:var(--lb-text)]"
        }
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
