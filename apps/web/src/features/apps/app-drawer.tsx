"use client";

import type { SyntheticEvent } from "react";
import { Button, Check, Input, StudioDrawer, StudioFormField, Switch } from "@devlab-ai-studio/ui";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import type { StudioConsumerApp } from "@/lib/studio-api";

export interface AppDrawerProps {
  open: boolean;
  editing: StudioConsumerApp | null;
  name: string;
  slug: string;
  ownerEmail: string;
  endpoint: string;
  budget: string;
  isActive: boolean;
  pending: boolean;
  onNameChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onOwnerEmailChange: (val: string) => void;
  onEndpointChange: (val: string) => void;
  onBudgetChange: (val: string) => void;
  onActiveChange: (val: boolean) => void;
  onClose: () => void;
  onSubmit: (event: SyntheticEvent<HTMLFormElement>) => void;
}

/** Slide-over drawer form for registering or editing a consumer app. */
export function AppDrawer(props: AppDrawerProps) {
  return (
    <StudioDrawer
      open={props.open}
      eyebrow={STUDIO_WEB_COPY.APPS.DRAWER_EYEBROW}
      title={props.editing ? STUDIO_WEB_COPY.APPS.EDIT_TITLE : STUDIO_WEB_COPY.APPS.ADD_TITLE}
      closeAriaLabel={STUDIO_WEB_COPY.COMMON.CLOSE}
      onClose={props.onClose}
    >
      <form className="studio-drawer-form" onSubmit={props.onSubmit}>
        <p className="studio-form-note">{STUDIO_WEB_COPY.APPS.FORM_NOTE}</p>
        <StudioFormField label={STUDIO_WEB_COPY.APPS.FIELD_NAME}>
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
        <StudioFormField label={STUDIO_WEB_COPY.APPS.FIELD_SLUG}>
          <Input
            className="studio-mono"
            value={props.slug}
            disabled={Boolean(props.editing)}
            required
            onChange={(event) => props.onSlugChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={STUDIO_WEB_COPY.APPS.FIELD_OWNER_EMAIL}>
          <Input
            type="email"
            value={props.ownerEmail}
            required
            onChange={(event) => props.onOwnerEmailChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField
          label={STUDIO_WEB_COPY.APPS.FIELD_ENDPOINT}
          hint={STUDIO_WEB_COPY.APPS.FIELD_ENDPOINT_HINT}
        >
          <Input
            className="studio-mono"
            type="url"
            value={props.endpoint}
            onChange={(event) => props.onEndpointChange(event.target.value)}
          />
        </StudioFormField>
        <StudioFormField label={`${STUDIO_WEB_COPY.APPS.FIELD_BUDGET} (USD)`}>
          <Input
            className="studio-mono"
            type="number"
            min="1"
            value={props.budget}
            required
            onChange={(event) => props.onBudgetChange(event.target.value)}
          />
        </StudioFormField>
        {props.editing ? (
          <div className="studio-toggle-row">
            <span>
              <strong>{STUDIO_WEB_COPY.APPS.FIELD_ACTIVE}</strong>
              <small>{STUDIO_WEB_COPY.APPS.FIELD_ACTIVE_HINT}</small>
            </span>
            <Switch checked={props.isActive} onCheckedChange={props.onActiveChange} />
          </div>
        ) : null}
        <div className="studio-drawer-actions">
          <Button type="button" variant="outline" onClick={props.onClose}>
            {STUDIO_WEB_COPY.COMMON.CANCEL}
          </Button>
          <Button type="submit" disabled={props.pending}>
            <Check size={14} />{" "}
            {props.editing ? STUDIO_WEB_COPY.COMMON.SAVE_CHANGES : STUDIO_WEB_COPY.APPS.ADD_CTA}
          </Button>
        </div>
      </form>
    </StudioDrawer>
  );
}
