"use client";

import { useRouter } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/dashboard/confirm-delete-button";
import { deleteProjectAction } from "@/app/dashboard/projects/actions";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  return (
    <ConfirmDeleteButton
      itemLabel="project"
      action={() => deleteProjectAction(projectId)}
      onDeleted={() => router.push("/dashboard/projects")}
    />
  );
}
