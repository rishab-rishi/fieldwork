import { PrismaClient, MembershipRole, ProjectStatus, InvoiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@demo.com" },
    update: {},
    create: { name: "Alex Rivera", email: "owner@demo.com", passwordHash },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: {},
    create: { name: "Jamie Chen", email: "member@demo.com", passwordHash },
  });

  const account = await prisma.account.create({
    data: {
      name: "Rivera Design Co.",
      plan: "FREE",
      memberships: {
        create: [
          { userId: owner.id, role: MembershipRole.OWNER },
          { userId: member.id, role: MembershipRole.MEMBER },
        ],
      },
    },
  });

  const client1 = await prisma.client.create({
    data: {
      accountId: account.id,
      name: "Sam Whitfield",
      email: "sam@brightleaf.com",
      company: "Brightleaf Studio",
      phone: "555-0142",
      notes: "Prefers async updates over calls.",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      accountId: account.id,
      name: "Priya Nandan",
      email: "priya@northgate.io",
      company: "Northgate Labs",
    },
  });

  const clientPassword = await bcrypt.hash("clientpass123", 10);
  const clientUser = await prisma.user.upsert({
    where: { email: "client@demo.com" },
    update: {},
    create: { name: "Sam Whitfield", email: "client@demo.com", passwordHash: clientPassword },
  });
  await prisma.clientPortalAccess.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: { userId: clientUser.id, clientId: client1.id },
  });

  const project1 = await prisma.project.create({
    data: {
      accountId: account.id,
      clientId: client1.id,
      name: "Brand Identity Refresh",
      description: "New logo, color system, and brand guidelines.",
      status: ProjectStatus.ACTIVE,
      budget: 8500,
      startDate: new Date("2026-06-01"),
      dueDate: new Date("2026-08-15"),
    },
  });

  await prisma.project.create({
    data: {
      accountId: account.id,
      clientId: client2.id,
      name: "Marketing Site Redesign",
      description: "Full redesign of the marketing site and blog.",
      status: ProjectStatus.ON_HOLD,
      budget: 12000,
      startDate: new Date("2026-05-10"),
    },
  });

  const invoice1 = await prisma.invoice.create({
    data: {
      accountId: account.id,
      clientId: client1.id,
      projectId: project1.id,
      number: "INV-0001",
      status: InvoiceStatus.PAID,
      issueDate: new Date("2026-06-15"),
      dueDate: new Date("2026-06-29"),
      subtotal: 4000,
      tax: 0,
      total: 4000,
      items: {
        create: [
          { description: "Logo design (3 concepts)", quantity: 1, unitPrice: 2500, amount: 2500 },
          { description: "Brand guidelines document", quantity: 1, unitPrice: 1500, amount: 1500 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      accountId: account.id,
      clientId: client1.id,
      projectId: project1.id,
      number: "INV-0002",
      status: InvoiceStatus.SENT,
      issueDate: new Date("2026-07-20"),
      dueDate: new Date("2026-08-03"),
      subtotal: 4500,
      tax: 0,
      total: 4500,
      items: {
        create: [
          { description: "Color system + typography", quantity: 1, unitPrice: 2000, amount: 2000 },
          { description: "Brand guidelines revisions", quantity: 5, unitPrice: 500, amount: 2500 },
        ],
      },
    },
  });

  console.log("Seed complete:");
  console.log("  Owner login:  owner@demo.com / password123");
  console.log("  Member login: member@demo.com / password123");
  console.log("  Client portal login: client@demo.com / clientpass123");
  console.log(`  Account: ${account.name} (${account.id})`);
  console.log(`  First invoice: ${invoice1.number}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
