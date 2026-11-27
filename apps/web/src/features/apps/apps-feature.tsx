"use client";

import { useMemo, useState, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  LoadingState,
  Plus,
  SearchInput,
  SecretRevealCard,
  StudioPageHeader,
  StudioPanel,
  toast,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import {
  createApp,
  deleteApp,
  fetchApps,
  rotateAppKey,
  updateApp,
  type StudioConsumerApp,
} from "@/lib/studio-api";
import { AppDrawer } from "./app-drawer";
import { AppsTable } from "./apps-table";

/** Consumer apps registry feature with search, edit/create drawer, and key rotation. */
export function AppsFeature() {
  const queryClient = useQueryClient();
  const { setActiveAppSlug } = useActiveApp();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StudioConsumerApp | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [budget, setBudget] = useState(String(StudioWebDefaults.DEFAULT_MONTHLY_BUDGET_USD));
  const [isActive, setIsActive] = useState(true);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: [StudioQueryKey.APPS],
    queryFn: fetchApps,
  });

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter(
      (app) => app.name.toLowerCase().includes(q) || app.slug.toLowerCase().includes(q),
    );
  }, [apps, search]);

  const createMutation = useMutation({
    mutationFn: () =>
      createApp({
        slug: slug.trim(),
        name: name.trim(),
        ownerEmail: ownerEmail.trim(),
        ...(endpoint.trim() ? { mcpEndpointUrl: endpoint.trim() } : {}),
        monthlyBudgetUsd: Number(budget) || StudioWebDefaults.DEFAULT_MONTHLY_BUDGET_USD,
      }),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.APPS] });
      setIssuedKey(res.appKey);
      setActiveAppSlug(res.app.slug);
      setDrawerOpen(false);
      toast.success(STUDIO_WEB_COPY.APPS.APP_CREATED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateApp(editing?.slug ?? "", {
        name: name.trim(),
        ownerEmail: ownerEmail.trim(),
        mcpEndpointUrl: endpoint.trim() || null,
        monthlyBudgetUsd: Number(budget) || StudioWebDefaults.DEFAULT_MONTHLY_BUDGET_USD,
        isActive,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.APPS] });
      setDrawerOpen(false);
      toast.success(STUDIO_WEB_COPY.APPS.APP_UPDATED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (appSlug: string) => deleteApp(appSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.APPS] });
      toast.success(STUDIO_WEB_COPY.APPS.APP_DELETED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rotateMutation = useMutation({
    mutationFn: (appSlug: string) => rotateAppKey(appSlug),
    onSuccess: (res) => {
      setIssuedKey(res.appKey);
      void navigator.clipboard?.writeText(res.appKey).catch(() => undefined);
      toast.success(STUDIO_WEB_COPY.APPS.KEY_ROTATED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openDrawer = (app?: StudioConsumerApp) => {
    setEditing(app ?? null);
    setName(app?.name ?? "");
    setSlug(app?.slug ?? "");
    setOwnerEmail(app?.ownerEmail ?? "");
    setEndpoint(app?.mcpEndpointUrl ?? "");
    setBudget(String(app?.monthlyBudgetUsd ?? StudioWebDefaults.DEFAULT_MONTHLY_BUDGET_USD));
    setIsActive(app?.isActive ?? true);
    setDrawerOpen(true);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.APPS.EYEBROW}
        title={STUDIO_WEB_COPY.APPS.TITLE}
        count={apps.length}
        subtitle={STUDIO_WEB_COPY.APPS.SUBTITLE}
        action={
          <Button onClick={() => openDrawer()}>
            <Plus size={15} /> {STUDIO_WEB_COPY.APPS.ADD_CTA}
          </Button>
        }
      />

      {issuedKey ? (
        <SecretRevealCard
          title={STUDIO_WEB_COPY.APPS.KEY_REVEAL_TITLE}
          secret={issuedKey}
          warningMessage={STUDIO_WEB_COPY.APPS.KEY_REVEAL_WARNING}
        />
      ) : null}

      <StudioPanel
        title={STUDIO_WEB_COPY.APPS.PANEL_TITLE}
        description={STUDIO_WEB_COPY.APPS.PANEL_SUBTITLE}
        headerAction={
          <SearchInput
            wrapperClassName="studio-search-box"
            aria-label={STUDIO_WEB_COPY.APPS.SEARCH_PLACEHOLDER}
            placeholder={STUDIO_WEB_COPY.APPS.SEARCH_PLACEHOLDER}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      >
        {isLoading ? (
          <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
        ) : (
          <AppsTable
            apps={filteredApps}
            onCreate={() => openDrawer()}
            onEdit={openDrawer}
            onRotateKey={(appSlug) => rotateMutation.mutate(appSlug)}
            onDelete={(appSlug) => deleteMutation.mutate(appSlug)}
          />
        )}
      </StudioPanel>

      <AppDrawer
        open={drawerOpen}
        editing={editing}
        name={name}
        slug={slug}
        ownerEmail={ownerEmail}
        endpoint={endpoint}
        budget={budget}
        isActive={isActive}
        pending={createMutation.isPending || updateMutation.isPending}
        onNameChange={setName}
        onSlugChange={setSlug}
        onOwnerEmailChange={setOwnerEmail}
        onEndpointChange={setEndpoint}
        onBudgetChange={setBudget}
        onActiveChange={setIsActive}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
