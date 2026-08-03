import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { PortalAccessPanel } from "@/components/clients/portal-access-panel";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { FileManager } from "@/components/files/file-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { accountId, role } = await requireTeamSession();

  const [client, account] = await Promise.all([
    prisma.client.findFirst({
      where: { id, accountId },
      include: {
        projects: { orderBy: { createdAt: "desc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        files: { orderBy: { createdAt: "desc" }, include: { uploadedBy: { select: { name: true } } } },
        portalAccess: { include: { user: true } },
      },
    }),
    prisma.account.findUniqueOrThrow({ where: { id: accountId }, select: { plan: true } }),
  ]);

  if (!client) notFound();

  const canManage = role === "OWNER" || role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
        </div>
        <ClientFormDialog
          client={{
            id: client.id,
            name: client.name,
            email: client.email,
            company: client.company,
            phone: client.phone,
            notes: client.notes,
          }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {client.phone}
              </div>
            )}
            {client.notes && <p className="border-t pt-2 text-muted-foreground">{client.notes}</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Client portal</CardTitle>
          </CardHeader>
          <CardContent>
            <PortalAccessPanel
              clientId={client.id}
              clientEmail={client.email}
              plan={account.plan}
              portalUser={client.portalAccess[0]?.user ?? null}
              canManage={canManage}
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects ({client.projects.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({client.invoices.length})</TabsTrigger>
          <TabsTrigger value="files">Files ({client.files.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-3">
          <div className="flex justify-end">
            <Button render={<Link href={`/dashboard/projects?clientId=${client.id}`} />} size="sm" variant="outline">
              <Plus className="mr-1.5 h-4 w-4" />
              New project
            </Button>
          </div>
          <Card>
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
                        <TableCell className="font-medium">
                          <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                            {project.name}
                          </Link>
                        </TableCell>
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
        </TabsContent>

        <TabsContent value="invoices" className="space-y-3">
          <div className="flex justify-end">
            <Button render={<Link href={`/dashboard/invoices/new?clientId=${client.id}`} />} size="sm" variant="outline">
              <Plus className="mr-1.5 h-4 w-4" />
              New invoice
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {client.invoices.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</p>
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
                    {client.invoices.map((invoice) => (
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
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardContent className="pt-6">
              <FileManager files={client.files} clientId={client.id} canDelete />

            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
