"use client";

import { useActionState, useEffect, useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { inviteTeamMemberAction, type ActionState } from "@/app/dashboard/team/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    inviteTeamMemberAction,
    undefined
  );

  const inviteUrl =
    state?.token && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${state.token}`
      : null;

  useEffect(() => {
    if (!open) return;
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Invite teammate
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            Send them the invite link below. This demo doesn&apos;t send real emails.
          </DialogDescription>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-3">
            <Label>Invite link</Label>
            <div className="flex gap-2">
              <Input readOnly value={inviteUrl} />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  toast.success("Link copied");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Expires in 7 days.</p>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="MEMBER">
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member — manage clients, projects, invoices</SelectItem>
                  <SelectItem value="ADMIN">Admin — also manage team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending..." : "Create invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
