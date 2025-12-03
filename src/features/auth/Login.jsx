// ===== src/features/auth/Login.jsx =====
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import lawyer from "@/assets/lawyer.jpg";
import { loginUserThunk } from "@/store/authSlice";
import Register from "./Register";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showRegister, setShowRegister] = useState(false);

  const [search] = useSearchParams();
  const preselectedRole = (search.get("role") || "").toLowerCase();

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      mobile: "",
      password: "",
      role: preselectedRole,
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await dispatch(loginUserThunk(values)).unwrap();
      const role = user?.role;
      if (role === "admin") navigate("/pages/AdminDashboard");
      else if (role === "partner") navigate("/partner/dashboard");
      else if (role === "lawyer") navigate("/lawyer/dashboard");
      else if (role === "associate") navigate("/associate/dashboard");
      else if (role === "intern") navigate("/intern/dashboard");
      else navigate("/dashboard");
    } catch (e) {
      setError(e?.message || "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBaseClasses =
    "block w-full mt-1 rounded-lg border border-slate-300 bg-slate-50 " +
    "px-3 py-2 text-slate-900 placeholder:text-slate-400 " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${lawyer})` }}
    >
      {/* dark overlay UNDER content and non-interactive */}
      <div className="pointer-events-none absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* left hero text */}
          <div className="max-w-xl text-white text-center md:text-left drop-shadow-lg">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Log every billable minute
            </h1>
            <p className="mt-3 text-base md:text-xl text-white/90">
              Email time tracking + GPT summaries + one-click push to Clio.
            </p>
          </div>

          {/* sign-in card */}
          <div className="relative z-20 w-full max-w-md bg-white/95 backdrop-blur-sm border border-slate-200 shadow-2xl rounded-2xl p-8 text-slate-900 pointer-events-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your details to access your dashboard.
              </p>
            </div>

            <Form form={form} onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <FormField name="name" label="Full name" required>
                {({ id, describedBy, error }) => (
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="Jane Attorney"
                    className={inputBaseClasses}
                    {...form.register("name", { required: "Name is required" })}
                  />
                )}
              </FormField>

              {/* Mobile */}
              <FormField name="mobile" label="Mobile number" required>
                {({ id, describedBy, error }) => (
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="+1 555 0100"
                    className={inputBaseClasses}
                    {...form.register("mobile", {
                      required: "Mobile is required",
                      minLength: { value: 7, message: "Too short" },
                    })}
                  />
                )}
              </FormField>

              {/* Password */}
              <FormField name="password" label="Password" required>
                {({ id, describedBy, error }) => (
                  <div className="relative">
                    <input
                      id={id}
                      type={showPassword ? "text" : "password"}
                      aria-describedby={describedBy}
                      aria-invalid={!!error}
                      placeholder="••••••••"
                      className={`${inputBaseClasses} pr-20`}
                      {...form.register("password", {
                        required: "Password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-[2.1rem] text-xs px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400/70"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                )}
              </FormField>

              {/* Role */}
              <FormField name="role" label="Role" required>
                {({ id, describedBy, error }) => (
                  <select
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    className={inputBaseClasses}
                    defaultValue={preselectedRole || ""}
                    {...form.register("role", { required: "Role is required" })}
                  >
                    <option value="" disabled>
                      Select role
                    </option>
                    <option value="admin">Admin</option>
                    <option value="partner">Partner</option>
                    <option value="lawyer">Lawyer</option>
                    <option value="associate">Associate</option>
                    <option value="intern">Intern</option>
                  </select>
                )}
              </FormField>

              {error && (
                <p className="text-red-600 text-sm" role="alert">
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium px-4 py-2 shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Signing in…" : "Sign in"}
              </motion.button>
            </Form>

            <p className="mt-4 text-sm text-slate-600">
              No account?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-2 underline"
                onClick={() => setShowRegister(true)}
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Register modal */}
      {showRegister && (
        <Register isModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  );
}
