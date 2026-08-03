"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { acceptInviteForExistingUserAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

export function AcceptInviteExisting({ token, isLoggedIn }: { token: string; isLoggedIn: boolean }) {
  const router = useRouter();
  const { update } = useSession();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You already have an account. Log in to accept this invite.
        </p>
        <Button render={<a href={`/login?callbackUrl=/invite/${token}`} />} className="w-full">
          Log in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await acceptInviteForExistingUserAction(token);
            if (res?.error) {
              setError(res.error);
              toast.error(res.error);
              return;
            }
            await update();
            toast.success("Invite accepted");
            router.push(res?.redirectTo || "/dashboard");
          })
        }
      >
        {pending ? "Accepting..." : "Accept invite"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
