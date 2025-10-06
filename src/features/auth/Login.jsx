// ===== src/pages/auth/Login.jsx =====
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiUser, FiPhone, FiLock, FiLogIn, FiShield } from "react-icons/fi";

// Local UI components
import { Input } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import lawyer from "@/assets/lawyer.jpg";
import { loginUserThunk } from "@/store/authSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form = useForm({
    mode: "onBlur",
    defaultValues: { name: "", mobile: "", password: "", role: "lawyer" },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      // Backend requires { name, mobile, password, role }
      // authController enforces all four fields
      const { user } = await dispatch(loginUserThunk(values)).unwrap();
      const role = user?.role;
      if (role === "admin") navigate("/pages/AdminDashboard"); // ✅ updated redirect
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
      {/* overlay for contrast */}
      <div className="absolute inset-0 bg-black/50" />

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

          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-6">
              <FiLogIn className="text-2xl" />
              <h2 className="text-xl font-semibold">Sign in</h2>
            </div>

            <Form form={form} onSubmit={onSubmit} className="space-y-4">
              {/* Name */}
              <FormField name="name" label="Full name" required>
                {({ id, describedBy, error }) => (
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={!!error}
                      placeholder="Jane Attorney"
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder-white/70"
                      {...form.register("name", { required: "Name is required" })}
                    />
                  </div>
                )}
              </FormField>

              {/* Mobile */}
              <FormField name="mobile" label="Mobile number" required>
                {({ id, describedBy, error }) => (
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
                    <Input
                      id={id}
                      aria-describedby={describedBy}
                      aria-invalid={!!error}
                      placeholder="+1 555 0100"
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder-white/70"
                      {...form.register("mobile", {
                        required: "Mobile is required",
                        minLength: { value: 7, message: "Too short" },
                      })}
                    />
                  </div>
                )}
              </FormField>

              {/* Password */}
              <FormField name="password" label="Password" required>
                {({ id, describedBy, error }) => (
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80" />
                    <Input
                      id={id}
                      type="password"
                      aria-describedby={describedBy}
                      aria-invalid={!!error}
                      placeholder="••••••••"
                      className="pl-10 bg-white/10 border-white/30 text-white placeholder-white/70"
                      {...form.register("password", { required: "Password is required" })}
                    />
                  </div>
                )}
              </FormField>

              {/* Role */}
              <FormField name="role" label="Role" required>
                {({ id }) => (
                  <div className="relative">
                    <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-white/80 pointer-events-none" />
                    <select
                      id={id}
                      className="pl-10 w-full rounded-md bg-white/10 border border-white/30 text-white py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-white/50"
                      {...form.register("role", { required: "Role is required" })}
                    >
                      <option className="bg-slate-900 text-white" value="admin">Admin</option>
                      <option className="bg-slate-900 text-white" value="partner">Partner</option>
                      <option className="bg-slate-900 text-white" value="lawyer">Lawyer</option>
                      <option className="bg-slate-900 text-white" value="associate">Associate</option>
                      <option className="bg-slate-900 text-white" value="intern">Intern</option>
                    </select>
                  </div>
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
                <FiLogIn /> {submitting ? "Signing in…" : "Sign in"}
              </motion.button>
            </Form>

            <p className="mt-4 text-sm text-white/90">
              No account? <Link to="/register" className="underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
