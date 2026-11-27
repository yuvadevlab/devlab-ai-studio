"use client";

import { useState, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  EmptyState,
  LoadingState,
  Plus,
  Server,
  StudioPageHeader,
  StudioPanel,
  StudioProviderAccent,
  StudioProviderCard,
  toast,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import {
  deleteProvider,
  fetchModels,
  fetchProviders,
  updateProvider,
  upsertModel,
  upsertProvider,
  type StudioProvider,
} from "@/lib/studio-api";
import { ProviderFormDrawer, ProviderModelsDrawer } from "./provider-drawers";

function resolveProviderAccent(slug: string): StudioProviderAccent {
  if (slug.includes("anthropic") || slug.includes("claude")) return StudioProviderAccent.COPPER;
  if (slug.includes("google") || slug.includes("gemini")) return StudioProviderAccent.SKY;
  if (slug.includes("mistral")) return StudioProviderAccent.SLATE;
  return StudioProviderAccent.INDIGO;
}

/** Providers & Model Catalog feature with slide-over drawers backed by Control Plane API. */
export function ProvidersFeature() {
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<StudioProvider | null>(null);
  const [modelsProvider, setModelsProvider] = useState<StudioProvider | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [baseUrl, setBaseUrl] = useState<string>(StudioWebDefaults.DEFAULT_BASE_URL);
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [modelId, setModelId] = useState("");
  const [modelName, setModelName] = useState("");
  const [contextWindow, setContextWindow] = useState(
    String(StudioWebDefaults.DEFAULT_MODEL_CONTEXT),
  );
  const [costIn, setCostIn] = useState("0");
  const [costOut, setCostOut] = useState("0");

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
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (provider: StudioProvider) =>
      updateProvider(provider.slug, { isActive: !provider.isActive }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (providerSlug: string) => deleteProvider(providerSlug),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.PROVIDERS.PROVIDER_DELETED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveModelMutation = useMutation({
    mutationFn: () =>
      upsertModel({
        providerId: modelsProvider?.id ?? "",
        modelId: modelId.trim(),
        displayName: modelName.trim(),
        capabilities: {},
        contextWindow: Number(contextWindow) || StudioWebDefaults.DEFAULT_MODEL_CONTEXT,
        inputCostPer1M: Number(costIn) || 0,
        outputCostPer1M: Number(costOut) || 0,
        isActive: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.MODELS] });
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROVIDERS] });
      toast.success(STUDIO_WEB_COPY.PROVIDERS.MODEL_SAVED);
      setModelId("");
      setModelName("");
    },
    onError: (err: Error) => toast.error(err.message),
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

  const handleModelSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveModelMutation.mutate();
  };

  const providerModels = models.filter((m) => m.providerId === modelsProvider?.id);

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

      {isLoading ? (
        <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
      ) : providers.length === 0 ? (
        <StudioPanel>
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
        </StudioPanel>
      ) : (
        <div className="studio-provider-grid">
          {providers.map((provider) => (
            <StudioProviderCard
              key={provider.id}
              name={provider.name}
              slug={provider.slug}
              isActive={provider.isActive}
              modelCount={
                provider._count?.models ?? models.filter((m) => m.providerId === provider.id).length
              }
              keyPreview={provider.keyMask ?? STUDIO_WEB_COPY.PROVIDERS.KEY_UNSET}
              accent={resolveProviderAccent(provider.slug)}
              labels={{
                modelsLabel: STUDIO_WEB_COPY.PROVIDERS.MODELS_LABEL,
                keyLabel: STUDIO_WEB_COPY.PROVIDERS.KEY_LABEL,
                activeLabel: STUDIO_WEB_COPY.COMMON.ACTIVE,
                inactiveLabel: STUDIO_WEB_COPY.COMMON.INACTIVE,
                editLabel: STUDIO_WEB_COPY.PROVIDERS.EDIT_ACTION,
                toggleLabel: provider.isActive
                  ? STUDIO_WEB_COPY.PROVIDERS.DEACTIVATE_ACTION
                  : STUDIO_WEB_COPY.PROVIDERS.ACTIVATE_ACTION,
                deleteLabel: STUDIO_WEB_COPY.PROVIDERS.DELETE_ACTION,
                manageModelsLabel: STUDIO_WEB_COPY.PROVIDERS.MANAGE_MODELS,
                actionsAriaLabel: `${STUDIO_WEB_COPY.PROVIDERS.EDIT_ACTION} ${provider.name}`,
              }}
              onEdit={() => openDrawer(provider)}
              onToggle={() => toggleMutation.mutate(provider)}
              onDelete={() => deleteMutation.mutate(provider.slug)}
              onManageModels={() => setModelsProvider(provider)}
            />
          ))}
        </div>
      )}

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

      <ProviderModelsDrawer
        provider={modelsProvider}
        models={providerModels}
        modelId={modelId}
        modelName={modelName}
        contextWindow={contextWindow}
        costIn={costIn}
        costOut={costOut}
        pending={saveModelMutation.isPending}
        onModelIdChange={setModelId}
        onModelNameChange={setModelName}
        onContextWindowChange={setContextWindow}
        onCostInChange={setCostIn}
        onCostOutChange={setCostOut}
        onClose={() => setModelsProvider(null)}
        onSubmit={handleModelSubmit}
      />
    </div>
  );
}
