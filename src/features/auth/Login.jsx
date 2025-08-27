import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/common";
import { Input } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { useForm } from "react-hook-form";
import lawyer from "@/assets/lawyer.jpg";
import { loginUserThunk } from "@/store/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const form = useForm({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(loginUserThunk(values)).unwrap(); // stores token/role in slice/localStorage
      navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${lawyer})` }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-10">
          <div className="max-w-xl text-white text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight drop-shadow-lg">
              Log every billable minute
            </h1>
            <p className="mt-3 text-base md:text-xl text-white/90 drop-shadow">
              Email time tracking + GPT summaries + one-click push to Clio.
            </p>
          </div>

          <div className="w-full max-w-md bg-white/15 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-6 text-gray-900/90">
              Sign in
            </h2>

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

              <FormField name="password" label="Password" required>
                {({ id, describedBy, error }) => (
                  <Input
                    id={id}
                    type="password"
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="••••••••"
                    {...form.register("password", { required: "Password is required" })}
                  />
                )}
              </FormField>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <Button type="submit" loading={submitting} fullWidth>
                Sign in
              </Button>
            </Form>

            <p className="mt-4 text-sm text-white/90">
              No account?{" "}
              <Link to="/register" className="underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
