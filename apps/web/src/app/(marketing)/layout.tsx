import type { ReactNode } from "react";
import { MarketingShell } from "@/features/marketing/marketing-shell";

/**
 * Public marketing route group layout wrapping landing and capability pages.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingShell>{children}</MarketingShell>;
}
