import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { FileManager } from "@/components/files/file-manager";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { accountId, role } = await requireTeamSession();

  const [project, clients] = await Promise.all([
    prisma.project.findFirst({
      where: { id, accountId },
      include: {
        client: true,
        invoices: { orderBy: { createdAt: "desc" } },
        files: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
      },
    }),
    prisma.client.findMany({ where: { accountId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            for{" "}
            <Link href={`/dashboard/clients/${project.clientId}`} className="hover:underline">
              {project.client.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectFormDialog
            clients={clients}
            project={{ ...project, budget: project.budget ? project.budget.toString() : null }}
          />
          {role !== "MEMBER" && <DeleteProjectButton projectId={project.id} />}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusBadge status={project.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">
            {project.budget ? formatCurrency(project.budget) : "—"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Start</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{formatDate(project.startDate)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due</CardTitle>
          </CardHeader>
          <CardContent className="text-lg font-medium">{formatDate(project.dueDate)}</CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{project.description}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Invoices</CardTitle>
          <Button
            render={<Link href={`/dashboard/invoices/new?clientId=${project.clientId}&projectId=${project.id}`} />}
            size="sm"
            variant="outline"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New invoice
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {project.invoices.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No invoices for this project yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="hover:underline">
                        {invoice.number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files</CardTitle>
        </CardHeader>
        <CardContent>
          <FileManager files={project.files} projectId={project.id} canDelete />
        </CardContent>
      </Card>
    </div>
  );
}
