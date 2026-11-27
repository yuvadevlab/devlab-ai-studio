"use client";

import type { SyntheticEvent } from "react";
import {
  Button,
  Check,
  Input,
  PasswordInput,
  StudioDrawer,
  StudioFormField,
  Switch,
} from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioModel, StudioProvider } from "@/lib/studio-api";

export interface ProviderFormDrawerProps {
  open: boolean;
  editing: StudioProvider | null;
  name: string;
  slug: string;
  baseUrl: string;
  apiKey: string;
  isActive: boolean;
  pending: boolean;
  onNameChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onBaseUrlChange: (val: string) => void;
  onApiKeyChange: (val: string) => void;
  onActiveChange: (val: boolean) => void;
  onClose: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Slide-over drawer for adding or editing an upstream LLM provider. */
export function ProviderFormDrawer(props: ProviderFormDrawerProps) {
  return (
    <StudioDrawer
      open={props.open}
      eyebrow={STUDIO_WEB_COPY.PROVIDERS.DRAWER_EYEBROW}
      title={
        props.editing ? STUDIO_WEB_COPY.PROVIDERS.EDIT_TITLE : STUDIO_WEB_COPY.PROVIDERS.ADD_TITLE
      }
      closeAriaLabel={STUDIO_WEB_COPY.COMMON.CLOSE}
      onClose={props.onClose}
    >
      <form className="studio-drawer-form" onSubmit={props.onSubmit}>
        <p className="studio-form-note">{STUDIO_WEB_COPY.PROVIDERS.FORM_NOTE}</p>
        <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_NAME}>
          <Input
            value={props.name}
            required
            onChange={(event) => {
              props.onNameChange(event.target.value);
              if (!props.editing) {
                props.onSlugChange(
                  event.target.value
                    .toLowerCase()
                    .trim()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                );
              }
            }}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_SLUG}>
          <Input
            className="studio-mono"
            value={props.slug}
            disabled={Boolean(props.editing)}
            required
            onChange={(event) => props.onSlugChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_BASE_URL}>
          <Input
            className="studio-mono"
            type="url"
            value={props.baseUrl}
            required
            onChange={(event) => props.onBaseUrlChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField
          label={STUDIO_WEB_COPY.PROVIDERS.FIELD_API_KEY}
          hint={STUDIO_WEB_COPY.PROVIDERS.FIELD_API_KEY_HINT}
        >
          <PasswordInput
            className="studio-mono"
            value={props.apiKey}
            onChange={(event) => props.onApiKeyChange(event.target.value)}
          />
        </StudioFormField>
        <div className="studio-toggle-row">
          <span>
            <strong>{STUDIO_WEB_COPY.PROVIDERS.FIELD_ACTIVE}</strong>
            <small>{STUDIO_WEB_COPY.PROVIDERS.FIELD_ACTIVE_HINT}</small>
          </span>
          <Switch checked={props.isActive} onCheckedChange={props.onActiveChange} />
        </div>
        <div className="studio-drawer-actions">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {STUDIO_WEB_COPY.COMMON.CANCEL}
          </Button>
          <Button type="submit" disabled={props.pending}>
            <Check size={14} /> {STUDIO_WEB_COPY.COMMON.SAVE}
          </Button>
        </div>
      </form>
    </StudioDrawer>
  );
}

export interface ProviderModelsDrawerProps {
  provider: StudioProvider | null;
  models: StudioModel[];
  modelId: string;
  modelName: string;
  contextWindow: string;
  costIn: string;
  costOut: string;
  pending: boolean;
  onModelIdChange: (val: string) => void;
  onModelNameChange: (val: string) => void;
  onContextWindowChange: (val: string) => void;
  onCostInChange: (val: string) => void;
  onCostOutChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Slide-over drawer for inspecting and registering models under a provider. */
export function ProviderModelsDrawer(props: ProviderModelsDrawerProps) {
  return (
    <StudioDrawer
      open={Boolean(props.provider)}
      eyebrow={STUDIO_WEB_COPY.PROVIDERS.MODELS_DRAWER_EYEBROW}
      title={`${STUDIO_WEB_COPY.PROVIDERS.MODELS_DRAWER_TITLE} ${props.provider?.name ?? ""}`}
      closeAriaLabel={STUDIO_WEB_COPY.COMMON.CLOSE}
      onClose={props.onClose}
    >
      <div className="studio-drawer-form">
        {props.models.map((model) => (
          <div key={model.id} className="studio-tag">
            <strong>{model.displayName}</strong>
            <span className="studio-muted-label">({model.modelId})</span>
          </div>
        ))}
        <form className="studio-drawer-form" onSubmit={props.onSubmit}>
          <p className="studio-form-note">{STUDIO_WEB_COPY.PROVIDERS.ADD_MODEL_TITLE}</p>
          <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_MODEL_ID}>
            <Input
              className="studio-mono"
              value={props.modelId}
              required
              onChange={(event) => props.onModelIdChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_MODEL_NAME}>
            <Input
              value={props.modelName}
              required
              onChange={(event) => props.onModelNameChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_CONTEXT_WINDOW}>
            <Input
              className="studio-mono"
              type="number"
              value={props.contextWindow}
              onChange={(event) => props.onContextWindowChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_COST_IN}>
            <Input
              className="studio-mono"
              type="number"
              step="0.0001"
              value={props.costIn}
              onChange={(event) => props.onCostInChange(event.target.value)}
            />
          </StudioFormField>
          <StudioFormField label={STUDIO_WEB_COPY.PROVIDERS.FIELD_COST_OUT}>
            <Input
              className="studio-mono"
              type="number"
              step="0.0001"
              value={props.costOut}
              onChange={(event) => props.onCostOutChange(event.target.value)}
            />
          </StudioFormField>
          <div className="studio-drawer-actions">
            <Button type="submit" disabled={props.pending}>
              <Check size={14} /> {STUDIO_WEB_COPY.PROVIDERS.SAVE_MODEL}
            </Button>
          </div>
        </form>
      </div>
    </StudioDrawer>
  );
}
