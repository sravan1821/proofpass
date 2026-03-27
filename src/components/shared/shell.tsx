import type { ReactNode } from "react";

import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
