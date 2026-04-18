"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntryForm } from "./EntryForm";
import { EntryInput } from "@/lib/validations";
import { Entry } from "@/types";

interface EntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: Entry;
  onSubmit: (data: EntryInput) => Promise<void>;
}

export function EntryDialog({ open, onOpenChange, entry, onSubmit }: EntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(data: EntryInput) {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit Entry" : "Add Entry"}</DialogTitle>
        </DialogHeader>
        <EntryForm
          initial={entry}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
