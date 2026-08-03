"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { cancelInviteAction } from "@/app/dashboard/team/actions";

export function CancelInviteButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  return (
    <ConfirmDeleteButton
      itemLabel="invite"
      action={() => cancelInviteAction(inviteId)}
      onDeleted={() => router.refresh()}
    />
  );
}
