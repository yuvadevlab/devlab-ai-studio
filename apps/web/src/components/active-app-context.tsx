"use client";

import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudioStorageKey } from "@/constants/routes.constants";
import { ActiveAppContext } from "@/lib/active-app";
import { fetchApps } from "@/lib/studio-api";

const STORAGE_EVENT = "devlab-active-app-change";

function subscribeToStorage(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getStoredSlug(): string {
  return window.localStorage.getItem(StudioStorageKey.ACTIVE_APP_SLUG) ?? "";
}

function getServerSlug(): string {
  return "";
}

export function ActiveAppProvider({ children }: { children: ReactNode }) {
  const storedSlug = useSyncExternalStore(subscribeToStorage, getStoredSlug, getServerSlug);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["studio", "apps"],
    queryFn: fetchApps,
    retry: 1,
  });

  const activeAppSlug = useMemo(() => {
    if (storedSlug && apps.some((a) => a.slug === storedSlug)) {
      return storedSlug;
    }
    return apps[0]?.slug ?? "";
  }, [apps, storedSlug]);

  const setActiveAppSlug = useCallback((slug: string) => {
    window.localStorage.setItem(StudioStorageKey.ACTIVE_APP_SLUG, slug);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return (
    <ActiveAppContext.Provider
      value={{
        apps,
        activeAppSlug,
        setActiveAppSlug,
        isLoadingApps: isLoading,
      }}
    >
      {children}
    </ActiveAppContext.Provider>
  );
}
