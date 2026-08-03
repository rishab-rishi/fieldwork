import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InvoiceStatusSelect } from "@/components/invoices/invoice-status-select";
import { DeleteInvoiceButton } from "@/components/invoices/delete-invoice-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { accountId, role } = await requireTeamSession();

  const invoice = await prisma.invoice.findFirst({
    where: { id, accountId },
    include: { client: true, project: true, items: true },
  });

  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{invoice.number}</h1>
          <p className="text-sm text-muted-foreground">
            Billed to{" "}
            <Link href={`/dashboard/clients/${invoice.clientId}`} className="hover:underline">
              {invoice.client.name}
            </Link>
            {invoice.project && (
              <>
                {" "}
                for{" "}
                <Link href={`/dashboard/projects/${invoice.project.id}`} className="hover:underline">
                  {invoice.project.name}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
          <Button
            render={<a href={`/dashboard/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer" />}
            variant="outline"
            size="sm"
          >
            <Download className="mr-1.5 h-4 w-4" />
            PDF
          </Button>
          <Button render={<Link href={`/dashboard/invoices/${invoice.id}/edit`} />} variant="outline" size="sm">
            <Pencil className="mr-1.5 h-4 w-4" />
            Edit
          </Button>
          {role !== "MEMBER" && <DeleteInvoiceButton invoiceId={invoice.id} />}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issue date</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{formatDate(invoice.issueDate)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due date</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{formatDate(invoice.dueDate)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{formatCurrency(invoice.total)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity.toString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="ml-auto w-full max-w-xs space-y-1 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{invoice.notes}</CardContent>
        </Card>
      )}
    </div>
  );
}
