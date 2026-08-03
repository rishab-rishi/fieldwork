"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "@prisma/client";

export function ProjectStatusFilter({ current }: { current?: ProjectStatus }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      value={current ?? "ALL"}
      onValueChange={(value) => {
        router.push(value === "ALL" ? pathname : `${pathname}?status=${value}`);
      }}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All statuses</SelectItem>
        <SelectItem value="ACTIVE">Active</SelectItem>
        <SelectItem value="ON_HOLD">On hold</SelectItem>
        <SelectItem value="COMPLETED">Completed</SelectItem>
        <SelectItem value="CANCELLED">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  );
}
