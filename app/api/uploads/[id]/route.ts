import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile, readStoredFile } from "@/lib/storage";

async function canAccessFile(
  file: { accountId: string; clientId: string | null },
  session: Session | null
) {
  if (!session?.user) return false;
  if (session.user.role === "CLIENT") {
    return !!session.user.clientId && session.user.clientId === file.clientId;
  }
  return session.user.accountId === file.accountId;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();

  const file = await prisma.fileUpload.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!(await canAccessFile(file, session))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await readStoredFile(file.storagePath);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
      "Content-Length": String(file.size),
    },
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await auth();
  const role = session?.user?.role;

  if (!session?.user || !role || role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = await prisma.fileUpload.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (file.accountId !== session.user.accountId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.fileUpload.delete({ where: { id } });
  await deleteStoredFile(file.storagePath);

  return NextResponse.json({ ok: true });
}
