"use client";

import { useRouter } from "next/navigation";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { deleteClientAction } from "@/app/dashboard/clients/actions";

type ClientData = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
};

export function ClientRowActions({
  client,
  canDelete,
}: {
  client: ClientData;
  canDelete: boolean;
}) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-2">
      <ClientFormDialog client={client} />
      {canDelete && (
        <ConfirmDeleteButton
          itemLabel="client"
          action={() => deleteClientAction(client.id)}
          onDeleted={() => router.refresh()}
        />
      )}
    </div>
  );
}
