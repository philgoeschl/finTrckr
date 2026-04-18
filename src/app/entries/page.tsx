"use client";

import { useRef, useState } from "react";
import { Plus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { EntryTable } from "@/components/entries/EntryTable";
import { EntryDialog } from "@/components/entries/EntryDialog";
import { useEntries, createEntry, importXlsx, exportCsv } from "@/hooks/useEntries";
import { EntryInput } from "@/lib/validations";
import { toast } from "sonner";

export default function EntriesPage() {
  const { entries, isLoading } = useEntries();
  const [addOpen, setAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCreate(data: EntryInput) {
    try {
      await createEntry(data);
      toast.success("Entry added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add entry.");
      throw err;
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    try {
      const result = await importXlsx(file);
      if (result.errors.length > 0) {
        toast.warning(
          `Imported ${result.imported} rows. ${result.errors.length} row(s) had errors.`
        );
      } else {
        toast.success(`Imported ${result.imported} row(s) successfully.`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed.");
    }
  }

  const actions = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImport}
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-1.5 h-4 w-4" />
        Import XLSX
      </Button>
      <Button variant="outline" size="sm" onClick={exportCsv}>
        <Download className="mr-1.5 h-4 w-4" />
        Export CSV
      </Button>
      <Button size="sm" onClick={() => setAddOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Entry
      </Button>
    </>
  );

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Entries" actions={actions} />
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Loading…
          </div>
        ) : (
          <EntryTable entries={entries} />
        )}
      </div>

      <EntryDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={handleCreate} />
    </div>
  );
}
