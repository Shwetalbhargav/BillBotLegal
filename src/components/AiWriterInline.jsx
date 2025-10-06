// components/AiWriterInline.jsx (Soft-UI Refactor)
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { genEmail } from "@/store/aiSlice";
import { Button } from "@/components/common";
import { Input, TextArea } from "@/components/form";

const buildGmailComposeUrl = ({ to, subject, body }) => {
  const p = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject || "",
    body: body || "",
  });
  return `https://mail.google.com/mail/u/0/?${p.toString()}`;
};

export default function AiWriterInline({ to, subjectSeed = "" }) {
  const [prompt, setPrompt] = useState("");
  const dispatch = useDispatch();
  const { loading, email, error } = useSelector((s) => s.ai || {});

  const onGenerate = async () => {
    await dispatch(genEmail(prompt));
  };

  const onOpenGmail = () => {
    const url = buildGmailComposeUrl({ to, subject: subjectSeed, body: email });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white shadow-sm p-4 sm:p-5 space-y-4">
      {/* Prompt */}
      <div>
        <label
          htmlFor="aiw-prompt"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Describe the email
        </label>
        <Input
          id="aiw-prompt"
          placeholder="e.g., Follow up about retainer agreement and next steps…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="
            w-full rounded-2xl border border-gray-200/70 bg-white/90
            shadow-sm px-3 py-2.5 text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-400/60
          "
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onGenerate} disabled={!prompt || loading}>
          {loading ? "Generating…" : "Generate"}
        </Button>
        <Button
          variant="secondary"
          onClick={onOpenGmail}
          disabled={!email}
          title={email ? "Open draft in Gmail" : "Generate an email first"}
        >
          Open in Gmail
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="
            rounded-2xl border border-rose-200/70 bg-rose-50 text-rose-900
            px-3 py-2 text-sm
          "
        >
          {error}
        </div>
      )}

      {/* Result */}
      {!!email && (
        <div>
          <label
            htmlFor="aiw-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Generated email
          </label>
          <TextArea
            id="aiw-email"
            value={email}
            onChange={() => {}}
            rows={8}
            readOnly
            className="
              w-full rounded-2xl border border-gray-200/70 bg-white/90
              shadow-sm px-3 py-2.5 text-gray-900
              focus:outline-none focus:ring-2 focus:ring-indigo-400/60
            "
          />
        </div>
      )}
    </div>
  );
}
