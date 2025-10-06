import React, { useEffect, useState } from 'react';
import { getEmailEntries } from '@/services/api';
import { FaEnvelope, FaUser, FaClock, FaFileAlt, FaRupeeSign } from 'react-icons/fa';

export default function EmailBillables() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await getEmailEntries();
        setEntries(res.data.entries);
      } catch (err) {
        console.error('Failed to fetch email entries:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const calculateCost = (minutes) => {
    const seconds = minutes * 60;
    return seconds * 10; // ₹10 per second
  };

  if (loading) return (
    <div className="p-6 text-center text-[color:var(--lb-muted)]">Loading invoices…</div>
  );

  return (
    <div className="grid gap-6">
      {entries.map(entry => (
        <article key={entry._id} className="rounded-[var(--lb-radius-xl)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-sm)] p-6 bg-[color:var(--lb-surface)]">
          <h3 className="text-xl font-semibold mb-4 flex items-center text-[color:var(--lb-text)]">
            <span className="mr-3 inline-grid h-10 w-10 place-items-center rounded-full bg-[color:var(--lb-bg)] border border-[color:var(--lb-border)] shadow-[var(--lb-shadow-xs)]">
              <FaEnvelope />
            </span>
            {entry.subject}
          </h3>

          <div className="text-sm text-[color:var(--lb-text)]/80 mb-1 flex items-center">
            <FaUser className="mr-2 opacity-70" />
            <span className="font-medium">Recipient:</span>&nbsp; {entry.recipient}
          </div>

          <div className="text-sm text-[color:var(--lb-text)]/80 mb-2 flex items-center">
            <FaClock className="mr-2 opacity-70" />
            <span className="font-medium">Time Spent:</span>&nbsp; {entry.typingTimeMinutes} minutes
          </div>

          <div className="text-sm text-[color:var(--lb-text)]/85 mb-4 flex items-start">
            <FaFileAlt className="mr-2 opacity-70 mt-1" />
            <div>
              <div className="font-medium">Billable Summary</div>
              <div className="mt-1 rounded-[var(--lb-radius-md)] border border-[color:var(--lb-border)] bg-[color:var(--lb-bg)] p-3 shadow-[var(--lb-shadow-xs)]">
                {entry.billableSummary}
              </div>
            </div>
          </div>

          <div className="text-sm text-emerald-700 font-semibold inline-flex items-center rounded-[999px] border border-emerald-200 bg-emerald-50 px-2 py-1 shadow-[var(--lb-shadow-xs)]">
            <FaRupeeSign className="mr-1" />
            Billed: ₹{calculateCost(entry.typingTimeMinutes).toLocaleString()}
          </div>

          <div className="text-xs text-[color:var(--lb-muted)] mt-3">Entry ID: {entry._id}</div>
        </article>
      ))}
    </div>
  );
}
