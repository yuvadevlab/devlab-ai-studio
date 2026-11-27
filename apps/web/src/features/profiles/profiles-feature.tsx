"use client";

import { useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentCreativityPreset, DEFAULT_AI_FEATURE_FLAGS } from "@devlab-ai-studio/shared-types";
import {
  Bot,
  Button,
  EmptyState,
  LoadingState,
  Plus,
  StudioPageHeader,
  StudioPanel,
  toast,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import {
  createProfileVersion,
  fetchApps,
  fetchModels,
  fetchProfiles,
  publishProfileVersion,
  type StudioProfile,
} from "@/lib/studio-api";
import { ProfilePolicyEditor } from "./profile-policy-editor";

type FeatureFlagKey = keyof typeof DEFAULT_AI_FEATURE_FLAGS;

/** Agent Profiles policy editor feature with versioned drafts and publishing. */
export function ProfilesFeature() {
  const queryClient = useQueryClient();
  const { activeAppSlug } = useActiveApp();

  const { data: apps = [] } = useQuery({ queryKey: [StudioQueryKey.APPS], queryFn: fetchApps });
  const targetSlug = activeAppSlug || apps[0]?.slug || "";

  const { data: models = [] } = useQuery({
    queryKey: [StudioQueryKey.MODELS],
    queryFn: fetchModels,
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: [StudioQueryKey.PROFILES, targetSlug],
    queryFn: () => fetchProfiles(targetSlug),
    enabled: Boolean(targetSlug),
  });

  const [selectedSlug, setSelectedSlug] = useState("");
  const activeProfile: StudioProfile | undefined =
    profiles.find((p) => p.slug === selectedSlug) ?? profiles[0];
  const activeVersion = activeProfile?.versions[0];
  const activePolicy = (activeVersion?.policyJson ?? {}) as Record<string, unknown>;

  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [primaryModelId, setPrimaryModelId] = useState("");
  const [preset, setPreset] = useState<AgentCreativityPreset | null>(null);
  const [maxTurns, setMaxTurns] = useState<number | null>(null);
  const [maxTokens, setMaxTokens] = useState<number | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [featureFlags, setFeatureFlags] = useState({ ...DEFAULT_AI_FEATURE_FLAGS });
  const [fallbacks, setFallbacks] = useState<string[] | null>(null);
  const [fallbackInput, setFallbackInput] = useState("");

  const resolvedPreset =
    preset ??
    (activePolicy.creativityPreset as AgentCreativityPreset | undefined) ??
    AgentCreativityPreset.ANALYTICAL;
  const resolvedMaxTurns = maxTurns ?? Number(activePolicy.maxTurns ?? 8);
  const resolvedMaxTokens = maxTokens ?? Number(activePolicy.maxTokens ?? 4096);
  const resolvedSystemPrompt = systemPrompt ?? activeVersion?.systemPrompt ?? "";
  const resolvedFallbacks =
    fallbacks ??
    (Array.isArray(activePolicy.fallbackModelIds)
      ? (activePolicy.fallbackModelIds as string[])
      : []);
  const resolvedPrimaryModelId =
    primaryModelId || String(activePolicy.primaryModelId ?? models[0]?.id ?? "");

  const selectProfile = (profile: StudioProfile) => {
    setSelectedSlug(profile.slug);
    setSlug(profile.slug);
    setName(profile.name);
    const v = profile.versions[0];
    if (v) {
      const policy = v.policyJson as Record<string, unknown>;
      setPrimaryModelId(String(policy.primaryModelId ?? models[0]?.id ?? ""));
      setPreset(
        (policy.creativityPreset as AgentCreativityPreset) ?? AgentCreativityPreset.ANALYTICAL,
      );
      setMaxTurns(Number(policy.maxTurns ?? 8));
      setMaxTokens(Number(policy.maxTokens ?? 4096));
      setSystemPrompt(v.systemPrompt);
      setFallbacks(
        Array.isArray(policy.fallbackModelIds) ? (policy.fallbackModelIds as string[]) : [],
      );
    }
  };

  const createMutation = useMutation({
    mutationFn: () =>
      createProfileVersion(targetSlug, {
        slug: (slug || activeProfile?.slug || "").trim(),
        name: (name || activeProfile?.name || "").trim(),
        primaryModelId: resolvedPrimaryModelId,
        fallbackModelIds: resolvedFallbacks,
        creativityPreset: resolvedPreset,
        temperature:
          resolvedPreset === AgentCreativityPreset.CREATIVE
            ? 0.7
            : resolvedPreset === AgentCreativityPreset.BALANCED
              ? 0.4
              : 0.1,
        maxTurns: resolvedMaxTurns,
        maxTokens: resolvedMaxTokens,
        featureFlags,
        enabledToolNamespaces: [],
        systemPrompt: resolvedSystemPrompt,
        publish: true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROFILES, targetSlug] });
      toast.success(STUDIO_WEB_COPY.PROFILES.VERSION_CREATED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: ({ profileSlug, versionId }: { profileSlug: string; versionId: string }) =>
      publishProfileVersion(targetSlug, profileSlug, versionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [StudioQueryKey.PROFILES, targetSlug] });
      toast.success(STUDIO_WEB_COPY.PROFILES.VERSION_PUBLISHED);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addFallback = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const val = fallbackInput.trim();
    if (val && !resolvedFallbacks.includes(val)) setFallbacks([...resolvedFallbacks, val]);
    setFallbackInput("");
  };

  const handleSave = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate();
  };

  const startNewProfile = () => {
    setSelectedSlug("__new__");
    setSlug("");
    setName("");
    setPrimaryModelId(models[0]?.id ?? "");
    setPreset(AgentCreativityPreset.ANALYTICAL);
    setMaxTurns(8);
    setMaxTokens(4096);
    setSystemPrompt("");
    setFallbacks([]);
    setFeatureFlags({ ...DEFAULT_AI_FEATURE_FLAGS });
  };

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.PROFILES.EYEBROW}
        title={STUDIO_WEB_COPY.PROFILES.TITLE}
        subtitle={STUDIO_WEB_COPY.PROFILES.SUBTITLE}
        action={
          <Button onClick={startNewProfile} disabled={!targetSlug}>
            <Plus size={15} /> {STUDIO_WEB_COPY.PROFILES.NEW_CTA}
          </Button>
        }
      />

      {!targetSlug ? (
        <EmptyState
          title={STUDIO_WEB_COPY.COMMON.NO_DATA}
          description={STUDIO_WEB_COPY.COMMON.SELECT_APP_PROMPT}
        />
      ) : isLoading ? (
        <LoadingState message={STUDIO_WEB_COPY.COMMON.LOADING} />
      ) : (
        <div className="studio-profile-layout">
          <StudioPanel
            title={STUDIO_WEB_COPY.PROFILES.LIST_TITLE}
            description={`${profiles.length} ${STUDIO_WEB_COPY.PROFILES.CONFIGURE_LABEL}`}
            headerAction={
              <span className="studio-kpi-icon">
                <Bot size={14} />
              </span>
            }
          >
            <div className="studio-profile-list">
              {profiles.map((profile) => {
                const isSelected = selectedSlug !== "__new__" && activeProfile?.id === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    className={`studio-profile-item${isSelected ? " is-selected" : ""}`}
                    onClick={() => selectProfile(profile)}
                  >
                    <Bot size={15} />
                    <span>
                      <strong>{profile.name}</strong>{" "}
                      <small className="studio-muted-label">
                        v{profile.versions[0]?.version ?? 1}
                      </small>
                    </span>
                  </button>
                );
              })}
            </div>
          </StudioPanel>

          <ProfilePolicyEditor
            isNew={selectedSlug === "__new__"}
            activeProfile={activeProfile}
            models={models}
            name={name}
            slug={slug}
            primaryModelId={resolvedPrimaryModelId}
            preset={resolvedPreset}
            maxTurns={resolvedMaxTurns}
            maxTokens={resolvedMaxTokens}
            systemPrompt={resolvedSystemPrompt}
            featureFlags={featureFlags}
            fallbacks={resolvedFallbacks}
            fallbackInput={fallbackInput}
            saving={createMutation.isPending}
            onNameChange={setName}
            onSlugChange={setSlug}
            onPrimaryModelChange={setPrimaryModelId}
            onPresetChange={setPreset}
            onMaxTurnsChange={setMaxTurns}
            onMaxTokensChange={setMaxTokens}
            onSystemPromptChange={setSystemPrompt}
            onToggleFeature={(key: FeatureFlagKey, checked: boolean) =>
              setFeatureFlags((prev) => ({ ...prev, [key]: checked }))
            }
            onRemoveFallback={(id: string) =>
              setFallbacks(resolvedFallbacks.filter((item) => item !== id))
            }
            onFallbackInputChange={setFallbackInput}
            onFallbackKeyDown={addFallback}
            onDiscard={() => {
              if (activeProfile) selectProfile(activeProfile);
            }}
            onPublish={(profileSlug, versionId) =>
              publishMutation.mutate({ profileSlug, versionId })
            }
            onSubmit={handleSave}
          />
        </div>
      )}
    </div>
  );
}
