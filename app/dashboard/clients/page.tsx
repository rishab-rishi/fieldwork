import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientRowActions } from "@/components/clients/client-row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";

export default async function ClientsPage() {
  const { accountId, role } = await requireTeamSession();

  const clients = await prisma.client.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { projects: true, invoices: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-muted-foreground">Manage the people and companies you work with.</p>
        </div>
        <ClientFormDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No clients yet</p>
              <p className="text-sm text-muted-foreground">Add your first client to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.company || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{client.email}</TableCell>
                    <TableCell>{client._count.projects}</TableCell>
                    <TableCell>{client._count.invoices}</TableCell>
                    <TableCell className="text-right">
                      <ClientRowActions client={client} canDelete={role !== "MEMBER"} />
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
