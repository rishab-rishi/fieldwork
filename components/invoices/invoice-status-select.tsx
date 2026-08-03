"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateInvoiceStatusAction } from "@/app/dashboard/invoices/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceStatus } from "@prisma/client";

export function InvoiceStatusSelect({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      onValueChange={(value) => {
        startTransition(async () => {
          const res = await updateInvoiceStatusAction(invoiceId, value as InvoiceStatus);
          if (res?.error) {
            toast.error(res.error);
          } else {
            toast.success("Status updated");
            router.refresh();
          }
        });
      }}
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT">Draft</SelectItem>
        <SelectItem value="SENT">Sent</SelectItem>
        <SelectItem value="PAID">Paid</SelectItem>
        <SelectItem value="OVERDUE">Overdue</SelectItem>
      </SelectContent>
    </Select>
  );
}
