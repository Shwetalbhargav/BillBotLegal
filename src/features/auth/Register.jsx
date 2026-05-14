import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiHome,
  FiBookOpen,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";

import { Switch } from "@/components/form";
import Form from "@/components/form/Form";
import FormField from "@/components/form/FormField";
import { registerThunk, resetRegisterState } from "@/store/registerSlice";

const ROLES = [
  { label: "Partner", value: "partner" },
  { label: "Lawyer", value: "lawyer" },
  { label: "Associate", value: "associate" },
  { label: "Intern", value: "intern" },
  { label: "Admin", value: "admin" },
];

export default function Register({ isModal = false, onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const slice = useSelector((s) => s.register) ?? {
    status: "idle",
    error: null,
  };
  const { status, error } = slice;

  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "lawyer",
      mobile: "",
      address: "",
      firmId: "",
      qualifications: [{ degree: "", university: "", year: "" }],
      terms: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "qualifications",
  });

  useEffect(() => {
    if (status === "succeeded") {
      alert("Your account was created successfully.");
      if (isModal && onClose) onClose();
      else navigate("/login", { replace: true });
      dispatch(resetRegisterState());
    }
  }, [status, navigate, dispatch, isModal, onClose]);

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
      const quals = (values.qualifications || []).map((q) => ({
        degree: q.degree || undefined,
        university: q.university || undefined,
        year: q.year ? Number(q.year) : undefined,
      }));

      await dispatch(
        registerThunk({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          firmId: values.firmId || undefined,
          mobile: values.mobile || undefined,
          address: values.address || undefined,
          qualifications: quals,
        })
      ).unwrap();
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
            label={
              <span className={`inline-flex items-center gap-2 ${labelMuted}`}>
                <FiUser /> Full name
              </span>
            }
            required
          >
            {({ id, describedBy, error }) => (
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!error}
                  placeholder="Jane Attorney"
                  className={`${inputBaseClasses} pl-10`}
                  {...form.register("name", { required: "Name is required" })}
                />
              </div>
            )}
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <FormField
              name="email"
              label={
                <span className={`inline-flex items-center gap-2 ${labelMuted}`}>
                  <FiMail /> Email
                </span>
              }
              required
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id={id}
                    type="email"
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="you@firm.com"
                    className={`${inputBaseClasses} pl-10`}
                    {...form.register("email", { required: "Email is required" })}
                  />
                </div>
              )}
            </FormField>

            {/* Password */}
            <FormField
              name="password"
              label={
                <span className={`inline-flex items-center gap-2 ${labelMuted}`}>
                  <FiLock /> Password
                </span>
              }
              required
              help="At least 8 characters."
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id={id}
                    type="password"
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="........"
                    className={`${inputBaseClasses} pl-10`}
                    {...form.register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" },
                    })}
                  />
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

            {/* Firm ID */}
            <FormField
              name="firmId"
              label={<span className={labelMuted}>Firm ID (optional)</span>}
            >
              {({ id, describedBy }) => (
                <input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="645af3..."
                  className={inputBaseClasses}
                  {...form.register("firmId")}
                />
              )}
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile */}
            <FormField
              name="mobile"
              label={
                <span className={`inline-flex items-center gap-2 ${labelMuted}`}>
                  <FiPhone /> Mobile
                </span>
              }
              required
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="+1 555 0100"
                    className={`${inputBaseClasses} pl-10`}
                    {...form.register("mobile", {
                      required: "Mobile is required",
                      minLength: { value: 7, message: "Too short" },
                    })}
                  />
                </div>
              )}
            </FormField>

            {/* Address */}
            <FormField
              name="address"
              label={
                <span className={`inline-flex items-center gap-2 ${labelMuted}`}>
                  <FiHome /> Address
                </span>
              }
            >
              {({ id, describedBy }) => (
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id={id}
                    aria-describedby={describedBy}
                    placeholder="221B Baker Street"
                    className={`${inputBaseClasses} pl-10`}
                    {...form.register("address")}
                  />
                </div>
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

          {error && (
            <p
              className={`text-sm ${
                isModal ? "text-red-300" : "text-red-600"
              }`}
              role="alert"
            >
              {typeof error === "string" ? error : "Registration failed"}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={submitting || status === "loading"}
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
