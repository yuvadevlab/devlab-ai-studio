"use client";

import type { SyntheticEvent } from "react";
import {
  Button,
  Check,
  Input,
  StudioDrawer,
  StudioFormField,
  StudioSelectField,
  Switch,
} from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioModel, StudioProvider } from "@/lib/studio-api";

export interface ModelFormDrawerProps {
  open: boolean;
  editing: StudioModel | null;
  providers: StudioProvider[];
  providerId: string;
  modelId: string;
  displayName: string;
  contextWindow: string;
  costIn: string;
  costOut: string;
  isDeprecated: boolean;
  pending: boolean;
  onProviderChange: (val: string) => void;
  onModelIdChange: (val: string) => void;
  onDisplayNameChange: (val: string) => void;
  onContextWindowChange: (val: string) => void;
  onCostInChange: (val: string) => void;
  onCostOutChange: (val: string) => void;
  onDeprecatedChange: (val: boolean) => void;
  onClose: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Slide-over drawer for registering or updating a provider model. */
export function ModelFormDrawer(props: ModelFormDrawerProps) {
  return (
    <StudioDrawer
      open={props.open}
      eyebrow={STUDIO_WEB_COPY.MODELS.DRAWER_EYEBROW}
      title={props.editing ? STUDIO_WEB_COPY.MODELS.EDIT_TITLE : STUDIO_WEB_COPY.MODELS.ADD_TITLE}
      closeAriaLabel={STUDIO_WEB_COPY.COMMON.CLOSE}
      onClose={props.onClose}
    >
      <form className="studio-drawer-form" onSubmit={props.onSubmit}>
        <p className="studio-form-note">{STUDIO_WEB_COPY.MODELS.FORM_NOTE}</p>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_PROVIDER}>
          {props.editing ? (
            <Input
              value={
                props.providers.find((p) => p.id === props.providerId)?.name ?? props.providerId
              }
              disabled
            />
          ) : (
            <StudioSelectField
              ariaLabel={STUDIO_WEB_COPY.MODELS.FIELD_PROVIDER}
              value={props.providerId}
              onValueChange={props.onProviderChange}
              placeholder={STUDIO_WEB_COPY.MODELS.FIELD_PROVIDER}
              options={props.providers.map((provider) => ({
                value: provider.id,
                label: `${provider.name} (${provider.slug})`,
              }))}
            />
          )}
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_MODEL_ID}>
          <Input
            className="studio-mono"
            value={props.modelId}
            disabled={Boolean(props.editing)}
            required
            onChange={(event) => props.onModelIdChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_MODEL_NAME}>
          <Input
            value={props.displayName}
            required
            onChange={(event) => props.onDisplayNameChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_CONTEXT_WINDOW}>
          <Input
            className="studio-mono"
            type="number"
            value={props.contextWindow}
            onChange={(event) => props.onContextWindowChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_COST_IN}>
          <Input
            className="studio-mono"
            type="number"
            step="0.0001"
            value={props.costIn}
            onChange={(event) => props.onCostInChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.MODELS.FIELD_COST_OUT}>
          <Input
            className="studio-mono"
            type="number"
            step="0.0001"
            value={props.costOut}
            onChange={(event) => props.onCostOutChange(event.target.value)}
          />
        </StudioFormField>
        <div className="studio-toggle-row">
          <span>
            <strong>{STUDIO_WEB_COPY.MODELS.FIELD_DEPRECATED}</strong>
            <small>{STUDIO_WEB_COPY.MODELS.FIELD_DEPRECATED_HINT}</small>
          </span>
          <Switch checked={props.isDeprecated} onCheckedChange={props.onDeprecatedChange} />
        </div>
        <div className="studio-drawer-actions">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {STUDIO_WEB_COPY.COMMON.CANCEL}
          </Button>
          <Button type="submit" disabled={props.pending || !props.providerId}>
            <Check size={14} /> {STUDIO_WEB_COPY.MODELS.SAVE_MODEL}
          </Button>
        </div>
      </form>
    </StudioDrawer>
  );
}
