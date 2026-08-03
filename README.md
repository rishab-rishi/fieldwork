# Fieldwork — Freelancer Client Portal

A SaaS portfolio project for freelancers to manage clients, track projects, invoice, and share files — with role-based team access and a read-only client portal.

## Features

- **Auth** — email/password via NextAuth (Auth.js) v5, JWT sessions
- **Dashboard** — client/project/revenue stats, recent invoices, a 6-month revenue chart
- **Client management** — CRUD, notes, per-client projects/invoices/files
- **Project tracking** — status, budget, dates, filtering
- **Invoicing** — line-item builder, auto-calculated totals, status workflow, PDF export (`@react-pdf/renderer`)
- **File uploads** — attach files to clients/projects, stored locally, access-controlled downloads
- **Role-based permissions** — `OWNER` / `ADMIN` / `MEMBER` on the team side; a separate `CLIENT` role scoped to a single client for the read-only portal
- **Client portal** — invite a client (Pro plan) to a read-only view of their own projects and invoices
- **Subscriptions** — Free/Pro plans with usage caps; billing is **simulated** (no real payment processor) since this is a portfolio project

## Stack

Next.js 16 (App Router) · TypeScript · Prisma · PostgreSQL · NextAuth v5 · Tailwind CSS + shadcn/ui · React Hook Form + Zod · Recharts

## Getting started

### 1. Start Postgres

Requires Docker Desktop running.

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp .env.example .env
```

The defaults match `docker-compose.yml` and already include a generated `AUTH_SECRET`.

### 3. Install dependencies, migrate, and seed

```bash
npm install
npx prisma migrate dev
npx prisma db seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo logins

Seeded by `prisma/seed.ts`:

| Role                  | Email               | Password       |
| ---------------------- | -------------------- | -------------- |
| Owner                  | owner@demo.com       | password123    |
| Team member             | member@demo.com      | password123    |
| Client (portal only)   | client@demo.com      | clientpass123  |

## Project structure

```
app/
  (auth)/            login, register, invite acceptance
  dashboard/          team app — clients, projects, invoices, team, billing
  portal/             read-only client-facing views
  api/uploads/         file upload + secure download
lib/
  auth.ts             NextAuth config
  permissions.ts       role/session guards for pages & actions
  pdf.tsx              invoice PDF template
  storage.ts           local file storage helpers
prisma/
  schema.prisma
  seed.ts
```

## Notes

- **File storage** is local disk (`./uploads`, git-ignored) for development. For a real deployment (e.g. Vercel's ephemeral filesystem), swap `lib/storage.ts` for an S3-compatible provider.
- **Billing** is mocked — no Stripe integration. Upgrading/downgrading a plan just flips a field on the `Account` record via a server action, with a confirmation dialog that's explicit about it being a demo.
- Route protection lives in `proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`; same behavior).
