import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  companyName: z.string().min(1, "Workspace name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
