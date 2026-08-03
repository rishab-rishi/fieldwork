import type { TeamRole } from "@/lib/permissions";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  UsersRound,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: TeamRole[];
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Team", href: "/dashboard/team", icon: UsersRound, roles: ["OWNER", "ADMIN"] },
  { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard, roles: ["OWNER"] },
];
