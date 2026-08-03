"use client";

import { useMemo, useState, useTransition } from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validations/invoice";
import type { InvoiceActionResult } from "@/app/dashboard/invoices/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string; clientId: string };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function inTwoWeeksISO() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function InvoiceForm({
  clients,
  projects,
  defaultValues,
  submitLabel,
  action,
}: {
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultValues?: Partial<InvoiceFormValues>;
  submitLabel: string;
  action: (data: InvoiceFormValues) => Promise<InvoiceActionResult>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as Resolver<InvoiceFormValues>,
    defaultValues: {
      clientId: "",
      projectId: "",
      status: "DRAFT",
      issueDate: todayISO(),
      dueDate: inTwoWeeksISO(),
      taxRate: 0,
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const selectedClientId = watch("clientId");
  const items = watch("items");
  const taxRate = watch("taxRate");

  const filteredProjects = useMemo(
    () => projects.filter((p) => p.clientId === selectedClientId),
    [projects, selectedClientId]
  );

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const tax = subtotal * ((Number(taxRate) || 0) / 100);
  const total = subtotal + tax;

  function onSubmit(data: InvoiceFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await action(data);
      if (result.error) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Invoice saved");
      router.push(`/dashboard/invoices/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={watch("clientId")}
              onValueChange={(v) => {
                register("clientId").onChange({ target: { value: v, name: "clientId" } });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Project (optional)</Label>
            <Select
              value={watch("projectId") || "NONE"}
              onValueChange={(v) => {
                register("projectId").onChange({
                  target: { value: v === "NONE" ? "" : v, name: "projectId" },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="No project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">No project</SelectItem>
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) =>
                register("status").onChange({ target: { value: v, name: "status" } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tax rate (%)</Label>
            <Input type="number" step="0.01" min={0} max={100} {...register("taxRate")} />
          </div>

          <div className="space-y-2">
            <Label>Issue date</Label>
            <Input type="date" {...register("issueDate")} />
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2 lg:col-span-4">
            <Label>Notes</Label>
            <Textarea rows={2} placeholder="Payment terms, thank-you note, etc." {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Line items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => {
            const qty = Number(items[index]?.quantity) || 0;
            const price = Number(items[index]?.unitPrice) || 0;
            return (
              <div key={field.id} className="grid grid-cols-12 items-start gap-2">
                <div className="col-span-6 space-y-1">
                  <Input placeholder="Description" {...register(`items.${index}.description`)} />
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-destructive">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    {...register(`items.${index}.quantity`)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit price"
                    {...register(`items.${index}.unitPrice`)}
                  />
                </div>
                <div className="col-span-1 flex h-9 items-center justify-end text-sm text-muted-foreground">
                  {formatCurrency(qty * price)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
          {errors.items?.message && <p className="text-sm text-destructive">{errors.items.message}</p>}

          <div className="ml-auto w-full max-w-xs space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({Number(taxRate) || 0}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
