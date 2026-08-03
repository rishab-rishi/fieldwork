"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { teamInviteSchema } from "@/lib/validations/invite";
import type { MembershipRole } from "@prisma/client";

export type ActionState = { error?: string; token?: string } | undefined;

export async function inviteTeamMemberAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const parsed = teamInviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existingUser) {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_accountId: { userId: existingUser.id, accountId } },
    });
    if (existingMembership) return { error: "This person is already on your team." };
  }

  const invite = await prisma.invite.create({
    data: {
      accountId,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role as MembershipRole,
      expiresAt: addDays(new Date(), 7),
    },
  });

  revalidatePath("/dashboard/team");
  return { token: invite.token };
}

export async function updateMemberRoleAction(membershipId: string, role: MembershipRole) {
  const { accountId, userId } = await requireTeamSession(["OWNER"]);

  const membership = await prisma.membership.findFirst({ where: { id: membershipId, accountId } });
  if (!membership) return { error: "Member not found" };
  if (membership.userId === userId) return { error: "You can't change your own role." };

  await prisma.membership.update({ where: { id: membershipId }, data: { role } });
  revalidatePath("/dashboard/team");
}

export async function removeMemberAction(membershipId: string) {
  const { accountId, userId, role } = await requireTeamSession(["OWNER", "ADMIN"]);

  const membership = await prisma.membership.findFirst({ where: { id: membershipId, accountId } });
  if (!membership) return { error: "Member not found" };
  if (membership.userId === userId) return { error: "You can't remove yourself." };
  if (membership.role === "OWNER") return { error: "The workspace owner can't be removed." };
  if (membership.role === "ADMIN" && role !== "OWNER") {
    return { error: "Only the owner can remove an admin." };
  }

  await prisma.membership.delete({ where: { id: membershipId } });
  revalidatePath("/dashboard/team");
}

export async function cancelInviteAction(inviteId: string) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const invite = await prisma.invite.findFirst({ where: { id: inviteId, accountId } });
  if (!invite) return { error: "Invite not found" };

  await prisma.invite.delete({ where: { id: inviteId } });
  revalidatePath("/dashboard/team");
}
