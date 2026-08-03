import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import { updateInvoiceAction } from "@/app/dashboard/invoices/actions";
import { toNumber } from "@/lib/format";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const [invoice, clients, projects] = await Promise.all([
    prisma.invoice.findFirst({ where: { id, accountId }, include: { items: true } }),
    prisma.client.findMany({ where: { accountId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.project.findMany({
      where: { accountId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, clientId: true },
    }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit {invoice.number}</h1>
        <p className="text-sm text-muted-foreground">Update line items, dates, or status.</p>
      </div>
      <InvoiceForm
        clients={clients}
        projects={projects}
        submitLabel="Save changes"
        action={updateInvoiceAction.bind(null, invoice.id)}
        defaultValues={{
          clientId: invoice.clientId,
          projectId: invoice.projectId ?? "",
          status: invoice.status,
          issueDate: invoice.issueDate.toISOString().slice(0, 10),
          dueDate: invoice.dueDate.toISOString().slice(0, 10),
          taxRate: invoice.subtotal && toNumber(invoice.subtotal) > 0
            ? Math.round((toNumber(invoice.tax) / toNumber(invoice.subtotal)) * 10000) / 100
            : 0,
          notes: invoice.notes ?? "",
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: toNumber(item.quantity),
            unitPrice: toNumber(item.unitPrice),
          })),
        }}
      />
    </div>
  );
}
