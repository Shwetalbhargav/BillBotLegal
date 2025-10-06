// src/components/navigation/index.js

// Re-exports for easy imports
export { default as Sidebar } from "./Sidebar";
export { default as SidebarItem } from "./SidebarItem";
export { MENUS, getDefaultRouteForRole } from "./menus";

// Optional grouped object export if you prefer a single namespace:
//   import { Navigation } from "@/components/navigation";
//   const { Sidebar, SidebarItem, MENUS } = Navigation;
import Sidebar_ from "./Sidebar";
import SidebarItem_ from "./SidebarItem";
import * as menus_ from "./menus";

export const Navigation = {
  Sidebar: Sidebar_,
  SidebarItem: SidebarItem_,
  ...menus_,
};
