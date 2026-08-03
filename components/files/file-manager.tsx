"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { File, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes, formatDate } from "@/lib/format";

export type FileRecord = {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: string | Date;
  uploadedBy: { name: string };
};

export function FileManager({
  files: initialFiles,
  clientId,
  projectId,
  canDelete,
}: {
  files: FileRecord[];
  clientId?: string;
  projectId?: string;
  canDelete: boolean;
}) {
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (clientId) formData.append("clientId", clientId);
      if (projectId) formData.append("projectId", projectId);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      setFiles((prev) => [data.file, ...prev]);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/uploads/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete file");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success("File deleted");
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Files</p>
        <div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {files.length === 0 ? (
        <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
          No files uploaded yet.
        </p>
      ) : (
        <ul className="divide-y rounded-md border">
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <a
                    href={`/api/uploads/${file.id}`}
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {file.filename}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(file.size)} · {file.uploadedBy.name} · {formatDate(file.createdAt)}
                  </p>
                </div>
              </div>
              {canDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() => handleDelete(file.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
