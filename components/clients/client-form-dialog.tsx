"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createClientAction, updateClientAction, type ActionState } from "@/app/dashboard/clients/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ClientData = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  notes: string | null;
};

export function ClientFormDialog({ client }: { client?: ClientData }) {
  const [open, setOpen] = useState(false);
  const action = client ? updateClientAction.bind(null, client.id) : createClientAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (open && state !== undefined && !state.error) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={client ? <Button variant="outline" size="sm" /> : <Button size="sm" />}
      >
        {client ? (
          "Edit"
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Add client
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "Add a client"}</DialogTitle>
          <DialogDescription>
            {client ? "Update this client's details." : "Add a new client to your workspace."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={client?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={client?.email} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" defaultValue={client?.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={client?.notes ?? ""} rows={3} />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : client ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
