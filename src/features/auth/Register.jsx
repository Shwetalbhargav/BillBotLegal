import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiBookOpen,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, XCircle } from "lucide-react";

import { Switch } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { registerThunk, resetRegisterState } from "@/store/registerSlice";

const ROLES = [
  { label: "Partner", value: "partner" },
  { label: "Lawyer", value: "lawyer" },
  { label: "Associate", value: "associate" },
  { label: "Intern", value: "intern" },
];

export default function Register({ isModal = false, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const slice = useSelector((s) => s.register) ?? {
    status: "idle",
    error: null,
  };
  const { status } = slice;

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "lawyer",
      mobile: "",
      address: "",
      firmName: "",
      qualifications: [{ degree: "", university: "", year: "" }],
      terms: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  const onSubmit = async (values) => {
    if (!values.terms) {
      form.setError("terms", { message: "You must accept the terms." });
      setFeedback({ type: "error", message: "You must accept the terms before registering." });
      return;
    }
    setSubmitting(true);
    setFeedback({ type: "loading", message: "Registering your account..." });
    try {
      const quals = (values.qualifications || [])
        .map((q) => ({
          degree: q.degree?.trim() || undefined,
          university: q.university?.trim() || undefined,
          year: q.year ? Number(q.year) : undefined,
        }))
        .filter((q) => q.degree || q.university || q.year);

      await dispatch(
        registerThunk({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          firmName: values.firmName?.trim() || undefined,
          mobile: values.mobile || undefined,
          address: values.address?.trim() || undefined,
          qualifications: quals.length ? quals : undefined,
        })
      ).unwrap();
      setFeedback({ type: "success", message: "Registration successful. Redirecting to sign in..." });
      window.setTimeout(() => {
        if (isModal && onClose) onClose();
        else navigate("/login", { replace: true });
        dispatch(resetRegisterState());
      }, 1200);
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message || "Registration failed";
      setFeedback({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- styling helpers ----------
  const commonInput =
    "block w-full min-w-0 rounded-md border px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

  const lightInput =
    "border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400";

  // darker grey glass background in modal
  const darkInput =
    "border-white/20 bg-slate-900 text-white placeholder:text-slate-400";

  const inputBaseClasses = `${commonInput} ${isModal ? darkInput : lightInput}`;

  const headingColor = isModal ? "text-white" : "text-slate-900";
  const subheadingColor = isModal ? "text-gray-200" : "text-slate-500";
  const labelMuted = isModal ? "text-gray-100" : "text-slate-800";
  const footerText = isModal ? "text-gray-200" : "text-slate-600";

  const cardClasses = isModal
    ? "relative z-50 rounded-xl " +
      "bg-slate-950/95 border border-white/15 shadow-2xl p-5 sm:p-6 text-white"
    : "relative z-50 rounded-xl bg-white border border-slate-200 " +
      "shadow-2xl p-6 md:p-8 text-slate-900";

  const Wrapper = ({ children }) =>
    isModal ? (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/85 px-4 py-6 sm:py-8 backdrop-blur-sm">
        <div className="w-full max-w-3xl">{children}</div>
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    );

  const nameField = form.register("name", {
    required: "Name is required",
    pattern: {
      value: /^[A-Za-z .'-]+$/,
      message: "Use letters, spaces, apostrophes, periods, or hyphens only",
    },
  });
  const emailField = form.register("email", {
    required: "Email is required",
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address with @",
    },
  });
  const mobileField = form.register("mobile", {
    required: "Mobile is required",
    minLength: { value: 10, message: "Enter a 10-digit mobile number" },
    maxLength: { value: 10, message: "Enter a 10-digit mobile number" },
    pattern: { value: /^\d{10}$/, message: "Enter numbers only" },
  });

  // ---------- render ----------
  return (
    <Wrapper>
      <div
        className={cardClasses}
        role={isModal ? "dialog" : undefined}
        aria-modal={isModal ? "true" : undefined}
        aria-labelledby={isModal ? "register-modal-title" : undefined}
      >
        {/* close button when used as modal */}
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-200 hover:text-white"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-2">
          <FiUserPlus className="text-xl text-indigo-400" />
          <h2
            id={isModal ? "register-modal-title" : undefined}
            className={`text-xl font-semibold ${headingColor}`}
          >
            Create your account
          </h2>
        </div>
        <p className={`mb-6 text-sm ${subheadingColor}`}>
          Set up your profile so we can start logging every billable minute.
        </p>

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <FormField
            name="name"
            label={<span className={labelMuted}>Full name</span>}
            required
          >
            {({ id, describedBy, error }) => (
              <input
                id={id}
                aria-describedby={describedBy}
                aria-invalid={!!error}
                placeholder="Jane Attorney"
                className={inputBaseClasses}
                {...nameField}
                onChange={(event) => {
                  event.target.value = event.target.value
                    .replace(/[^A-Za-z .'-]/g, "")
                    .replace(/\s{2,}/g, " ");
                  nameField.onChange(event);
                }}
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <FormField
              name="email"
              label={<span className={labelMuted}>Email</span>}
              required
            >
              {({ id, describedBy, error }) => (
                <input
                  id={id}
                  type="email"
                  aria-describedby={describedBy}
                  aria-invalid={!!error}
                  placeholder="you@firm.com"
                  className={inputBaseClasses}
                  {...emailField}
                />
              )}
            </FormField>

            {/* Password */}
            <FormField
              name="password"
              label={<span className={labelMuted}>Password</span>}
              required
              help="At least 8 characters."
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="Minimum 8 characters"
                    className={`${inputBaseClasses} pr-11`}
                    {...form.register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role */}
            <FormField
              name="role"
              label={<span className={labelMuted}>Role</span>}
            >
              {({ id }) => (
                <select
                  id={id}
                  value={form.watch("role")}
                  onChange={(e) => form.setValue("role", e.target.value)}
                  className={`${inputBaseClasses} ${
                    isModal ? "text-white" : "text-slate-900"
                  }`}
                >
                  {ROLES.map((r) => (
                    <option
                      key={r.value}
                      value={r.value}
                      className="text-black"
                    >
                      {r.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            {/* Firm Name */}
            <FormField
              name="firmName"
              label={<span className={labelMuted}>Firm name (optional)</span>}
            >
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="Firm name"
                  className={inputBaseClasses}
                  {...form.register("firmName")}
                />
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile */}
            <FormField
              name="mobile"
              label={<span className={labelMuted}>Mobile</span>}
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
                  className={inputBaseClasses}
                  {...mobileField}
                  onChange={(event) => {
                    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
                    mobileField.onChange(event);
                  }}
                />
              )}
            </FormField>

            {/* Address */}
            <FormField
              name="address"
              label={<span className={labelMuted}>Address</span>}
            >
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="Office address"
                  className={inputBaseClasses}
                  {...form.register("address")}
                />
              )}
            </FormField>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium inline-flex items-center gap-2 ${labelMuted}`}
            >
              <FiBookOpen /> Qualifications
            </label>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className={`grid grid-cols-1 gap-3 rounded-xl border p-3 ${
                    isModal
                      ? "border-white/10 bg-white/5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_6rem_auto]"
                      : "border-slate-200 bg-slate-50 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_6rem_auto]"
                  }`}
                >
                  <div className="min-w-0">
                    <input
                      placeholder="Degree (LLB, JD, LLM)"
                      className={inputBaseClasses}
                      {...form.register(`qualifications.${idx}.degree`)}
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      placeholder="University"
                      className={inputBaseClasses}
                      {...form.register(`qualifications.${idx}.university`)}
                    />
                  </div>
                  <div className="min-w-0">
                    <input
                      type="number"
                      placeholder="Year"
                      className={inputBaseClasses}
                      {...form.register(`qualifications.${idx}.year`)}
                    />
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => remove(idx)}
                    className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-md px-3 text-sm sm:w-auto ${
                      isModal
                        ? "bg-white/10 hover:bg-white/20 text-gray-100"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <FiTrash2 /> Remove
                  </motion.button>
                </div>
              ))}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  append({ degree: "", university: "", year: "" })
                }
                className={`inline-flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm sm:w-auto ${
                  isModal
                    ? "bg-indigo-500/80 hover:bg-indigo-400 text-white"
                    : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                }`}
              >
                <FiPlus /> Add another qualification
              </motion.button>
            </div>
          </div>

          {/* Terms */}
          <FormField
            name="terms"
            label={
              <span
                className={`text-sm ${
                  isModal ? "text-gray-100" : "text-slate-700"
                }`}
              >
                I agree to the{" "}
                <a className="underline" href="/legal/terms">
                  Terms
                </a>{" "}
                and{" "}
                <a className="underline" href="/legal/privacy">
                  Privacy Policy
                </a>
                .
              </span>
            }
          >
            {() => (
              <Switch
                checked={!!form.watch("terms")}
                onChange={(v) =>
                  form.setValue("terms", !!v, { shouldValidate: true })
                }
                aria-invalid={!!form.formState.errors?.terms}
              />
            )}
          </FormField>

          {feedback && (
            <motion.div
              key={`${feedback.type}-${feedback.message}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                feedback.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : feedback.type === "error"
                    ? "border-rose-300 bg-rose-50 text-rose-800"
                    : isModal
                      ? "border-white/15 bg-white/10 text-slate-100"
                      : "border-indigo-200 bg-indigo-50 text-indigo-800"
              }`}
              role={feedback.type === "error" ? "alert" : "status"}
            >
              <motion.span
                initial={{ rotate: -8, scale: 0.8 }}
                animate={{
                  rotate: feedback.type === "loading" ? 360 : 0,
                  scale: 1,
                }}
                transition={{
                  duration: feedback.type === "loading" ? 0.8 : 0.25,
                  repeat: feedback.type === "loading" ? Infinity : 0,
                  ease: "linear",
                }}
                className="inline-flex shrink-0"
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : feedback.type === "error" ? (
                  <XCircle size={20} />
                ) : (
                  <LoaderCircle size={20} />
                )}
              </motion.span>
              <span>{feedback.message}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={submitting || status === "loading" || feedback?.type === "success"}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium px-4 py-2 shadow-lg shadow-black/40 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <FiUserPlus />
            {status === "loading" || submitting ? "Creating..." : "Create account"}
          </motion.button>
        </Form>

        {!isModal && (
          <p className={`mt-4 text-sm ${footerText}`}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-700 underline"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </Wrapper>
  );
}
