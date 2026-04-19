"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntryDialog } from "./EntryDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { createEntry, updateEntry, deleteEntry } from "@/hooks/useEntries";
import { EntryInput } from "@/lib/validations";
import { Entry } from "@/types";
import { formatEur, formatPct, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface EntryTableProps {
  entries: Entry[];
}

export function EntryTable({ entries }: EntryTableProps) {
  const [editEntry, setEditEntry] = useState<Entry | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Entry | undefined>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function openEdit(entry: Entry) {
    setEditEntry(entry);
    setEditOpen(true);
  }

  function openDelete(entry: Entry) {
    setDeleteTarget(entry);
    setDeleteOpen(true);
  }

  async function handleUpdate(data: EntryInput) {
    if (!editEntry) return;
    try {
      await updateEntry(editEntry.id, data);
      toast.success("Entry updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update entry.");
      throw err;
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEntry(deleteTarget.id);
      toast.success("Entry deleted.");
    } catch {
      toast.error("Failed to delete entry.");
      throw new Error("delete failed");
    }
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        No entries yet. Add your first entry above.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-auto rounded-md border">
        <Table className="min-w-[480px]">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="hidden md:table-cell text-right">Capital</TableHead>
              <TableHead className="hidden md:table-cell text-right">Gain</TableHead>
              <TableHead className="text-right">Gain %</TableHead>
              <TableHead className="hidden md:table-cell text-right">Available Cash</TableHead>
              <TableHead className="hidden sm:table-cell">Comment</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-mono text-sm">{formatDate(entry.date)}</TableCell>
                <TableCell className="text-right font-mono">{formatEur(entry.total)}</TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono">{formatEur(entry.capital)}</TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  <Badge
                    variant="outline"
                    className={
                      entry.gain >= 0
                        ? "border-green-500 text-green-600"
                        : "border-red-500 text-red-600"
                    }
                  >
                    {formatEur(entry.gain)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      entry.gainPct >= 0
                        ? "border-green-500 text-green-600"
                        : "border-red-500 text-red-600"
                    }
                  >
                    {formatPct(entry.gainPct)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-right font-mono">
                  {entry.freeCash !== null ? formatEur(entry.freeCash) : "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-sm text-muted-foreground">
                  {entry.comment ?? ""}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(entry)}
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDelete(entry)}
                      aria-label="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EntryDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        entry={editEntry}
        onSubmit={handleUpdate}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          entryDate={formatDate(deleteTarget.date)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
