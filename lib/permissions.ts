import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type TeamRole = "OWNER" | "ADMIN" | "MEMBER";
export type Role = TeamRole | "CLIENT";

export async function requireTeamSession(allowed?: TeamRole[]) {
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !session.user.accountId || !role || role === "CLIENT") {
    redirect("/login");
  }

  if (allowed && !allowed.includes(role as TeamRole)) {
    redirect("/dashboard");
  }

  return {
    userId: session.user.id,
    accountId: session.user.accountId,
    role: role as TeamRole,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}

export async function requirePortalSession() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLIENT" || !session.user.clientId) {
    redirect("/login");
  }

  return {
    userId: session.user.id,
    clientId: session.user.clientId,
    name: session.user.name ?? "",
    email: session.user.email ?? "",
  };
}

export function canManageBilling(role: TeamRole) {
  return role === "OWNER";
}

export function canManageTeam(role: TeamRole) {
  return role === "OWNER" || role === "ADMIN";
}

export function canInviteClients(role: TeamRole) {
  return role === "OWNER" || role === "ADMIN";
}
