"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entryInputSchema, EntryInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Entry } from "@/types";

interface EntryFormProps {
  initial?: Entry;
  onSubmit: (data: EntryInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EntryForm({ initial, onSubmit, onCancel, isSubmitting }: EntryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EntryInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(entryInputSchema) as any,
    defaultValues: initial
      ? {
          date: String(initial.date).slice(0, 10),
          total: initial.total,
          capital: initial.capital,
          gain: initial.gain,
          gainPct: initial.gainPct,
          freeCash: initial.freeCash ?? undefined,
          comment: initial.comment ?? undefined,
        }
      : { date: new Date().toISOString().slice(0, 10) },
  });

  useEffect(() => {
    if (initial) {
      reset({
        date: String(initial.date).slice(0, 10),
        total: initial.total,
        capital: initial.capital,
        gain: initial.gain,
        gainPct: initial.gainPct,
        freeCash: initial.freeCash ?? undefined,
        comment: initial.comment ?? undefined,
      });
    }
  }, [initial, reset]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="total">Total (EUR)</Label>
          <Input id="total" type="number" step="0.01" {...register("total")} />
          {errors.total && <p className="text-xs text-destructive">{errors.total.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="capital">Capital w/o Gain (EUR)</Label>
          <Input id="capital" type="number" step="0.01" {...register("capital")} />
          {errors.capital && <p className="text-xs text-destructive">{errors.capital.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="gain">Gain (EUR)</Label>
          <Input id="gain" type="number" step="0.01" {...register("gain")} />
          {errors.gain && <p className="text-xs text-destructive">{errors.gain.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="gainPct">Gain (%)</Label>
          <Input id="gainPct" type="number" step="0.0001" {...register("gainPct")} />
          {errors.gainPct && <p className="text-xs text-destructive">{errors.gainPct.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="freeCash">Free Cash (EUR, optional)</Label>
          <Input id="freeCash" type="number" step="0.01" {...register("freeCash")} />
          {errors.freeCash && <p className="text-xs text-destructive">{String(errors.freeCash.message)}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea id="comment" rows={2} {...register("comment")} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : initial ? "Update" : "Add Entry"}
        </Button>
      </div>
    </form>
  );
}
