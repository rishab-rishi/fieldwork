"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import {
  createProjectAction,
  updateProjectAction,
  type ActionState,
} from "@/app/dashboard/projects/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ProjectData = {
  id: string;
  name: string;
  clientId: string;
  description: string | null;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  budget: string | null;
  startDate: Date | null;
  dueDate: Date | null;
};

function toInputDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ProjectFormDialog({
  clients,
  project,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  project?: ProjectData;
  defaultClientId?: string;
}) {
  const [open, setOpen] = useState(false);
  const action = project ? updateProjectAction.bind(null, project.id) : createProjectAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (open && state !== undefined && !state.error) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={project ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {project ? (
          "Edit"
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            New project
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {project ? "Update the project details." : "Track a new project for a client."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" name="name" defaultValue={project?.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select name="clientId" defaultValue={project?.clientId ?? defaultClientId}>
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={project?.status ?? "ACTIVE"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="ON_HOLD">On hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={project?.description ?? ""} rows={3} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" defaultValue={project?.budget ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={toInputDate(project?.startDate ?? null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={toInputDate(project?.dueDate ?? null)}
              />
            </div>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
