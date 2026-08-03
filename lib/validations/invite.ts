import { z } from "zod";

export const teamInviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const clientInviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
