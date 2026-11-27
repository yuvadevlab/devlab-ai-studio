import type { Metadata } from "next";
import type { ReactNode } from "react";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { StudioProviders } from "@/components/studio-providers";
import { StudioShell } from "@/components/studio-shell";
import "./globals.css";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: STUDIO_WEB_COPY.BRAND.NAME,
  description: STUDIO_WEB_COPY.BRAND.TAGLINE,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <StudioProviders>
          <StudioShell>{children}</StudioShell>
        </StudioProviders>
      </body>
    </html>
  );
}
