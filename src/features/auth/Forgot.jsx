import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, useToast } from "@/components/common";
import { Input } from "@/components/forms";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { useForm } from "react-hook-form";
// TODO: implement this in your API service
// export async function requestPasswordReset(email) { ... }
import { requestPasswordReset } from "@/services/api"; 

export default function Forgot() {
  const { addToast } = useToast();
  const form = useForm({ mode: "onBlur", defaultValues: { email: "" } });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async ({ email }) => {
    setSubmitting(true);
    try {
      // If you don't have an endpoint yet, temporarily skip and just show success UI.
      if (requestPasswordReset) {
        await requestPasswordReset(email);
      }
      setSent(true);
      addToast({ tone: "success", title: "Check your inbox", description: "We’ve sent a reset link if that email exists." });
    } catch (e) {
      // Don’t leak whether the account exists
      setSent(true);
      addToast({ tone: "success", title: "Check your inbox", description: "We’ve sent a reset link if that email exists." });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold mb-2">Check your email</h1>
          <p className="text-[color:var(--lb-muted)] text-sm">
            If an account exists for that address, you’ll get a link to reset your password.
          </p>
          <div className="mt-6">
            <Link className="underline" to="/login">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-2">Forgot your password?</h1>
        <p className="text-[color:var(--lb-muted)] text-sm mb-6">
          Enter the email you use to sign in. We’ll send you a reset link.
        </p>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField name="email" label="Email" required>
            {({ id, describedBy, error }) => (
              <Input
                id={id}
                type="email"
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="you@firm.com"
                {...form.register("email", { required: "Email is required" })}
              />
            )}
          </FormField>

          <Button type="submit" loading={submitting} fullWidth>
            Send reset link
          </Button>
        </Form>

        <p className="mt-4 text-sm">
          Remembered it? <Link to="/login" className="underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
