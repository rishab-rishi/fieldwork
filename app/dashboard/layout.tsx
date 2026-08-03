import { Menu } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { Sidebar } from "@/components/dashboard/sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/dashboard/nav-items";
import Link from "next/link";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { accountId, role, name, email } = await requireTeamSession();

  const account = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { name: true, plan: true },
  });

  const items = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-4">
                <SheetTitle className="mb-4">Fieldwork</SheetTitle>
                <nav className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div>
              <p className="text-sm font-semibold leading-none">{account.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{role}</p>
            </div>
            <Badge variant={account.plan === "PRO" ? "default" : "secondary"}>
              {account.plan}
            </Badge>
          </div>
          <UserMenu name={name} email={email} />
        </header>
        <main className="flex-1 bg-muted/10 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
