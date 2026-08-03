"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireTeamSession } from "@/lib/permissions";
import { invoiceSchema, type InvoiceFormValues } from "@/lib/validations/invoice";
import type { InvoiceStatus } from "@prisma/client";

export type InvoiceActionResult = { error?: string; id?: string };

async function nextInvoiceNumber(accountId: string) {
  const count = await prisma.invoice.count({ where: { accountId } });
  return `INV-${String(count + 1).padStart(4, "0")}`;
}

function computeTotals(items: InvoiceFormValues["items"], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

export async function createInvoiceAction(input: InvoiceFormValues): Promise<InvoiceActionResult> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const client = await prisma.client.findFirst({ where: { id: data.clientId, accountId } });
  if (!client) return { error: "Client not found" };

  if (data.projectId) {
    const project = await prisma.project.findFirst({ where: { id: data.projectId, accountId } });
    if (!project) return { error: "Project not found" };
  }

  const { subtotal, tax, total } = computeTotals(data.items, data.taxRate);
  const number = await nextInvoiceNumber(accountId);

  const invoice = await prisma.invoice.create({
    data: {
      accountId,
      clientId: data.clientId,
      projectId: data.projectId || null,
      number,
      status: data.status,
      issueDate: new Date(data.issueDate),
      dueDate: new Date(data.dueDate),
      subtotal,
      tax,
      total,
      notes: data.notes || null,
      items: {
        create: data.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
        })),
      },
    },
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  return { id: invoice.id };
}

export async function updateInvoiceAction(
  invoiceId: string,
  input: InvoiceFormValues
): Promise<InvoiceActionResult> {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, accountId } });
  if (!existing) return { error: "Invoice not found" };

  const client = await prisma.client.findFirst({ where: { id: data.clientId, accountId } });
  if (!client) return { error: "Client not found" };

  if (data.projectId) {
    const project = await prisma.project.findFirst({ where: { id: data.projectId, accountId } });
    if (!project) return { error: "Project not found" };
  }

  const { subtotal, tax, total } = computeTotals(data.items, data.taxRate);

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId } });
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        clientId: data.clientId,
        projectId: data.projectId || null,
        status: data.status,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        subtotal,
        tax,
        total,
        notes: data.notes || null,
        items: {
          create: data.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
          })),
        },
      },
    });
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  return { id: invoiceId };
}

export async function updateInvoiceStatusAction(invoiceId: string, status: InvoiceStatus) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN", "MEMBER"]);

  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, accountId } });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });

  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}

export async function deleteInvoiceAction(invoiceId: string) {
  const { accountId } = await requireTeamSession(["OWNER", "ADMIN"]);

  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, accountId } });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.invoice.delete({ where: { id: invoiceId } });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}
