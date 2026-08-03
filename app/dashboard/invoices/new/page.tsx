import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { createInvoiceAction } from "@/app/dashboard/invoices/actions";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; projectId?: string }>;
}) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);
  const { clientId, projectId } = await searchParams;

  const [clients, projects] = await Promise.all([
    prisma.client.findMany({ where: { accountId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({
      where: { accountId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New invoice</h1>
        <p className="text-sm text-muted-foreground">Bill a client for completed work.</p>
      </div>
      <InvoiceForm
        clients={clients}
        projects={projects}
        defaultValues={{ clientId, projectId }}
        submitLabel="Create invoice"
        action={createInvoiceAction}
      />
    </div>
  );
}
