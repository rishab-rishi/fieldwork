import type { ProjectStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const styles: Record<ProjectStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  ON_HOLD: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  COMPLETED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  CANCELLED: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const labels: Record<ProjectStatus, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {labels[status]}
    </Badge>
  );
}
