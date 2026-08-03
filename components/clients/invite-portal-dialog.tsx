"use client";

import { useActionState, useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createPortalInviteAction, type PortalInviteState } from "@/app/dashboard/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function InvitePortalDialog({ clientId, defaultEmail }: { clientId: string; defaultEmail: string }) {
  const [open, setOpen] = useState(false);
  const action = createPortalInviteAction.bind(null, clientId);
  const [state, formAction, pending] = useActionState<PortalInviteState, FormData>(action, undefined);

  const inviteUrl =
    state?.token && typeof window !== "undefined" ? `${window.location.origin}/invite/${state.token}` : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Invite to portal
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite client to the portal</DialogTitle>
          <DialogDescription>
            They&apos;ll get read-only access to this client&apos;s projects and invoices.
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
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Client email</Label>
              <Input id="email" name="email" type="email" defaultValue={defaultEmail} required />
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
