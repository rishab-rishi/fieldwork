"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateMemberRoleAction, removeMemberAction } from "@/app/dashboard/team/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import type { MembershipRole } from "@prisma/client";

export function MemberRowActions({
  membershipId,
  role,
  isSelf,
  isOwner,
  canManage,
}: {
  membershipId: string;
  role: MembershipRole;
  isSelf: boolean;
  isOwner: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (role === "OWNER") {
    return <span className="text-sm text-muted-foreground">Workspace owner</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isOwner ? (
        <Select
          value={role}
          disabled={pending || isSelf}
          onValueChange={(value) => {
            startTransition(async () => {
              const res = await updateMemberRoleAction(membershipId, value as MembershipRole);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Role updated");
                router.refresh();
              }
            });
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="MEMBER">Member</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <span className="text-sm text-muted-foreground">{role}</span>
      )}
      {canManage && !isSelf && (
        <ConfirmDeleteButton
          itemLabel="team member"
          action={() => removeMemberAction(membershipId)}
          onDeleted={() => router.refresh()}
        />
      )}
    </div>
  );
}
