export const FREE_PLAN_LIMITS = {
  clients: 3,
  projects: 5,
} as const;

export const PLAN_FEATURES = {
  FREE: [
    `Up to ${FREE_PLAN_LIMITS.clients} clients`,
    `Up to ${FREE_PLAN_LIMITS.projects} projects`,
    "Invoicing & PDF export",
    "File uploads",
  ],
  PRO: [
    "Unlimited clients",
    "Unlimited projects",
    "Invoicing & PDF export",
    "File uploads",
    "Client portal access",
    "Priority support",
  ],
} as const;
