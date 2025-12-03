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

  // in Login.jsx
return (
  <div
    className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
    style={{ backgroundImage: `url(${lawyer})` }}
  >
    {/* Elegant dark legal-style gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/40 backdrop-blur-[1px]" />

    {/* Login card */}
    <div className="relative z-10 w-full max-w-md rounded-2xl 
      bg-white/10 border border-white/20 shadow-2xl
      backdrop-blur-xl p-8 text-white"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Sign in</h2>
        <p className="mt-1 text-sm text-gray-200">
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
              className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300`}
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
              className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300`}
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
                className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300 pr-20`}
                {...form.register("password", {
                  required: "Password is required",
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[2.1rem] text-xs px-2 py-1 
                  rounded-md bg-white/20 hover:bg-white/30 text-gray-200"
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
              className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300`}
              defaultValue={preselectedRole || ""}
              {...form.register("role", { required: "Role is required" })}
            >
              <option value="" disabled className="text-gray-700">
                Select role
              </option>
              <option value="admin" className="text-black">Admin</option>
              <option value="partner" className="text-black">Partner</option>
              <option value="lawyer" className="text-black">Lawyer</option>
              <option value="associate" className="text-black">Associate</option>
              <option value="intern" className="text-black">Intern</option>
            </select>
          )}
        </FormField>

        {error && (
          <p className="text-red-300 text-sm" role="alert">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={submitting}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl 
          bg-indigo-600/80 hover:bg-indigo-600 
          text-white font-medium px-4 py-2 shadow-xl 
          shadow-black/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </motion.button>
      </Form>

      <p className="mt-4 text-sm text-gray-200">
        No account?{" "}
        <button
          type="button"
          className="font-medium text-indigo-300 hover:text-indigo-200 underline-offset-2 underline"
          onClick={() => setShowRegister(true)}
        >
          Create one
        </button>
      </p>

      {showRegister && (
        <Register isModal onClose={() => setShowRegister(false)} />
      )}
    </div>
  </div>
);


}     
