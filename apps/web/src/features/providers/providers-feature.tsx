"use client";

import { useState, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  LoadingState,
  Plus,
  SearchInput,
  Server,
  StudioPageHeader,
  StudioPanel,
  toast,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import {
  deleteProvider,
  fetchModels,
  fetchProviders,
  updateProvider,
  upsertProvider,
  type StudioProvider,
} from "@/lib/studio-api";
import { notifyStudioError } from "@/lib/studio-error";
import { ProviderFormDrawer } from "./provider-drawers";
import { ProvidersTable } from "./providers-table";

/** Providers management feature with table view and slide-over drawer. */
export function ProvidersFeature() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StudioProvider | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [baseUrl, setBaseUrl] = useState<string>(StudioWebDefaults.DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: [StudioQueryKey.PROVIDERS],
    queryFn: fetchProviders,
  });

  const { data: models = [] } = useQuery({
    queryKey: [StudioQueryKey.MODELS],
    queryFn: fetchModels,
  });

  const saveProviderMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateProvider(editing.slug, {
            name: name.trim(),
            baseUrl: baseUrl.trim(),
            isActive,
            ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          })
        : upsertProvider({
            slug: slug.trim(),
            name: name.trim(),
            baseUrl: baseUrl.trim(),
            isActive,
            ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.PROVIDERS.PROVIDER_SAVED);
      setDrawerOpen(false);
    },
    onError: (err: Error) => notifyStudioError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (providerSlug: string) => deleteProvider(providerSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.PROVIDERS.PROVIDER_DELETED);
    },
    onError: (err: Error) => notifyStudioError(err),
  });

  const openDrawer = (provider?: StudioProvider) => {
    setEditing(provider ?? null);
    setName(provider?.name ?? "");
    setSlug(provider?.slug ?? "");
    setBaseUrl(provider?.baseUrl ?? StudioWebDefaults.DEFAULT_BASE_URL);
    setApiKey("");
    setIsActive(provider?.isActive ?? true);
    setDrawerOpen(true);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveProviderMutation.mutate();
  };

  const modelCounts = new Map<string, number>();
  for (const model of models) {
    modelCounts.set(model.providerId, (modelCounts.get(model.providerId) ?? 0) + 1);
  }

  const filteredProviders = providers.filter((provider) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      provider.name.toLowerCase().includes(term) ||
      provider.slug.toLowerCase().includes(term) ||
      provider.baseUrl.toLowerCase().includes(term)
    );
  });

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.PROVIDERS.EYEBROW}
        title={STUDIO_WEB_COPY.PROVIDERS.TITLE}
        count={providers.length}
        subtitle={STUDIO_WEB_COPY.PROVIDERS.SUBTITLE}
        action={
          <Button onClick={() => openDrawer()}>
            <Plus size={15} /> {STUDIO_WEB_COPY.PROVIDERS.ADD_CTA}
          </Button>
        }
      />

      <StudioPanel
        title={STUDIO_WEB_COPY.PROVIDERS.TITLE}
        headerAction={
          <SearchInput
            wrapperClassName="studio-search-box"
            aria-label={STUDIO_WEB_COPY.PROVIDERS.SEARCH_PLACEHOLDER}
            placeholder={STUDIO_WEB_COPY.PROVIDERS.SEARCH_PLACEHOLDER}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        }
      >
        {isLoading ? (
          <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
        ) : filteredProviders.length === 0 ? (
          <EmptyState
            icon={<Server size={19} />}
            title={STUDIO_WEB_COPY.PROVIDERS.EMPTY_TITLE}
            description={STUDIO_WEB_COPY.PROVIDERS.EMPTY_DESC}
            action={
              <Button onClick={() => openDrawer()}>
                <Plus size={14} /> {STUDIO_WEB_COPY.PROVIDERS.ADD_CTA}
              </Button>
            }
          />
        ) : (
          <ProvidersTable
            providers={filteredProviders}
            modelCounts={modelCounts}
            pending={deleteMutation.isPending}
            onEdit={openDrawer}
            onDelete={(providerSlug) => deleteMutation.mutate(providerSlug)}
          />
        )}
      </StudioPanel>

      <ProviderFormDrawer
        open={drawerOpen}
        editing={editing}
        name={name}
        slug={slug}
        baseUrl={baseUrl}
        apiKey={apiKey}
        isActive={isActive}
        pending={saveProviderMutation.isPending}
        onNameChange={setName}
        onSlugChange={setSlug}
        onBaseUrlChange={setBaseUrl}
        onApiKeyChange={setApiKey}
        onActiveChange={setIsActive}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
