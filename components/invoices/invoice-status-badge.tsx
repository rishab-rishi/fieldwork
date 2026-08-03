import type { InvoiceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

const styles: Record<InvoiceStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SENT: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  PAID: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  OVERDUE: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant="outline" className={styles[status]}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
