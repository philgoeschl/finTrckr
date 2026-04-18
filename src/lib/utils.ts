import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EUR_FORMATTER = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return EUR_FORMATTER.format(Number(value));
}

export function formatPct(value: number | string | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toFixed(decimals)} %`;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().slice(0, 10);
}

export function deltaBadgeVariant(value: number): "default" | "destructive" | "secondary" {
  if (value > 0) return "default";
  if (value < 0) return "destructive";
  return "secondary";
}

