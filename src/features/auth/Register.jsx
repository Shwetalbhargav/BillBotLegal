// src/features/auth/Register.jsx
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

import { Input, Select, Switch } from "@/components/form";
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

  const Wrapper = ({ children }) =>
    isModal ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-2xl mx-4">{children}</div>
      </div>
    ) : (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    );

  return (
    <Wrapper>
      <div className="relative z-50 rounded-2xl bg-white shadow-2xl p-6 md:p-8">
        {/* close button when used as modal */}
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        )}

        <div className="flex items-center gap-2 mb-6">
          <FiUserPlus className="text-xl" />
          <h2 className="text-xl font-semibold">Create your account</h2>
        </div>

        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <FormField
            name="name"
            label={
              <span className="inline-flex items-center gap-2">
                <FiUser /> Full name
              </span>
            }
            required
          >
            {({ id, describedBy, error }) => (
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={!!error}
                  placeholder="Jane Attorney"
                  className="pl-10"
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
                <span className="inline-flex items-center gap-2">
                  <FiMail /> Email
                </span>
              }
              required
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id={id}
                    type="email"
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="you@firm.com"
                    className="pl-10"
                    {...form.register("email", { required: "Email is required" })}
                  />
                </div>
              )}
            </FormField>

            {/* Password */}
            <FormField
              name="password"
              label={
                <span className="inline-flex items-center gap-2">
                  <FiLock /> Password
                </span>
              }
              required
              help="At least 8 characters."
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id={id}
                    type="password"
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="••••••••"
                    className="pl-10"
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

            {/* Firm ID */}
            <FormField name="firmId" label="Firm ID (optional)">
              {({ id, describedBy }) => (
                <Input
                  id={id}
                  aria-describedby={describedBy}
                  placeholder="645af3…"
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
                <span className="inline-flex items-center gap-2">
                  <FiPhone /> Mobile
                </span>
              }
              required
            >
              {({ id, describedBy, error }) => (
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    aria-invalid={!!error}
                    placeholder="+1 555 0100"
                    className="pl-10"
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
                <span className="inline-flex items-center gap-2">
                  <FiHome /> Address
                </span>
              }
            >
              {({ id, describedBy }) => (
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <Input
                    id={id}
                    aria-describedby={describedBy}
                    placeholder="221B Baker Street"
                    className="pl-10"
                    {...form.register("address")}
                  />
                </div>
              )}
            </FormField>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <label className="text-sm font-medium inline-flex items-center gap-2">
              <FiBookOpen /> Qualifications
            </label>
            <div className="space-y-3">
              {fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3"
                >
                  <div className="md:col-span-5">
                    <Input
                      placeholder="Degree (LLB, JD, LLM)"
                      {...form.register(`qualifications.${idx}.degree`)}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <Input
                      placeholder="University"
                      {...form.register(`qualifications.${idx}.university`)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      type="number"
                      placeholder="Year"
                      {...form.register(`qualifications.${idx}.year`)}
                    />
                  </div>
                  <div className="md:col-span-12 flex justify-end">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => remove(idx)}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <FiTrash2 /> Remove
                    </motion.button>
                  </div>
                </div>
              ))}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  append({ degree: "", university: "", year: "" })
                }
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
              >
                <FiPlus /> Add another qualification
              </motion.button>
            </div>
          </div>

          <FormField
            name="terms"
            label={
              <span className="text-sm">
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
            <p className="text-sm text-red-600" role="alert">
              {typeof error === "string" ? error : "Registration failed"}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={submitting || status === "loading"}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium px-4 py-2 shadow-lg shadow-indigo-900/20 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <FiUserPlus />{" "}
            {status === "loading" || submitting ? "Creating…" : "Create account"}
          </motion.button>
        </Form>

        {!isModal && (
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </Wrapper>
  );
}
