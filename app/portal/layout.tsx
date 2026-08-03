import { Briefcase } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePortalSession } from "@/lib/permissions";
import { UserMenu } from "@/components/dashboard/user-menu";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { clientId, name, email } = await requirePortalSession();

  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: { account: { select: { name: true } } },
  });

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold leading-none">{client.account.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">Client portal</p>
          </div>
        </div>
        <UserMenu name={name} email={email} />
      </header>
      <main className="mx-auto max-w-5xl p-4 md:p-8">{children}</main>
    </div>
  );
}
