import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.UPLOAD_DIR || "./uploads"
);

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".msi",
  ".js",
  ".ps1",
]);

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
}

export function isExtensionAllowed(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return !BLOCKED_EXTENSIONS.has(ext);
}

export async function saveUploadedFile(accountId: string, filename: string, buffer: Buffer) {
  const safeName = sanitizeFilename(filename);
  const key = `${randomUUID()}-${safeName}`;
  const dir = path.join(UPLOAD_ROOT, accountId);
  await mkdir(dir, { recursive: true });
  const fullPath = path.join(dir, key);
  await writeFile(fullPath, buffer);
  return path.join(accountId, key); // storagePath stored relative to UPLOAD_ROOT
}

export async function readStoredFile(storagePath: string) {
  const fullPath = path.join(UPLOAD_ROOT, storagePath);
  if (!fullPath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid storage path");
  }
  return readFile(fullPath);
}

export async function deleteStoredFile(storagePath: string) {
  const fullPath = path.join(UPLOAD_ROOT, storagePath);
  if (!fullPath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid storage path");
  }
  await unlink(fullPath).catch(() => {});
}
