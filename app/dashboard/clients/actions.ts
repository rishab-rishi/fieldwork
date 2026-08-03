"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { clientSchema } from "@/lib/validations/client";
import { clientInviteSchema } from "@/lib/validations/invite";
import { FREE_PLAN_LIMITS } from "@/lib/plan";

export type ActionState = { error?: string } | undefined;

export async function createClientAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  if (account.plan === "FREE") {
    const count = await prisma.client.count({ where: { accountId } });
    if (count >= FREE_PLAN_LIMITS.clients) {
      return {
        error: `Free plan is limited to ${FREE_PLAN_LIMITS.clients} clients. Upgrade to Pro to add more.`,
      };
    }
  }

  await prisma.client.create({
    data: {
      accountId,
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/clients");
  return undefined;
}

export async function updateClientAction(
  clientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const client = await prisma.client.findFirst({ where: { id: clientId, accountId } });
  if (!client) return { error: "Client not found" };

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return undefined;
}

export type PortalInviteState = { error?: string; token?: string } | undefined;

export async function createPortalInviteAction(
  clientId: string,
  _prevState: PortalInviteState,
  formData: FormData
): Promise<PortalInviteState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  if (account.plan !== "PRO") {
    return { error: "Client portal access is a Pro plan feature. Upgrade to invite clients." };
  }

  const client = await prisma.client.findFirst({
    where: { id: clientId, accountId },
    include: { portalAccess: true },
  });
  if (!client) return { error: "Client not found" };
  if (client.portalAccess.length > 0) return { error: "This client already has portal access." };

  const parsed = clientInviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const invite = await prisma.invite.create({
    data: {
      accountId,
      clientId,
      email: parsed.data.email.toLowerCase(),
      role: null,
      expiresAt: addDays(new Date(), 7),
    },
  });

  revalidatePath(`/dashboard/clients/${clientId}`);
  return { token: invite.token };
}

export async function revokePortalAccessAction(clientId: string) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const client = await prisma.client.findFirst({ where: { id: clientId, accountId } });
  if (!client) return { error: "Client not found" };

  await prisma.clientPortalAccess.deleteMany({ where: { clientId } });
  await prisma.invite.deleteMany({ where: { clientId, accepted: false } });

  revalidatePath(`/dashboard/clients/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const client = await prisma.client.findFirst({ where: { id: clientId, accountId } });
  if (!client) return { error: "Client not found" };

  await prisma.client.delete({ where: { id: clientId } });

  revalidatePath("/dashboard/clients");
}
