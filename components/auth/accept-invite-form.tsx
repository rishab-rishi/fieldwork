"use client";

import { useActionState } from "react";
import { acceptInviteForNewUserAction } from "@/app/(auth)/actions";
import type { AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

export function AcceptInviteForm({ token, email }: { token: string; email: string }) {
  const action = acceptInviteForNewUserAction.bind(null, token);
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Create a password</Label>
        <PasswordInput id="password" name="password" minLength={8} required />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Accept invite"}
      </Button>
    </form>
  );
}
