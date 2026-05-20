// ===== src/features/auth/Login.jsx =====
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";

import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import lawyer from "@/assets/lawyer.jpg";
import { listFirmOptions } from "@/services/api";
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
      firmId: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [firms, setFirms] = useState([]);
  const [firmsLoading, setFirmsLoading] = useState(false);
  const [firmsError, setFirmsError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setFirmsLoading(true);
    listFirmOptions()
      .then(({ data }) => {
        if (cancelled) return;
        setFirms(Array.isArray(data?.data) ? data.data : []);
        setFirmsError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setFirmsError(err?.response?.data?.message || "Unable to load firms");
      })
      .finally(() => {
        if (!cancelled) setFirmsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

      const onSubmit = async (values) => {
      setSubmitting(true);
      setError(null);
      try {
        const { user } = await dispatch(loginUserThunk(values)).unwrap();

        // No need to branch on role here – /dashboard will redirect
        navigate("/dashboard", { replace: true });
      } catch (e) {
        setError(typeof e === "string" ? e : e?.message || "Invalid credentials");
      } finally {
        setSubmitting(false);
      }
    };


  const inputBaseClasses =
    "block w-full rounded-md border border-slate-300 bg-slate-50 " +
    "px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 " +
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
        <FormField
          name="name"
          label={<span className="text-gray-100">Full name</span>}
          required
        >
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
        <FormField
          name="mobile"
          label={<span className="text-gray-100">Mobile number</span>}
          required
        >
          {({ id, describedBy, error }) => (
            <input
              id={id}
              aria-describedby={describedBy}
              aria-invalid={!!error}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300`}
              {...form.register("mobile", {
                required: "Mobile is required",
                minLength: { value: 10, message: "Enter a 10-digit mobile number" },
                maxLength: { value: 10, message: "Enter a 10-digit mobile number" },
                pattern: { value: /^\d{10}$/, message: "Enter numbers only" },
              })}
              onChange={(event) => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                form.setValue("mobile", event.target.value, { shouldValidate: true });
              }}
            />
          )}
        </FormField>

        {/* Password */}
        <FormField
          name="password"
          label={<span className="text-gray-100">Password</span>}
          required
        >
          {({ id, describedBy, error }) => (
            <div className="relative">
              <input
                id={id}
                type={showPassword ? "text" : "password"}
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="........"
                className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300 pr-20`}
                {...form.register("password", {
                  required: "Password is required",
                })}
              />
              <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className={`absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md ${
                      isModal
                        ? "text-slate-200 hover:bg-white/10"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
            </div>
          )}
        </FormField>

        {/* Role */}
        <FormField
          name="role"
          label={<span className="text-gray-100">Role</span>}
          required
        >
          {({ id, describedBy, error }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={!!error}
              className={`${inputBaseClasses} bg-slate-900/80 border-white/30 text-white placeholder:text-gray-300`}
              defaultValue={preselectedRole || ""}
              {...form.register("role", { required: "Role is required" })}
            >
              <option value="" disabled className="bg-slate-900 text-white">
                Select role
              </option>
              <option value="admin" className="bg-slate-900 text-white">Admin</option>
              <option value="partner" className="bg-slate-900 text-white">Partner</option>
              <option value="lawyer" className="bg-slate-900 text-white">Lawyer</option>
              <option value="associate" className="bg-slate-900 text-white">Associate</option>
              <option value="intern" className="bg-slate-900 text-white">Intern</option>
            </select>
          )}
        </FormField>

        {/* Firm */}
        <FormField
          name="firmId"
          label={<span className="text-gray-100">Firm</span>}
          required
        >
          {({ id, describedBy, error }) => (
            <select
              id={id}
              aria-describedby={describedBy}
              aria-invalid={!!error}
              className={`${inputBaseClasses} bg-white/20 border-white/30 text-white placeholder:text-gray-300`}
              {...form.register("firmId", { required: "Firm is required" })}
            >
              <option value="" disabled className="bg-slate-900 text-white">
                {firmsLoading ? "Loading firms..." : "Select firm"}
              </option>
              {firms.map((firm) => (
                <option key={firm._id} value={firm._id} className="bg-slate-900 text-white">
                  {firm.name}
                </option>
              ))}
            </select>
          )}
        </FormField>

        {firmsError && (
          <p className="text-amber-200 text-sm" role="alert">
            {firmsError}
          </p>
        )}

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
          {submitting ? "Signing in..." : "Sign in"}
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
    </div>
    {showRegister && (
      <Register isModal onClose={() => setShowRegister(false)} />
    )}
  </div>
);


}     
