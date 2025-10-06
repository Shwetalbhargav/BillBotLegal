// menus.js
// Central, role-aware sidebar configuration

import {
  LayoutDashboard,
  Users,
  Briefcase,
  BarChart3,
  FileText,
  CheckCircle2,
  Inbox,
} from "lucide-react";

export const MENUS = {
  admin: [
    { label: "Overview", to: "/admin/overview", icon: LayoutDashboard },
    { label: "Clients", to: "/admin/clients", icon: Users },
    { label: "Cases", to: "/admin/cases", icon: Briefcase },
    { label: "Billables", to: "/admin/billables", icon: CheckCircle2 },
    { label: "Invoices", to: "/admin/invoices", icon: FileText },
    { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    { label: "Email Entries", to: "/admin/email-entries", icon: Inbox },
    { label: "Users & Roles", to: "/admin/users", icon: Users },
    { label: "Firm Settings", to: "/admin/settings", icon: CogIcon },
  ],

  partner: [
    { label: "Overview", to: "/partner/overview", icon: LayoutDashboard },
    { label: "Clients", to: "/partner/clients", icon: Users },
    { label: "Cases", to: "/partner/cases", icon: Briefcase },
    { label: "Analytics", to: "/partner/analytics", icon: BarChart3 },
    { label: "Invoices (Read)", to: "/partner/invoices", icon: FileText, readOnly: true },
    { label: "Billables (Approve)", to: "/partner/billable-approvals", icon: CheckCircle2 },
  ],

  lawyer: [
    { label: "Overview", to: "/lawyer/overview", icon: LayoutDashboard },
    { label: "My Cases", to: "/lawyer/my-cases", icon: Briefcase },
    { label: "My Billables", to: "/lawyer/my-billables", icon: CheckCircle2 },
    { label: "Clients (Read)", to: "/lawyer/clients", icon: Users, readOnly: true },
    { label: "Invoices (Read)", to: "/lawyer/invoices", icon: FileText, readOnly: true },
  ],

  associate: [
    { label: "Overview", to: "/associate/overview", icon: LayoutDashboard },
    { label: "Assigned Cases", to: "/associate/assigned-cases", icon: Briefcase },
    { label: "My Billables", to: "/associate/my-billables", icon: CheckCircle2 },
  ],

  intern: [
    { label: "Overview", to: "/intern/overview", icon: LayoutDashboard },
    { label: "Tasks / Entries", to: "/intern/tasks", icon: Inbox },
    { label: "Assigned Cases (Read)", to: "/intern/assigned-cases", icon: Briefcase, readOnly: true },
  ],
};

// Fallback icon (admin settings)
function CogIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props} className={`w-5 h-5 ${props.className || ""}`}>
      <path fill="currentColor" d="M19.14,12.94a7.49,7.49,0,0,0,.05-.94,7.49,7.49,0,0,0-.05-.94l2.11-1.65a.5.5,0,0,0,.12-.64l-2-3.46a.5.5,0,0,0-.6-.22l-2.49,1a7.28,7.28,0,0,0-1.63-.94l-.38-2.65A.5.5,0,0,0,13.64,1H10.36a.5.5,0,0,0-.5.42L9.48,4.07a7.28,7.28,0,0,0-1.63.94l-2.49-1a.5.5,0,0,0-.6.22l-2,3.46a.5.5,0,0,0,.12.64L5.1,11.06a7.49,7.49,0,0,0-.05.94,7.49,7.49,0,0,0,.05.94L3,14.59a.5.5,0,0,0-.12.64l2,3.46a.5.5,0,0,0,.6.22l2.49-1a7.28,7.28,0,0,0,1.63.94l.38,2.65a.5.5,0,0,0,.5.42h3.28a.5.5,0,0,0,.5-.42l.38-2.65a7.28,7.28,0,0,0,1.63-.94l2.49,1a.5.5,0,0,0,.6-.22l2-3.46a.5.5,0,0,0-.12-.64Zm-7.14,2.56A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
    </svg>
  );
}

// Default route helper for clean redirects on bare /role hits
export function getDefaultRouteForRole(role) {
  switch (role) {
    case "admin":
      return "/admin/overview";
    case "partner":
      return "/partner/overview";
    case "associate":
      return "/associate/overview";
    case "intern":
      return "/intern/overview";
    case "lawyer":
    default:
      return "/lawyer/overview";
  }
}
