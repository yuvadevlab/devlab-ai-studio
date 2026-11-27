import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioShell } from "@/components/studio-shell";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
