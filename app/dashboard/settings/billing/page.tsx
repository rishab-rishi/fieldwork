import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { PlanCard } from "@/components/billing/plan-card";
import { PLAN_FEATURES } from "@/lib/plan";

export default async function BillingPage() {
  const { accountId } = await requireTeamSession(["OWNER"]);

  const account = await prisma.account.findUniqueOrThrow({ where: { id: accountId } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Simulated subscription for demo purposes — no real charges.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <PlanCard
          plan="FREE"
          price="$0 / month"
          features={PLAN_FEATURES.FREE}
          isCurrent={account.plan === "FREE"}
        />
        <PlanCard
          plan="PRO"
          price="$29 / month"
          features={PLAN_FEATURES.PRO}
          isCurrent={account.plan === "PRO"}
        />
      </div>
    </div>
  );
}
