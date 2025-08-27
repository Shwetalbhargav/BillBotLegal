// components/AiWriterInline.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { genEmail } from '@/store/aiSlice';
import { Button } from '@/components/common';
import { Input, TextArea } from '@/components/form';

const buildGmailComposeUrl = ({ to, subject, body }) => {
  const p = new URLSearchParams({ view: 'cm', fs: '1', to, su: subject || '', body: body || '' });
  return `https://mail.google.com/mail/u/0/?${p.toString()}`;
};

export default function AiWriterInline({ to, subjectSeed = '' }) {
  const [prompt, setPrompt] = useState('');
  const dispatch = useDispatch();
  const { loading, email, error } = useSelector(s => s.ai || {});

  const onGenerate = async () => { await dispatch(genEmail(prompt)); };
  const onOpenGmail = () => {
    const url = buildGmailComposeUrl({ to, subject: subjectSeed, body: email });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-2">
      <Input placeholder="Describe the email you want…" value={prompt} onChange={e => setPrompt(e.target.value)} />
      <div className="flex gap-2">
        <Button onClick={onGenerate} disabled={!prompt || loading}>{loading ? 'Generating…' : 'Generate'}</Button>
        <Button variant="secondary" onClick={onOpenGmail} disabled={!email}>Open in Gmail</Button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {!!email && <TextArea value={email} onChange={()=>{}} rows={8} readOnly />}
    </div>
  );
}
