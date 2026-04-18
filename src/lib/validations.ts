import { z } from "zod";

export const entryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  total: z.coerce.number({ invalid_type_error: "Total must be a number" }).optional().nullable(),
  capital: z.coerce.number({ invalid_type_error: "Invested cash must be a number" }).optional().nullable(),
  gain: z.coerce.number({ invalid_type_error: "Gain must be a number" }),
  gainPct: z.coerce.number({ invalid_type_error: "Gain % must be a number" }),
  freeCash: z.coerce
    .number({ invalid_type_error: "Free cash must be a number" })
    .optional()
    .nullable(),
  comment: z.string().max(2000).optional().nullable(),
});

export type EntryInput = z.infer<typeof entryInputSchema>;
