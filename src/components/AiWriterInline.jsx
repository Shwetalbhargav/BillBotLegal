// src/components/common/AiWriterInline.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { genEmail } from "@/store/aiSlice";
import { Button, Card } from "@/components/common";
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
    if (!prompt.trim()) return;
    await dispatch(genEmail(prompt.trim()));
  };

  const onOpenGmail = () => {
    const url = buildGmailComposeUrl({
      to,
      subject: subjectSeed,
      body: email,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      padding="lg"
      className="space-y-4 bg-[color:var(--lb-surface)]/95 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-[color:var(--lb-text)]">
            AI Email Draft
          </h2>
          <p className="text-[12px] text-[color:var(--lb-muted)]">
            Describe what you want to say; we’ll draft a professional,
            billable-ready email.
          </p>
        </div>
        {to && (
          <p className="text-[12px] text-[color:var(--lb-muted)]">
            To: <span className="font-medium text-[color:var(--lb-text)]">{to}</span>
          </p>
        )}
      </div>

      {/* Prompt */}
      <div className="space-y-1.5">
        <label
          htmlFor="aiw-prompt"
          className="block text-[13px] font-medium text-[color:var(--lb-text)]"
        >
          Describe the email
        </label>
        <Input
          id="aiw-prompt"
          placeholder="E.g. follow up on engagement letter and next steps…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onGenerate} disabled={!prompt.trim() || loading}>
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
          className="rounded-2xl border border-[color:var(--lb-danger-200)] bg-[color:var(--lb-danger-50)] px-3 py-2 text-[13px] text-[color:var(--lb-danger-800)]"
        >
          {error}
        </div>
      )}

      {/* Result */}
      {!!email && (
        <div className="space-y-1.5">
          <label
            htmlFor="aiw-email"
            className="block text-[13px] font-medium text-[color:var(--lb-text)]"
          >
            Generated email
          </label>
          <TextArea
            id="aiw-email"
            value={email}
            onChange={() => {}}
            rows={8}
            readOnly
          />
          <p className="text-[11px] text-[color:var(--lb-muted)]">
            You can tweak the text here, or open it directly in Gmail to add
            attachments and send.
          </p>
        </div>
      )}
    </Card>
  );
}
