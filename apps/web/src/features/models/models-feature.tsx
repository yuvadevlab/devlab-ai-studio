"use client";

import { useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Boxes,
  Button,
  EmptyState,
  LoadingState,
  Plus,
  SearchInput,
  StudioPageHeader,
  StudioPanel,
  StudioSelectField,
  toast,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebDefaults, StudioWebRoute } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import {
  deleteModel,
  fetchModels,
  fetchProviders,
  upsertModel,
  type StudioModel,
} from "@/lib/studio-api";
import { notifyStudioError } from "@/lib/studio-error";
import { ModelFormDrawer } from "./model-drawer";
import { ModelsTable } from "./models-table";

const ALL_PROVIDERS_FILTER = "__all__";

/** Model catalog screen displaying registered models, optionally scoped to a provider slug. */
export function ModelsFeature({ providerSlug }: { providerSlug?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>(ALL_PROVIDERS_FILTER);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StudioModel | null>(null);

  const [providerId, setProviderId] = useState("");
  const [modelId, setModelId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [contextWindow, setContextWindow] = useState(
    String(StudioWebDefaults.DEFAULT_MODEL_CONTEXT),
  );
  const [costIn, setCostIn] = useState("0");
  const [costOut, setCostOut] = useState("0");
  const [isDeprecated, setIsDeprecated] = useState(false);

  const { data: providers = [] } = useQuery({
    queryKey: [StudioQueryKey.PROVIDERS],
    queryFn: fetchProviders,
  });

  const { data: models = [], isLoading } = useQuery({
    queryKey: [StudioQueryKey.MODELS],
    queryFn: fetchModels,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      upsertModel({
        providerId,
        modelId: modelId.trim(),
        displayName: displayName.trim(),
        capabilities: {},
        contextWindow: Number(contextWindow) || StudioWebDefaults.DEFAULT_MODEL_CONTEXT,
        inputCostPer1M: Number(costIn) || 0,
        outputCostPer1M: Number(costOut) || 0,
        isActive: true,
        isDeprecated,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.MODELS] });
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.MODELS.MODEL_SAVED);
      setDrawerOpen(false);
    },
    onError: (err: Error) => notifyStudioError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.MODELS] });
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.MODELS.MODEL_DELETED);
    },
    onError: (err: Error) => notifyStudioError(err),
  });

  const scopedProvider = providerSlug
    ? providers.find((provider) => provider.slug === providerSlug)
    : undefined;

  const openDrawer = (model?: StudioModel) => {
    setEditing(model ?? null);
    setProviderId(model?.providerId ?? scopedProvider?.id ?? providers[0]?.id ?? "");
    setModelId(model?.modelId ?? "");
    setDisplayName(model?.displayName ?? "");
    setContextWindow(String(model?.contextWindow ?? StudioWebDefaults.DEFAULT_MODEL_CONTEXT));
    setCostIn(String(model?.inputCostPer1M ?? 0));
    setCostOut(String(model?.outputCostPer1M ?? 0));
    setIsDeprecated(model?.isDeprecated ?? false);
    setDrawerOpen(true);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const filteredModels = models.filter((model) => {
    if (providerSlug) {
      const matchesSlug = model.provider?.slug === providerSlug;
      const matchesId = scopedProvider ? model.providerId === scopedProvider.id : false;
      if (!matchesSlug && !matchesId) return false;
    } else if (providerFilter !== ALL_PROVIDERS_FILTER && model.providerId !== providerFilter) {
      return false;
    }
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      model.displayName.toLowerCase().includes(term) ||
      model.modelId.toLowerCase().includes(term) ||
      (model.provider?.name.toLowerCase().includes(term) ?? false)
    );
  });

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.MODELS.EYEBROW}
        title={scopedProvider ? `${scopedProvider.name} models` : STUDIO_WEB_COPY.MODELS.TITLE}
        count={providerSlug ? filteredModels.length : models.length}
        subtitle={STUDIO_WEB_COPY.MODELS.SUBTITLE}
        action={
          <Button onClick={() => openDrawer()} disabled={providers.length === 0}>
            <Plus size={15} /> {STUDIO_WEB_COPY.MODELS.ADD_CTA}
          </Button>
        }
      />

      <StudioPanel
        title={scopedProvider ? scopedProvider.name : STUDIO_WEB_COPY.MODELS.TITLE}
        headerAction={
          <div className="studio-filter-controls">
            {providerSlug ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(StudioWebRoute.MODELS)}
              >
                {STUDIO_WEB_COPY.MODELS.ALL_PROVIDERS}
              </Button>
            ) : (
              <div className="studio-filter-box">
                <StudioSelectField
                  ariaLabel={STUDIO_WEB_COPY.MODELS.FIELD_PROVIDER}
                  value={providerFilter}
                  onValueChange={setProviderFilter}
                  placeholder={STUDIO_WEB_COPY.MODELS.ALL_PROVIDERS}
                  options={[
                    { value: ALL_PROVIDERS_FILTER, label: STUDIO_WEB_COPY.MODELS.ALL_PROVIDERS },
                    ...providers.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
              </div>
            )}
            <SearchInput
              wrapperClassName="studio-search-box"
              aria-label={STUDIO_WEB_COPY.MODELS.SEARCH_PLACEHOLDER}
              placeholder={STUDIO_WEB_COPY.MODELS.SEARCH_PLACEHOLDER}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        }
      >
        {isLoading ? (
          <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
        ) : filteredModels.length === 0 ? (
          <EmptyState
            icon={<Boxes size={19} />}
            title={STUDIO_WEB_COPY.MODELS.EMPTY_TITLE}
            description={STUDIO_WEB_COPY.MODELS.EMPTY_DESC}
            action={
              providers.length > 0 ? (
                <Button onClick={() => openDrawer()}>
                  <Plus size={14} /> {STUDIO_WEB_COPY.MODELS.ADD_CTA}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <ModelsTable
            models={filteredModels}
            deleting={deleteMutation.isPending}
            onEdit={openDrawer}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        )}
      </StudioPanel>

      <ModelFormDrawer
        open={drawerOpen}
        editing={editing}
        providers={providers}
        providerId={providerId}
        modelId={modelId}
        displayName={displayName}
        contextWindow={contextWindow}
        costIn={costIn}
        costOut={costOut}
        isDeprecated={isDeprecated}
        pending={saveMutation.isPending}
        onProviderChange={setProviderId}
        onModelIdChange={setModelId}
        onDisplayNameChange={setDisplayName}
        onContextWindowChange={setContextWindow}
        onCostInChange={setCostIn}
        onCostOutChange={setCostOut}
        onDeprecatedChange={setIsDeprecated}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
