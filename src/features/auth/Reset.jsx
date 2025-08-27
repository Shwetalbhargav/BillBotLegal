import React, { useMemo, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button, useToast } from "@/components/common";
import { Input } from "@/components/forms";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { useForm } from "react-hook-form";
// TODO: implement in API service
// export async function resetPassword({ token, password }) { ... }
import { resetPassword } from "@/services/api";

export default function Reset() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = useMemo(() => new URLSearchParams(search).get("token"), [search]);
  const form = useForm({ mode: "onBlur", defaultValues: { password: "", confirm: "" } });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async ({ password, confirm }) => {
    if (password.length < 8) {
      form.setError("password", { message: "Password must be at least 8 characters." });
      return;
    }
    if (password !== confirm) {
      form.setError("confirm", { message: "Passwords do not match." });
      return;
    }
    setSubmitting(true);
    try {
      if (resetPassword && token) {
        await resetPassword({ token, password });
      }
      addToast({ tone: "success", title: "Password updated" });
      navigate("/login");
    } catch (e) {
      addToast({ tone: "danger", title: "Reset failed", description: "Your link may be invalid or expired." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-semibold mb-2">Reset link invalid</h1>
          <p className="text-[color:var(--lb-muted)] text-sm">
            Request a new password reset.
          </p>
          <div className="mt-6">
            <Link className="underline" to="/forgot-password">Go to Forgot Password</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Set a new password</h1>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField name="password" label="New password" required help="At least 8 characters.">
            {({ id, describedBy, error }) => (
              <Input
                id={id}
                type="password"
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="••••••••"
                {...form.register("password", { required: "Password is required", minLength: 8 })}
              />
            )}
          </FormField>

          <FormField name="confirm" label="Confirm password" required>
            {({ id, describedBy, error }) => (
              <Input
                id={id}
                type="password"
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="••••••••"
                {...form.register("confirm", { required: "Please confirm your password" })}
              />
            )}
          </FormField>

          <Button type="submit" loading={submitting} fullWidth>
            Update password
          </Button>
        </Form>

        <p className="mt-4 text-sm">
          Back to <Link to="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
