// Form.jsx
import React from "react";
import { FormProvider } from "react-hook-form";

export default function Form({ form, onSubmit, className, children }) {
  return (
    <FormProvider {...form}>
      <form
        className={
          className ??
          // Soft-UI defaults: comfy spacing, smooth transitions, good focus
          "space-y-6 antialiased text-gray-900"
        }
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
