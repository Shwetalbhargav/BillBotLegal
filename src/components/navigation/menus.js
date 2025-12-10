// src/components/navigation/menus.js
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
    { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Clients", to: "/clients", icon: Users },
    { label: "Cases", to: "/cases", icon: Briefcase },
    { label: "Billables", to: "/billables", icon: CheckCircle2 },
    { label: "Invoices", to: "/invoices", icon: FileText },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "Email Entries", to: "/email-entries", icon: Inbox },
  ],

  partner: [
    { label: "Dashboard", to: "/partner/dashboard", icon: LayoutDashboard },
    { label: "Clients", to: "/clients", icon: Users, readOnly: true, badge: "View" },
    { label: "Cases", to: "/cases", icon: Briefcase, readOnly: true, badge: "View" },
    { label: "Billables", to: "/billables", icon: CheckCircle2 },
    { label: "Invoices", to: "/invoices", icon: FileText, readOnly: true, badge: "View" },
    { label: "Analytics", to: "/analytics", icon: BarChart3 },
    { label: "Email Entries", to: "/email-entries", icon: Inbox },
  ],

  lawyer: [
    { label: "Dashboard", to: "/lawyer/dashboard", icon: LayoutDashboard },
    { label: "My Cases", to: "/cases", icon: Briefcase },
    { label: "My Billables", to: "/billables", icon: CheckCircle2 },
    { label: "Clients", to: "/clients", icon: Users, readOnly: true, badge: "View" },
    { label: "Invoices", to: "/invoices", icon: FileText, readOnly: true, badge: "View" },
    { label: "Email Entries", to: "/email-entries", icon: Inbox },
  ],

  associate: [
    { label: "Dashboard", to: "/associate/dashboard", icon: LayoutDashboard },
    { label: "Assigned Cases", to: "/cases", icon: Briefcase, readOnly: true, badge: "View" },
    { label: "My Billables", to: "/billables", icon: CheckCircle2 },
    { label: "Email Entries", to: "/email-entries", icon: Inbox },
  ],

  intern: [
    { label: "Dashboard", to: "/intern/dashboard", icon: LayoutDashboard },
    { label: "Tasks / Entries", to: "/email-entries", icon: Inbox },
    { label: "Assigned Cases", to: "/cases", icon: Briefcase, readOnly: true, badge: "View" },
  ],
};

export function getDefaultRouteForRole(role) {
  switch ((role || "").toLowerCase()) {
    case "admin":
      return "/admin/dashboard";
    case "partner":
      return "/partner/dashboard";
    case "associate":
      return "/associate/dashboard";
    case "intern":
      return "/intern/dashboard";
    case "lawyer":
    default:
      return "/lawyer/dashboard";
  }
}
