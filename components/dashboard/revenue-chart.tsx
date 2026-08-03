"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueChart({ data }: { data: { month: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Revenue (paid invoices, last 6 months)
        </CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              width={56}
              tickFormatter={(v) => `$${v}`}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <Tooltip
              cursor={{ fill: "var(--muted)" }}
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Revenue"]}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
