import Link from "next/link";
import { subMonths, startOfMonth, format } from "date-fns";
import { Users, FolderKanban, FileClock, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";

export default async function DashboardOverviewPage() {
  const { accountId } = await requireTeamSession();

  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

  const [clientCount, activeProjectCount, outstanding, paidInvoices, recentInvoices] =
    await Promise.all([
      prisma.client.count({ where: { accountId } }),
      prisma.project.count({ where: { accountId, status: "ACTIVE" } }),
      prisma.invoice.aggregate({
        where: { accountId, status: { in: ["SENT", "OVERDUE"] } },
        _sum: { total: true },
      }),
      prisma.invoice.findMany({
        where: { accountId, status: "PAID", issueDate: { gte: sixMonthsAgo } },
        select: { total: true, issueDate: true },
      }),
      prisma.invoice.findMany({
        where: { accountId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { client: true },
      }),
    ]);

  const months: { key: string; month: string; total: number }[] = Array.from({ length: 6 }).map(
    (_, i) => {
      const d = startOfMonth(subMonths(new Date(), 5 - i));
      return { key: format(d, "yyyy-MM"), month: format(d, "MMM"), total: 0 };
    }
  );
  for (const inv of paidInvoices) {
    const key = format(startOfMonth(inv.issueDate), "yyyy-MM");
    const bucket = months.find((m) => m.key === key);
    if (bucket) bucket.total += toNumber(inv.total);
  }

  const revenueThisMonth = months[months.length - 1]?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of your clients, projects, and cash flow.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clients" value={String(clientCount)} icon={Users} />
        <StatCard label="Active projects" value={String(activeProjectCount)} icon={FolderKanban} />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstanding._sum.total ?? 0)}
          icon={FileClock}
          hint="Sent + overdue invoices"
        />
        <StatCard
          label="Revenue this month"
          value={formatCurrency(revenueThisMonth)}
          icon={TrendingUp}
          hint="Paid invoices"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RevenueChart data={months} />
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No invoices yet.{" "}
                <Link href="/dashboard/invoices/new" className="underline">
                  Create your first one
                </Link>
                .
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline">
                          {inv.number}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(inv.issueDate)}</p>
                      </TableCell>
                      <TableCell>{inv.client.name}</TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(inv.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
