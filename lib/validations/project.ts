import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  clientId: z.string().min(1, "Client is required"),
  description: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  budget: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof projectSchema>;
