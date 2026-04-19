import { z } from "zod";

function requireNumber(msg: string) {
  return z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number({ invalid_type_error: msg }).finite(msg)
  );
}

function optionalNumber(msg: string) {
  return z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.coerce.number({ invalid_type_error: msg }).finite(msg).nullable().optional()
  );
}

export const entryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  capital: requireNumber("Capital is required"),
  gain: requireNumber("Gain is required"),
  gainPct: requireNumber("Gain % is required"),
  freeCash: optionalNumber("Available cash must be a number").pipe(
    z.number().nonnegative("Available cash cannot be negative").nullable().optional()
  ),
  total: optionalNumber("Total must be a number"),
  comment: z.string().max(2000).optional().nullable(),
});

export type EntryInput = z.infer<typeof entryInputSchema>;
