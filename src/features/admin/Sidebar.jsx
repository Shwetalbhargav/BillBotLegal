import React from "react";
import { NavLink } from "react-router-dom";
import { Bot, BarChart2, Users2, Briefcase, FileText, CheckSquare, LayoutDashboard } from "lucide-react";


export default function Sidebar(){
const link = ({ to, icon:Icon, label }) => (
<NavLink to={to} className={({isActive})=> `flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 ${isActive? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'}`}>
<Icon size={18}/><span>{label}</span>
</NavLink>
);
return (
<aside className="w-64 p-4 border-r bg-white h-full sticky top-0">
<div className="mb-6 flex items-center gap-2 text-xl font-semibold">
<LayoutDashboard size={20}/> Admin
</div>
<nav className="space-y-1">
{link({ to: "/admin/overview", icon: LayoutDashboard, label: "Overview" })}
{link({ to: "/admin/clients", icon: Users2, label: "Clients" })}
{link({ to: "/admin/cases", icon: Briefcase, label: "Cases" })}
{link({ to: "/admin/analytics", icon: BarChart2, label: "Analytics" })}
{link({ to: "/admin/invoices", icon: FileText, label: "Invoices" })}
{link({ to: "/admin/approvals", icon: CheckSquare, label: "Approvals" })}
{link({ to: "/admin/ai", icon: Bot, label: "AI Helper" })}
</nav>
</aside>
);
}