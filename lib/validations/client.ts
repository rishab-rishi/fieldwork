import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;
