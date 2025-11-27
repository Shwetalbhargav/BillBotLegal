// src/components/firm/CreateFirmModal.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createFirmThunk, clearFirmError } from "../../store/firmSlice";

// nice background / hero image
import loginPageImg from "../../assets/Loginpage.png";

export default function CreateFirmModal() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.firm || {});
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    tagline: "",
    website: "",
    primaryContact: "",
  });

  // Listen to the custom event fired from the dropdown
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-create-firm-modal", handler);
    return () => window.removeEventListener("open-create-firm-modal", handler);
  }, []);

  const close = () => {
    setOpen(false);
    dispatch(clearFirmError());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(createFirmThunk(form));
    if (createFirmThunk.fulfilled.match(resultAction)) {
      // reset and close on success
      setForm({
        name: "",
        tagline: "",
        website: "",
        primaryContact: "",
      });
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative flex w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Image side */}
        <div className="hidden w-1/3 bg-gray-900/90 text-white md:flex md:flex-col">
          <img
            src={loginPageImg}
            alt=""
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Form side */}
        <div className="w-full p-6 md:w-2/3 md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Create a new firm
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Set up a firm profile so time entries, rate cards, and invoices
                stay properly separated.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">
                Firm name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                placeholder="e.g. Smith & Partners LLP"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">
                Tagline (optional)
              </label>
              <input
                type="text"
                name="tagline"
                value={form.tagline}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                placeholder="e.g. Litigation & Commercial Disputes"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Website (optional)
                </label>
                <input
                  type="url"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  placeholder="https://"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Primary contact (optional)
                </label>
                <input
                  type="text"
                  name="primaryContact"
                  value={form.primaryContact}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                  placeholder="e.g. Jane Smith"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600">
                {typeof error === "string" ? error : "Could not create firm."}
              </p>
            )}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-2xl px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-2xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create firm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
