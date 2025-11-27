// src/components/firm/FirmSwitchDropdown.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFirms, setSelectedFirmId } from "../../store/firmSlice";

// adjust the paths based on where this file lives
import logoImg from "../../assets/logo.png";
import courthouseImg from "../../assets/courthouse.png";

export default function FirmSwitchDropdown() {
  const dispatch = useDispatch();
  const { items: firms, selectedFirmId, loading } = useSelector(
    (state) => state.firm || {}
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // only fetch once if we don't have firms yet
    if (!firms || firms.length === 0) {
      dispatch(fetchFirms());
    }
  }, [dispatch, firms]);

  const selectedFirm =
    firms?.find((f) => f.id === selectedFirmId) || firms?.[0] || null;

  const handleSelect = (firmId) => {
    dispatch(setSelectedFirmId(firmId));
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200/70 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-white/100 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
      >
        <img
          src={selectedFirm?.logoUrl || logoImg}
          alt=""
          className="h-5 w-5 rounded-full object-cover border border-gray-200"
        />
        <span className="max-w-[140px] truncate">
          {loading
            ? "Loading firms..."
            : selectedFirm
            ? selectedFirm.name
            : "Select firm"}
        </span>
        <svg
          className="h-3.5 w-3.5 text-gray-400"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-60 origin-top-right rounded-2xl border border-gray-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 px-2 pt-2 pb-1 text-[11px] text-gray-500">
            <img
              src={courthouseImg}
              alt=""
              className="h-4 w-4 rounded-sm object-cover"
            />
            <span>Switch firm</span>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {firms?.map((firm) => (
              <button
                key={firm.id}
                type="button"
                onClick={() => handleSelect(firm.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs ${
                  firm.id === selectedFirmId
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <img
                  src={firm.logoUrl || logoImg}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <div className="truncate font-medium">{firm.name}</div>
                  {firm.tagline && (
                    <div className="truncate text-[11px] text-gray-400">
                      {firm.tagline}
                    </div>
                  )}
                </div>
                {firm.id === selectedFirmId && (
                  <span className="text-[11px] font-semibold text-indigo-600">
                    Active
                  </span>
                )}
              </button>
            ))}

            {!loading && (!firms || firms.length === 0) && (
              <div className="px-2.5 py-3 text-xs text-gray-500">
                No firms yet.
              </div>
            )}
          </div>

          {/* Create firm entry – this will open the modal */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new CustomEvent("open-create-firm-modal"));
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs text-indigo-600 hover:bg-indigo-50"
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-indigo-300 text-[10px]">
              +
            </span>
            <span>Create new firm</span>
          </button>
        </div>
      )}
    </div>
  );
}
