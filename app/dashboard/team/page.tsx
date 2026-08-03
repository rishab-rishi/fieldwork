import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { MemberRowActions } from "@/components/team/member-row-actions";
import { CancelInviteButton } from "@/components/team/cancel-invite-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default async function TeamPage() {
  const { accountId, userId, role } = await requireTeamSession(["OWNER", "ADMIN"]);

  const [memberships, invites] = await Promise.all([
    prisma.membership.findMany({
      where: { accountId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invite.findMany({
      where: { accountId, accepted: false, clientId: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage who has access to your workspace and what they can do.
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">
                    {m.user.name} {m.userId === userId && <Badge variant="secondary" className="ml-2">You</Badge>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.user.email}</TableCell>
                  <TableCell className="text-right">
                    <MemberRowActions
                      membershipId={m.id}
                      role={m.role}
                      isSelf={m.userId === userId}
                      isOwner={role === "OWNER"}
                      canManage={role === "OWNER" || role === "ADMIN"}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending invites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell className="text-muted-foreground">{invite.role}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(invite.expiresAt)}</TableCell>
                    <TableCell className="text-right">
                      <CancelInviteButton inviteId={invite.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
