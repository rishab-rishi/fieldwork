import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicesPage() {
  const { accountId } = await requireTeamSession();

  const invoices = await prisma.invoice.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Bill clients and track payment status.</p>
        </div>
        <Button render={<Link href="/dashboard/invoices/new" />} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New invoice
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-sm text-muted-foreground">Create your first invoice to get paid.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
