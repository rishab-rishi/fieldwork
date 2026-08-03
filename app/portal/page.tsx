import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePortalSession } from "@/lib/permissions";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function PortalOverviewPage() {
  const { clientId } = await requirePortalSession();

  const client = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
    include: {
      projects: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {client.name}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s in progress and what&apos;s owed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.projects.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No projects yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(project.dueDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.invoices.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/portal/invoices/${invoice.id}/pdf`} target="_blank" />}
                        size="sm"
                        variant="ghost"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
