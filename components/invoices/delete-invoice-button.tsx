"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { deleteInvoiceAction } from "@/app/dashboard/invoices/actions";

export function DeleteInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();

  return (
    <ConfirmDeleteButton
      itemLabel="invoice"
      action={() => deleteInvoiceAction(invoiceId)}
      onDeleted={() => router.push("/dashboard/invoices")}
    />
  );
}
