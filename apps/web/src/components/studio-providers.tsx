"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, Toaster } from "@devlab-ai-studio/ui";
import { StudioWebDefaults } from "@/constants/routes.constants";
import { ActiveAppProvider } from "./active-app-context";

export function StudioProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: StudioWebDefaults.QUERY_STALE_TIME_MS,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider brand="ai-studio" attribute="data-theme" defaultTheme="dark" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ActiveAppProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </ActiveAppProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
