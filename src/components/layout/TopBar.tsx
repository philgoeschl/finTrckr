"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobileNav } from "./MobileNavContext";

interface TopBarProps {
  title: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  const { toggle } = useMobileNav();

  return (
    <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
