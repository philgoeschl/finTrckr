import useSWR, { mutate } from "swr";
import { Entry, EntryInput, ImportResult } from "@/types";

const ENTRIES_KEY = "/api/entries";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useEntries() {
  const { data, error, isLoading } = useSWR<Entry[]>(ENTRIES_KEY, fetcher);
  return { entries: data ?? [], error, isLoading };
}

export async function createEntry(input: EntryInput): Promise<Entry> {
  const res = await fetch(ENTRIES_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create entry");
  }
  const entry: Entry = await res.json();
  await mutate(ENTRIES_KEY);
  return entry;
}

export async function updateEntry(id: string, input: EntryInput): Promise<Entry> {
  const res = await fetch(`${ENTRIES_KEY}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update entry");
  }
  const entry: Entry = await res.json();
  await mutate(ENTRIES_KEY);
  return entry;
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`${ENTRIES_KEY}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete entry");
  await mutate(ENTRIES_KEY);
}

export async function importCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/import", { method: "POST", body: formData });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Import failed");
  }
  const result: ImportResult = await res.json();
  await mutate(ENTRIES_KEY);
  return result;
}

export function exportCsv() {
  window.open("/api/export", "_blank");
}
