import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { genEmail } from "@/store/aiSlice";
import { Button, Card, Heading, Loader, Text } from "@/components/ui";
import { TextArea, Input } from "@/components/forms";


export default function AIHelper(){
const dispatch = useDispatch();
const { loading, email, error } = useSelector(s => s.ai || { loading:false, email:'', error:null });
const [prompt, setPrompt] = useState("");
const [subject, setSubject] = useState("");


const run = async ()=>{ await dispatch(genEmail({ subject, prompt })).unwrap().catch(()=>{}); };
return (
<div className="p-6 space-y-6">
<Heading level={2} className="text-2xl font-semibold">AI Helper</Heading>
<Card className="p-6 space-y-4">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-3">
<label className="text-sm font-medium">Email Subject</label>
<Input value={subject} onChange={(e)=> setSubject(e.target.value)} placeholder="Invoice follow-up to ACME" />
<label className="text-sm font-medium">Prompt / Context</label>
<TextArea rows={8} value={prompt} onChange={(e)=> setPrompt(e.target.value)} placeholder="Ask the client about the overdue invoice #123…" />
<div className="flex gap-2">
<Button onClick={run} disabled={loading}>Generate Email</Button>
{loading && <Loader/>}
</div>
{error && <div className="text-sm text-red-600">{error}</div>}
</div>
<div className="space-y-2">
<label className="text-sm font-medium">Suggested Email</label>
<pre className="p-4 bg-gray-50 border rounded-2xl h-72 overflow-auto whitespace-pre-wrap text-sm">{email || 'Your AI-composed email will appear here.'}</pre>
</div>
</div>
</Card>
<Card className="p-6">
<Heading level={3} className="text-lg font-semibold mb-2">Quick Starters</Heading>
<div className="grid md:grid-cols-3 gap-2">
{[
{ t: 'Summarize approvals backlog', p: 'Summarize our pending billable approvals and suggest a plan to clear them this week.' },
{ t: 'Draft invoice reminder', p: 'Write a friendly payment reminder for invoice #___ that is 15 days overdue.' },
{ t: 'Suggest analytics insight', p: 'Look at utilization dips in the last 30 days and suggest 3 actions.' },
].map((x,i)=> (
<Button key={i} variant="secondary" onClick={()=> setPrompt(x.p)}>{x.t}</Button>
))}
</div>
</Card>
</div>
);
}