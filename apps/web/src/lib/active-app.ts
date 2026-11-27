"use client";

import { createContext, useContext } from "react";
import type { StudioConsumerApp } from "@/lib/studio-api";

export interface ActiveAppContextValue {
  apps: StudioConsumerApp[];
  activeAppSlug: string;
  setActiveAppSlug: (slug: string) => void;
  isLoadingApps: boolean;
}

export const ActiveAppContext = createContext<ActiveAppContextValue>({
  apps: [],
  activeAppSlug: "",
  setActiveAppSlug: () => undefined,
  isLoadingApps: false,
});

export function useActiveApp(): ActiveAppContextValue {
  return useContext(ActiveAppContext);
}
