"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { revokePortalAccessAction } from "@/app/dashboard/clients/actions";

export function RevokePortalAccessButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  return (
    <ConfirmDeleteButton
      itemLabel="portal access"
      action={() => revokePortalAccessAction(clientId)}
      onDeleted={() => router.refresh()}
    />
  );
}
