"use client";

import type { KeyboardEvent, SyntheticEvent } from "react";
import { AgentCreativityPreset, DEFAULT_AI_FEATURE_FLAGS } from "@devlab-ai-studio/shared-types";
import {
  Button,
  Check,
  Input,
  RotateCcw,
  Slider,
  SlidersHorizontal,
  StudioFormField,
  StudioPanel,
  StudioSelectField,
  StudioStatusPill,
  StudioStatusTone,
  Switch,
  Textarea,
  X,
} from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioModel, StudioProfile } from "@/lib/studio-api";

const CREATIVITY_PRESETS = [
  AgentCreativityPreset.ANALYTICAL,
  AgentCreativityPreset.BALANCED,
  AgentCreativityPreset.CREATIVE,
] as const;

type FeatureFlagKey = keyof typeof DEFAULT_AI_FEATURE_FLAGS;
const FEATURE_KEYS = Object.keys(DEFAULT_AI_FEATURE_FLAGS) as FeatureFlagKey[];

export interface ProfilePolicyEditorProps {
  isNew: boolean;
  activeProfile: StudioProfile | undefined;
  models: StudioModel[];
  name: string;
  slug: string;
  primaryModelId: string;
  preset: AgentCreativityPreset;
  maxTurns: number;
  maxTokens: number;
  systemPrompt: string;
  featureFlags: Record<FeatureFlagKey, boolean>;
  fallbacks: string[];
  fallbackInput: string;
  saving: boolean;
  onNameChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onPrimaryModelChange: (val: string) => void;
  onPresetChange: (val: AgentCreativityPreset) => void;
  onMaxTurnsChange: (val: number) => void;
  onMaxTokensChange: (val: number) => void;
  onSystemPromptChange: (val: string) => void;
  onToggleFeature: (key: FeatureFlagKey, checked: boolean) => void;
  onRemoveFallback: (id: string) => void;
  onFallbackInputChange: (val: string) => void;
  onFallbackKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onDiscard: () => void;
  onPublish: (profileSlug: string, versionId: string) => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Policy version editor panel built with @yuva-devlab/ui primitives. */
export function ProfilePolicyEditor(props: ProfilePolicyEditorProps) {
  const latestVersion = props.activeProfile?.versions[0];
  const isPublished =
    Boolean(props.activeProfile && latestVersion) &&
    props.activeProfile?.publishedVersionId === latestVersion?.id;

  return (
    <StudioPanel
      className="studio-profile-edit"
      title={
        props.isNew
          ? STUDIO_WEB_COPY.PROFILES.NEW_CTA
          : (props.activeProfile?.name ?? STUDIO_WEB_COPY.PROFILES.NEW_CTA)
      }
      description={props.activeProfile?.slug || props.slug || "—"}
      headerAction={
        props.activeProfile && latestVersion ? (
          <StudioStatusPill
            tone={isPublished ? StudioStatusTone.SUCCESS : StudioStatusTone.WARNING}
            label={
              isPublished
                ? STUDIO_WEB_COPY.PROFILES.PUBLISHED_BADGE
                : STUDIO_WEB_COPY.PROFILES.DRAFT_BADGE
            }
          />
        ) : null
      }
    >
      <form onSubmit={props.onSubmit} className="studio-drawer-form">
        <div className="studio-profile-grid">
          <StudioFormField label={STUDIO_WEB_COPY.PROFILES.FIELD_NAME}>
            <Input
              value={props.name || props.activeProfile?.name || ""}
              required
              onChange={(event) => props.onNameChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROFILES.FIELD_SLUG}>
            <Input
              className="studio-mono"
              value={props.slug || props.activeProfile?.slug || ""}
              required
              onChange={(event) => props.onSlugChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROFILES.FIELD_MODEL}>
            <StudioSelectField
              value={props.primaryModelId || props.models[0]?.id || ""}
              onValueChange={props.onPrimaryModelChange}
              options={props.models.map((m) => ({
                value: m.id,
                label: `${m.displayName} (${m.modelId})`,
              }))}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROFILES.FIELD_CREATIVITY}>
            <div className="studio-preset-group">
              {CREATIVITY_PRESETS.map((choice) => (
                <Button
                  key={choice}
                  type="button"
                  size="sm"
                  variant={props.preset === choice ? "default" : "ghost"}
                  onClick={() => props.onPresetChange(choice)}
                >
                  {choice}
                </Button>
              ))}
            </div>
          </StudioFormField>
          <StudioFormField label={`${STUDIO_WEB_COPY.PROFILES.FIELD_MAX_TURNS}: ${props.maxTurns}`}>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[props.maxTurns]}
              onValueChange={([val]) => props.onMaxTurnsChange(val ?? 8)}
            />
          </StudioFormField>
          <StudioFormField
            label={`${STUDIO_WEB_COPY.PROFILES.FIELD_MAX_TOKENS}: ${props.maxTokens.toLocaleString()}`}
          >
            <Slider
              min={256}
              max={32768}
              step={256}
              value={[props.maxTokens]}
              onValueChange={([val]) => props.onMaxTokensChange(val ?? 4096)}
            />
          </StudioFormField>
        </div>

        <StudioFormField label={STUDIO_WEB_COPY.PROFILES.FIELD_SYSTEM_PROMPT}>
          <Textarea
            className="studio-mono"
            value={props.systemPrompt}
            onChange={(event) => props.onSystemPromptChange(event.target.value)}
          />
        </StudioFormField>

        <div className="studio-field">
          <span>
            <SlidersHorizontal size={13} /> {STUDIO_WEB_COPY.PROFILES.FEATURE_FLAGS_TITLE}
          </span>
          <div className="studio-feature-list">
            {FEATURE_KEYS.map((key) => (
              <div className="studio-feature-row" key={key}>
                <span>{key}</span>
                <Switch
                  checked={props.featureFlags[key]}
                  onCheckedChange={(checked) => props.onToggleFeature(key, checked)}
                />
              </div>
            ))}
          </div>
        </div>

        <StudioFormField
          label={STUDIO_WEB_COPY.PROFILES.FIELD_FALLBACKS}
          hint={STUDIO_WEB_COPY.PROFILES.FIELD_FALLBACK_HINT}
        >
          <div className="studio-tag-row">
            {props.fallbacks.map((id) => (
              <span className="studio-tag" key={id}>
                {id}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => props.onRemoveFallback(id)}
                >
                  <X size={11} />
                </Button>
              </span>
            ))}
            <Input
              className="studio-mono"
              placeholder={STUDIO_WEB_COPY.PROFILES.FIELD_FALLBACK_PLACEHOLDER}
              value={props.fallbackInput}
              onChange={(event) => props.onFallbackInputChange(event.target.value)}
              onKeyDown={props.onFallbackKeyDown}
            />
          </div>
        </StudioFormField>

        <div className="studio-drawer-actions">
          {props.activeProfile ? (
            <Button type="button" variant="outline" onClick={props.onDiscard}>
              <RotateCcw size={13} /> {STUDIO_WEB_COPY.PROFILES.DISCARD}
            </Button>
          ) : null}
          {props.activeProfile && latestVersion && !isPublished ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => props.onPublish(props.activeProfile!.slug, latestVersion.id)}
            >
              {STUDIO_WEB_COPY.PROFILES.PUBLISH_VERSION}
            </Button>
          ) : null}
          <Button type="submit" disabled={props.saving}>
            <Check size={14} /> {STUDIO_WEB_COPY.PROFILES.SAVE_POLICY}
          </Button>
        </div>
      </form>
    </StudioPanel>
  );
}
