"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface YearFilterProps {
  years: number[];
  selected: number | null;
}

export function YearFilter({ years, selected }: YearFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(year: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (year === null || year === selected) {
      params.delete("year");
    } else {
      params.set("year", String(year));
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  }

  if (years.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-none px-6 pb-2">
      <div className="flex w-max gap-2">
        <Button
          size="sm"
          variant={selected === null ? "default" : "ghost"}
          onClick={() => select(null)}
        >
          All
        </Button>
        {years.map((year) => (
          <Button
            key={year}
            size="sm"
            variant={selected === year ? "default" : "ghost"}
            onClick={() => select(year)}
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );
}
