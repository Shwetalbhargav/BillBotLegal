// ===== src/features/auth/Login.jsx =====
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import { Input } from "@/components/form";
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

  return (
    <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${lawyer})` }}
    >
      {/* dark overlay UNDER content and non-interactive */}
      <div className="pointer-events-none absolute inset-0 bg-black/50 z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          {/* left hero text */}
          <div className="max-w-xl text-white text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight drop-shadow-lg">
              Log every billable minute
            </h1>
            <p className="mt-3 text-base md:text-xl text-white/90 drop-shadow">
              Email time tracking + GPT summaries + one-click push to Clio.
            </p>
          </div>

          {/* sign-in card */}
          <div className="relative z-20 w-full max-w-md bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-8 text-white pointer-events-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Sign in</h2>
            </div>

            <Form form={form} onSubmit={onSubmit} className="space-y-4">
              <FormField name="name"  required>
                {({ id, describedBy, error }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="Full name"
                    className="bg-white/10 border-white/30 text-black placeholder-white/70"
                    {...form.register("name", { required: "Name is required" })}
                  />
                )}
              </FormField>

              <FormField name="mobile"  required>
                {({ id, describedBy, error }) => (
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="Mobile number"
                    className="bg-white/10 border-white/30 text-black placeholder-white/70"
                    {...form.register("mobile", {
                      required: "Mobile is required",
                      minLength: { value: 7, message: "Too short" },
                    })}
                  />
                )}
              </FormField>

              <FormField name="password"  required>
                {({ id, describedBy, error }) => (
                  <div className="relative">
                    <Input
                      id={id}
                      type={showPassword ? "text" : "password"}
                      aria-describedby={describedBy}
                      aria-invalid={!!error}
                      placeholder="Password"
                      className="pr-20 bg-white/10 border-white/30 text-black placeholder-white/70"
                      {...form.register("password", {
                        required: "Password is required",
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                )}
              </FormField>

              <FormField name="role"  required>
                {({ id, describedBy, error }) => (
                  <select
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    className="w-full rounded-md bg-white/10 border border-white/30 text-white py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50"
                    defaultValue={preselectedRole || ""}
                    {...form.register("role", { required: "Role is required" })}
                  >
                    <option className="bg-slate-900 text-white" value="" disabled>
                      Select role
                    </option>
                    <option className="bg-slate-900 text-white" value="admin">
                      Admin
                    </option>
                    <option className="bg-slate-900 text-white" value="partner">
                      Partner
                    </option>
                    <option className="bg-slate-900 text-white" value="lawyer">
                      Lawyer
                    </option>
                    <option className="bg-slate-900 text-white" value="associate">
                      Associate
                    </option>
                    <option className="bg-slate-900 text-white" value="intern">
                      Intern
                    </option>
                  </select>
                )}
              </FormField>

              {error && <p className="text-red-300 text-sm">{error}</p>}

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

            <p className="mt-4 text-sm text-white/90">
              No account?{" "}
              <button
                type="button"
                className="underline"
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
