import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import { InvitePortalDialog } from "@/components/clients/invite-portal-dialog";
import { RevokePortalAccessButton } from "@/components/clients/revoke-portal-access-button";
import { Badge } from "@/components/ui/badge";

export function PortalAccessPanel({
  clientId,
  clientEmail,
  plan,
  portalUser,
  canManage,
}: {
  clientId: string;
  clientEmail: string;
  plan: "FREE" | "PRO";
  portalUser: { name: string; email: string } | null;
  canManage: boolean;
}) {
  if (plan !== "PRO") {
    return (
      <div className="flex items-start gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Client portal access is a Pro feature.{" "}
          {canManage && (
            <Link href="/dashboard/settings/billing" className="underline">
              Upgrade to Pro
            </Link>
          )}{" "}
          to let this client log in and view their own projects and invoices.
        </span>
      </div>
    );
  }

  if (portalUser) {
    return (
      <div className="flex items-center justify-between rounded-md border p-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <div>
            <p className="font-medium">Portal access active</p>
            <p className="text-muted-foreground">{portalUser.email}</p>
          </div>
        </div>
        {canManage && <RevokePortalAccessButton clientId={clientId} />}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="text-sm">
        <p className="font-medium">No portal access yet</p>
        <Badge variant="secondary" className="mt-1">Not invited</Badge>
      </div>
      {canManage && <InvitePortalDialog clientId={clientId} defaultEmail={clientEmail} />}
    </div>
  );
}
