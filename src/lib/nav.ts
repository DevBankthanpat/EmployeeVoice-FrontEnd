import {
  Activity,
  Building2,
  ClipboardList,
  Home,
  Inbox,
  Layers,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Network,
  ScrollText,
  Send,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { Role } from "@/data/schemas";

export interface NavItem {
  href: string;
  /** key into the `nav` message namespace */
  labelKey: string;
  icon: LucideIcon;
}

export interface NavSection {
  /** key into the `nav` message namespace */
  titleKey: string;
  items: NavItem[];
}

const employeeSections: NavSection[] = [
  {
    titleKey: "workspace",
    items: [
      { href: "/home", labelKey: "home", icon: Home },
      { href: "/submit", labelKey: "submit", icon: Send },
      { href: "/my-submissions", labelKey: "mySubmissions", icon: ListChecks },
    ],
  },
];

const dashboardSection: NavSection = {
  titleKey: "dashboard",
  items: [
    { href: "/dashboard", labelKey: "overview", icon: LayoutDashboard },
    { href: "/themes", labelKey: "themes", icon: Layers },
    { href: "/signals", labelKey: "signals", icon: Inbox },
    { href: "/actions", labelKey: "actions", icon: ClipboardList },
    { href: "/analysis", labelKey: "analysis", icon: Activity },
  ],
};

const manageSection: NavSection = {
  titleKey: "manage",
  items: [
    { href: "/members", labelKey: "members", icon: Users },
    { href: "/branches", labelKey: "branches", icon: Building2 },
    { href: "/departments", labelKey: "departments", icon: Network },
    { href: "/roles", labelKey: "roles", icon: ShieldCheck },
    { href: "/settings", labelKey: "settings", icon: Settings },
    { href: "/audit", labelKey: "audit", icon: ScrollText },
  ],
};

/**
 * Sidebar sections per role. Mirrors the role boundaries in CLAUDE.md Hard
 * Rule #7: employees see only their workspace; viewers see the dashboard;
 * admins see the dashboard plus management.
 */
export function navForRole(role: Role): NavSection[] {
  if (role === "employee") return employeeSections;
  if (role === "org_viewer") return [dashboardSection];
  return [dashboardSection, manageSection];
}
