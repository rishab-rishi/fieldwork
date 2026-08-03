import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  unitPrice: z.coerce.number().min(0, "Must be 0 or more"),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  projectId: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE"]),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
