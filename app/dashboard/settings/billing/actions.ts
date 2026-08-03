"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import type { Plan } from "@prisma/client";

export async function setPlanAction(plan: Plan) {
  const { accountId } = await requireTeamSession(["OWNER"]);

  await prisma.account.update({ where: { id: accountId }, data: { plan } });

  revalidatePath("/dashboard/settings/billing");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/projects");
}
