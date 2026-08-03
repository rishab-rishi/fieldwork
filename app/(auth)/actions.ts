"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { MembershipRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth, signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { acceptInviteSchema } from "@/lib/validations/invite";

export type AuthActionState = { error?: string } | undefined;

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, companyName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email: normalizedEmail, passwordHash },
    });
    await tx.account.create({
      data: {
        name: companyName,
        memberships: { create: { userId: user.id, role: MembershipRole.OWNER } },
      },
    });
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

async function loadValidInvite(token: string) {
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite || invite.accepted || invite.expiresAt < new Date()) return null;
  return invite;
}

export async function acceptInviteForNewUserAction(
  token: string,
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const invite = await loadValidInvite(token);
  if (!invite) return { error: "This invite is no longer valid." };

  const parsed = acceptInviteSchema.safeParse({ token, ...Object.fromEntries(formData) });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } });
  if (existing) {
    return { error: "An account with this email already exists. Log in to accept this invite." };
  }

  if (invite.clientId) {
    const alreadyLinked = await prisma.clientPortalAccess.findFirst({
      where: { clientId: invite.clientId },
    });
    if (alreadyLinked) return { error: "This client already has a portal account." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: parsed.data.name, email: invite.email, passwordHash },
    });
    if (invite.clientId) {
      await tx.clientPortalAccess.create({ data: { userId: user.id, clientId: invite.clientId } });
    } else {
      await tx.membership.create({
        data: { userId: user.id, accountId: invite.accountId, role: invite.role ?? MembershipRole.MEMBER },
      });
    }
    await tx.invite.update({ where: { id: invite.id }, data: { accepted: true } });
  });

  try {
    await signIn("credentials", {
      email: invite.email,
      password: parsed.data.password,
      redirectTo: invite.clientId ? "/portal" : "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Try logging in." };
    }
    throw error;
  }
}

export async function acceptInviteForExistingUserAction(token: string) {
  const invite = await loadValidInvite(token);
  if (!invite) return { error: "This invite is no longer valid." };

  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Log in first, then reopen this invite link." };
  }
  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return { error: `This invite is for ${invite.email}. Log in with that email first.` };
  }

  if (invite.clientId) {
    const alreadyLinked = await prisma.clientPortalAccess.findFirst({
      where: { clientId: invite.clientId },
    });
    if (alreadyLinked) return { error: "This client already has a portal account." };
  } else {
    const existingMembership = await prisma.membership.findUnique({
      where: { userId_accountId: { userId: session.user.id, accountId: invite.accountId } },
    });
    if (existingMembership) return { error: "You're already a member of this workspace." };
  }

  await prisma.$transaction(async (tx) => {
    if (invite.clientId) {
      await tx.clientPortalAccess.create({ data: { userId: session.user.id, clientId: invite.clientId } });
    } else {
      await tx.membership.create({
        data: {
          userId: session.user.id,
          accountId: invite.accountId,
          role: invite.role ?? MembershipRole.MEMBER,
        },
      });
    }
    await tx.invite.update({ where: { id: invite.id }, data: { accepted: true } });
  });

  return { ok: true, redirectTo: invite.clientId ? "/portal" : "/dashboard" };
}
