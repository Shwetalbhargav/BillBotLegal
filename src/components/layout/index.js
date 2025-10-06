// src/components/layout/index.js

// Individual named exports (best for tree-shaking)
export { default as NavBar } from "./NavBar";
export { default as Footer } from "./Footer";
export { default as DashboardLayout } from "./DashboardLayout";
export { useDashboardUI } from "./DashboardLayout";

// Optional grouped export if you prefer a single object import:
//   import { Layout } from "@/components/layout";
//   const { NavBar, Footer, DashboardLayout } = Layout;
import NavBar_ from "./NavBar";
import Footer_ from "./Footer";
import DashboardLayout_ from "./DashboardLayout";
export const Layout = {
  NavBar: NavBar_,
  Footer: Footer_,
  DashboardLayout: DashboardLayout_,
};
