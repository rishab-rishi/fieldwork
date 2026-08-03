"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { projectSchema } from "@/lib/validations/project";
import { FREE_PLAN_LIMITS } from "@/lib/plan";

export type ActionState = { error?: string } | undefined;

function parseProjectFields(data: ReturnType<typeof projectSchema.parse>) {
  return {
    name: data.name,
    clientId: data.clientId,
    description: data.description || null,
    status: data.status,
    budget: data.budget ? Number(data.budget) : null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,
  };
}

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, accountId },
  });
  if (!client) return { error: "Client not found" };

  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });
  if (account.plan === "FREE") {
    const count = await prisma.project.count({ where: { accountId } });
    if (count >= FREE_PLAN_LIMITS.projects) {
      return {
        error: `Free plan is limited to ${FREE_PLAN_LIMITS.projects} projects. Upgrade to Pro to add more.`,
      };
    }
  }

  const fields = parseProjectFields(parsed.data);
  await prisma.project.create({ data: { accountId, ...fields } });

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/clients/${parsed.data.clientId}`);
  return undefined;
}

export async function updateProjectAction(
  projectId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await prisma.project.findFirst({ where: { id: projectId, accountId } });
  if (!project) return { error: "Project not found" };

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, accountId },
  });
  if (!client) return { error: "Client not found" };

  const fields = parseProjectFields(parsed.data);
  await prisma.project.update({ where: { id: projectId }, data: fields });

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/clients/${parsed.data.clientId}`);
  return undefined;
}

export async function deleteProjectAction(projectId: string) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const project = await prisma.project.findFirst({ where: { id: projectId, accountId } });
  if (!project) return { error: "Project not found" };

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/clients/${project.clientId}`);
}
