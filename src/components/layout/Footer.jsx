// src/components/layout/Footer.jsx
import React from "react";
import { Badge } from "@/components/common";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[color:var(--lb-border)] bg-[color:var(--lb-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="font-semibold text-lg mb-2">
            Legal Billables <Badge color="primary">MVP</Badge>
          </div>
          <p className="lb-help">
            AI-powered time capture that fits your daily workflow.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-2">Services</div>
          <ul className="text-sm space-y-2">
            <li>Email Time Tracking</li>
            <li>Case & Client Management</li>
            <li>Billable Summaries (GPT)</li>
            <li>Clio Integration</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Contact</div>
          <div className="text-sm space-y-1">
            <div>+91 9028657821</div>
            <div>info@legalbillables.ai</div>
            <div>ABC Legal Chambers, Unit No. 504, Fifth Floor, Crescent Business Park,Andheri-Kurla Road, Andheri (East),
              Mumbai – 400059, Maharashtra, India
            </div>
          </div>
        </div>

        <div>
          <div className="font-semibold mb-2">Legal</div>
          <ul className="text-sm space-y-2">
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
            <li>Security</li>
          </ul>
        </div>
      </div>

      <div className="text-center text-sm py-4 border-t border-[color:var(--lb-border)]">
        © {new Date().getFullYear()} Legal Billables. All rights reserved.
      </div>
    </footer>
  );
}
