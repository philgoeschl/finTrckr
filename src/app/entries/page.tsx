"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBar } from "@/components/layout/TopBar";
import { EntryTable } from "@/components/entries/EntryTable";
import { EntryDialog } from "@/components/entries/EntryDialog";
import { YearFilter } from "@/components/YearFilter";
import { useEntries, createEntry, importCsv, exportCsv } from "@/hooks/useEntries";
import { EntryInput } from "@/lib/validations";
import { toast } from "sonner";

function EntriesContent() {
  const { entries, isLoading } = useEntries();
  const searchParams = useSearchParams();
  const [addOpen, setAddOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) || null : null;
  const allYears = [...new Set(entries.map((e) => parseInt(e.date.substring(0, 4))))].sort(
    (a, b) => b - a
  );
  const filtered = selectedYear
    ? entries.filter((e) => parseInt(e.date.substring(0, 4)) === selectedYear)
    : entries;

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
      const result = await importCsv(file);
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
        accept=".csv"
        className="hidden"
        onChange={handleImport}
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Import CSV</span>
      </Button>
      <Button variant="outline" size="sm" onClick={exportCsv}>
        <Download className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Export CSV</span>
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
      <YearFilter years={allYears} selected={selectedYear} />
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Loading…
          </div>
        ) : (
          <EntryTable entries={filtered} />
        )}
      </div>

      <EntryDialog open={addOpen} onOpenChange={setAddOpen} onSubmit={handleCreate} />
    </div>
  );
}

export default function EntriesPage() {
  return (
    <Suspense>
      <EntriesContent />
    </Suspense>
  );
}
