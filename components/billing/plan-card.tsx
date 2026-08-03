"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { setPlanAction } from "@/app/dashboard/settings/billing/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Plan } from "@prisma/client";

export function PlanCard({
  plan,
  price,
  features,
  isCurrent,
}: {
  plan: Plan;
  price: string;
  features: readonly string[];
  isCurrent: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Card className={isCurrent ? "border-primary" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan === "PRO" ? "Pro" : "Free"}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
        </div>
        <CardDescription>{price}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              {feature}
            </li>
          ))}
        </ul>

        {isCurrent ? (
          <Button variant="outline" disabled className="w-full">
            Current plan
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger render={<Button className="w-full" disabled={pending} />}>
              {plan === "PRO" ? "Upgrade to Pro" : "Downgrade to Free"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {plan === "PRO" ? "Upgrade to Pro?" : "Downgrade to Free?"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This is a portfolio demo — no real payment will be processed. Your plan will be
                  updated immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    startTransition(async () => {
                      await setPlanAction(plan);
                      toast.success(plan === "PRO" ? "Upgraded to Pro" : "Downgraded to Free");
                      router.refresh();
                    })
                  }
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
