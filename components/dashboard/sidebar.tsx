"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import type { TeamRole } from "@/lib/permissions";

export function Sidebar({ role }: { role: TeamRole }) {
  const pathname = usePathname();

  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/20 md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <Briefcase className="h-5 w-5" />
        Fieldwork
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
