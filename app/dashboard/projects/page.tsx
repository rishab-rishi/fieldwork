import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectStatusBadge } from "@/components/projects/project-status-badge";
import { ProjectStatusFilter } from "@/components/projects/project-status-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ProjectStatus } from "@prisma/client";

const STATUSES: ProjectStatus[] = ["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; clientId?: string }>;
}) {
  const { accountId } = await requireTeamSession();
  const { status, clientId } = await searchParams;
  const statusFilter = STATUSES.includes(status as ProjectStatus) ? (status as ProjectStatus) : undefined;

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { accountId, ...(statusFilter ? { status: statusFilter } : {}) },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({ where: { accountId }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">Track the work you&apos;re doing for each client.</p>
        </div>
        <div className="flex items-center gap-2">
          <ProjectStatusFilter current={statusFilter} />
          <ProjectFormDialog clients={clients} defaultClientId={clientId} />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No projects yet</p>
              <p className="text-sm text-muted-foreground">Create a project to start tracking work.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <Link href={`/dashboard/clients/${project.clientId}`} className="hover:underline">
                        {project.client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>{project.budget ? formatCurrency(project.budget) : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(project.dueDate)}</TableCell>
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
