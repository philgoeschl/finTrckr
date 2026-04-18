import { z } from "zod";

export const entryInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  total: z.coerce.number({ invalid_type_error: "Total must be a number" }),
  capital: z.coerce.number({ invalid_type_error: "Capital must be a number" }),
  gain: z.coerce.number({ invalid_type_error: "Gain must be a number" }),
  gainPct: z.coerce.number({ invalid_type_error: "Gain % must be a number" }),
  freeCash: z.coerce
    .number({ invalid_type_error: "Free cash must be a number" })
    .optional()
    .nullable(),
  comment: z.string().max(2000).optional().nullable(),
});

export type EntryInput = z.infer<typeof entryInputSchema>;
