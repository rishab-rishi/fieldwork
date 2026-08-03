import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isExtensionAllowed, saveUploadedFile, MAX_FILE_SIZE } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  const role = session?.user?.role;
  const accountId = session?.user?.accountId;

  if (!session?.user || !accountId || !role || role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const clientId = formData.get("clientId");
  const projectId = formData.get("projectId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 20MB limit" }, { status: 400 });
  }

  if (!isExtensionAllowed(file.name)) {
    return NextResponse.json({ error: "This file type isn't allowed" }, { status: 400 });
  }

  if (typeof clientId === "string" && clientId) {
    const client = await prisma.client.findFirst({ where: { id: clientId, accountId } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  if (typeof projectId === "string" && projectId) {
    const project = await prisma.project.findFirst({ where: { id: projectId, accountId } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storagePath = await saveUploadedFile(accountId, file.name, buffer);

  const upload = await prisma.fileUpload.create({
    data: {
      accountId,
      clientId: typeof clientId === "string" && clientId ? clientId : null,
      projectId: typeof projectId === "string" && projectId ? projectId : null,
      filename: file.name,
      storagePath,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json({ file: upload }, { status: 201 });
}
