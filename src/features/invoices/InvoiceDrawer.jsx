import React, { useEffect } from "react";
import { Drawer, Button, Badge } from "@/components/common";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import FormGrid from "@/components/form/FormGrid";
import { Input, NumberInput, DatePicker, TextArea } from "@/components/forms";
import { useForm } from "react-hook-form";

export default function InvoiceDrawer({ open, invoice, onClose, onSave }) {
  const form = useForm({
    defaultValues: {
      clientName: "",
      periodStart: "",
      periodEnd: "",
      hours: 0,
      rate: 300,
      notes: "",
      status: "Draft",
    },
  });

  useEffect(() => {
    if (invoice) {
      form.reset({
        clientName: invoice.clientName || "",
        periodStart: invoice.periodStart ? invoice.periodStart.slice(0, 10) : "",
        periodEnd: invoice.periodEnd ? invoice.periodEnd.slice(0, 10) : "",
        hours: invoice.hours ?? 0,
        rate: invoice.rate ?? 300,
        notes: invoice.notes || "",
        status: invoice.status || "Draft",
      });
    }
  }, [invoice]);

  const amount = (Number(form.watch("hours")) || 0) * (Number(form.watch("rate")) || 0);

  return (
    <Drawer open={open} onClose={onClose} title="Invoice" side="right" width={560}>
      {!invoice ? null : (
        <Form
          form={form}
          onSubmit={(values)=>onSave?.({ ...(invoice?.id ? { id: invoice.id } : {}), ...values, amount })}
          className="space-y-6"
        >
          <FormGrid variant="two">
            <FormField name="clientName" label="Client" required>
              {({ id, describedBy, error }) => (
                <Input id={id} aria-describedby={describedBy} aria-invalid={!!error}
                  placeholder="Client name" {...form.register("clientName", { required: "Required" })} />
              )}
            </FormField>

            <FormField name="hours" label="Hours">
              {() => (
                <NumberInput step={0.1} precision={1} min={0}
                  value={form.watch("hours")}
                  onChange={(e)=>form.setValue("hours", Number(e.target.value))}
                />
              )}
            </FormField>

            <FormField name="rate" label="Rate ($/hr)">
              {() => (
                <NumberInput step={25} precision={0} min={0}
                  value={form.watch("rate")}
                  onChange={(e)=>form.setValue("rate", Number(e.target.value))}
                />
              )}
            </FormField>

            <FormField name="periodStart" label="Period start">
              {({ id, describedBy }) => (
                <DatePicker id={id} aria-describedby={describedBy}
                  value={form.watch("periodStart")} onChange={(v)=>form.setValue("periodStart", v)} />
              )}
            </FormField>

            <FormField name="periodEnd" label="Period end">
              {({ id, describedBy }) => (
                <DatePicker id={id} aria-describedby={describedBy}
                  value={form.watch("periodEnd")} onChange={(v)=>form.setValue("periodEnd", v)} />
              )}
            </FormField>
          </FormGrid>

          <FormField name="notes" label="Notes">
            {({ id, describedBy }) => (
              <TextArea id={id} aria-describedby={describedBy} rows={4} {...form.register("notes")} />
            )}
          </FormField>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm">
              <span className="text-[color:var(--lb-muted)] mr-2">Amount</span>
              <span className="font-semibold">${amount.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>Close</Button>
              <Button type="submit">Save</Button>
            </div>
          </div>
        </Form>
      )}
    </Drawer>
  );
}
