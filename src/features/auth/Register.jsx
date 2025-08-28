import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common";
import { Input, Select, Switch } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { useForm } from "react-hook-form";
import { registerThunk, resetRegisterState } from "@/store/registerSlice";

const ROLES = [
  { label: "Partner", value: "partner" },
  { label: "Lawyer", value: "lawyer" },
  { label: "Associate", value: "associate" },
  { label: "Intern", value: "intern" },
  { label: "Admin", value: "admin" },
];

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // guard to avoid crashes if reducer not mounted yet
  const slice = useSelector((s) => s.register) ?? { status: "idle", error: null };
  const { status, error } = slice;

  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "lawyer",
      terms: false,
    },
  });

  useEffect(() => {
    if (status === "succeeded") {
      alert("Welcome, new lawyer! 🎉 Your account was created successfully.");
      navigate("/login", { replace: true });
      dispatch(resetRegisterState());
    }
  }, [status, navigate, dispatch]);

  useEffect(() => {
    if (status === "failed" && error) {
      form.setError("email", { message: error });
    }
  }, [status, error, form]);

  const onSubmit = async (values) => {
    if (!values.terms) {
      form.setError("terms", { message: "You must accept the terms." });
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        registerThunk({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role, // backend expects lowercase
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6">Create your account</h2>

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FormField name="name" label="Full name" required>
            {({ id, describedBy, error }) => (
              <Input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="Jane Attorney"
                {...form.register("name", { required: "Name is required" })}
              />
            )}
          </FormField>

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

          <FormField
            name="password"
            label="Password"
            required
            help="At least 8 characters."
          >
            {({ id, describedBy, error }) => (
              <Input
                id={id}
                type="password"
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="••••••••"
                {...form.register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
              />
            )}
          </FormField>

          <FormField name="role" label="Role">
            {({ id }) => (
              <Select
                id={id}
                value={form.watch("role")}
                onChange={(e) => form.setValue("role", e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField
            name="terms"
            label={
              <span className="text-sm">
                I agree to the <a className="underline" href="/legal/terms">Terms</a> and{" "}
                <a className="underline" href="/legal/privacy">Privacy Policy</a>.
              </span>
            }
          >
            {() => (
              <Switch
                checked={!!form.watch("terms")}
                onChange={(v) => form.setValue("terms", !!v, { shouldValidate: true })}
                aria-invalid={!!form.formState.errors?.terms}
              />
            )}
          </FormField>

          <Button type="submit" loading={submitting || status === "loading"} fullWidth>
            {status === "loading" ? "Creating…" : "Create account"}
          </Button>
        </Form>

        <p className="mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
