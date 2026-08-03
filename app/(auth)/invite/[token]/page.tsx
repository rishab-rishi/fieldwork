import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";
import { AcceptInviteExisting } from "@/components/auth/accept-invite-existing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { account: true, client: true },
  });

  if (!invite || invite.accepted || invite.expiresAt < new Date()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invite not valid</CardTitle>
          <CardDescription>
            This invite link has expired, already been used, or doesn&apos;t exist.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  const session = await auth();

  const target = invite.clientId ? invite.client?.name ?? "a client portal" : invite.account.name;

  return (
    <Card>
      <CardHeader>
        <CardTitle>You&apos;re invited</CardTitle>
        <CardDescription>
          {invite.clientId
            ? `You've been invited to the client portal for ${target}.`
            : `You've been invited to join ${target} as ${invite.role?.toLowerCase()}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {existingUser ? (
          <AcceptInviteExisting token={token} isLoggedIn={!!session?.user} />
        ) : (
          <AcceptInviteForm token={token} email={invite.email} />
        )}
      </CardContent>
    </Card>
  );
}
