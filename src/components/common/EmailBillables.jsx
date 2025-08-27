// src/components/EmailBillables.jsx
import React, { useEffect, useState } from 'react';
import { getEmailEntries } from '@/services/api';
import { FaEnvelope, FaUser, FaClock, FaFileAlt, FaRupeeSign } from 'react-icons/fa';

const EmailBillables = () => {
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

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="grid gap-6">
      {entries.map(entry => (
        <div key={entry._id} className="border rounded shadow p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaEnvelope className="text-purple-500 mr-2" />
            {entry.subject}
          </h3>

          <div className="text-sm text-gray-700 mb-1 flex items-center">
            <FaUser className="mr-2 text-gray-500" />
            <span className="font-medium">Recipient:</span>&nbsp; {entry.recipient}
          </div>

          <div className="text-sm text-gray-700 mb-1 flex items-center">
            <FaClock className="mr-2 text-gray-500" />
            <span className="font-medium">Time Spent:</span>&nbsp; {entry.typingTimeMinutes} minutes
          </div>

          <div className="text-sm text-gray-700 mb-3 flex items-start">
            <FaFileAlt className="mr-2 text-gray-500 mt-1" />
            <div>
              <div className="font-medium">Billable Summary:</div>
              <div>{entry.billableSummary}</div>
            </div>
          </div>

          <div className="text-sm text-green-700 font-semibold flex items-center">
            <FaRupeeSign className="mr-1" />
            Billed: ₹{calculateCost(entry.typingTimeMinutes).toLocaleString()}
          </div>

          <div className="text-xs text-gray-400 mt-2">Entry ID: {entry._id}</div>
        </div>
      ))}
    </div>
  );
};

export default EmailBillables;
