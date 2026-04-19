"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { MobileNavProvider, useMobileNav } from "./MobileNavContext";

function LayoutInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useMobileNav();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
        <SheetContent side="left" className="w-56 p-0">
          <Sidebar onClose={close} />
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col overflow-auto">{children}</main>
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <LayoutInner>{children}</LayoutInner>
    </MobileNavProvider>
  );
}
