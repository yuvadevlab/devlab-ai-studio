"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HttpHeader, HttpHeaderValue } from "@devlab-ai-studio/shared-types";
import {
  Input,
  PasswordInput,
  Sparkles,
  StudioFormField,
  StudioPageHeader,
  StudioSelectField,
  StudioStatusPill,
  StudioStatusTone,
  Textarea,
} from "@devlab-ai-studio/ui";
import { AgentChat, AgentChatLayout } from "@yuva-devlab/agent-ui";
import { StudioQueryKey, StudioStorageKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import { fetchApps, fetchProfiles, getGatewayStreamUrl } from "@/lib/studio-api";

/** Gateway SSE Playground feature powered by @yuva-devlab/agent-ui. */
export function PlaygroundFeature() {
  const { activeAppSlug } = useActiveApp();
  const { data: apps = [] } = useQuery({ queryKey: [StudioQueryKey.APPS], queryFn: fetchApps });
  const targetSlug = activeAppSlug || apps[0]?.slug || "";

  const { data: profiles = [] } = useQuery({
    queryKey: [StudioQueryKey.PROFILES, targetSlug],
    queryFn: () => fetchProfiles(targetSlug),
    enabled: Boolean(targetSlug),
  });

  const [appKey, setAppKey] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(StudioStorageKey.PLAYGROUND_APP_KEY) ?? "";
  });
  const [profileSlug, setProfileSlug] = useState<string>(StudioWebDefaults.DEFAULT_PROFILE_SLUG);

  const selectedProfile = profiles.find((p) => p.slug === profileSlug) ?? profiles[0];
  const resolvedProfileSlug = selectedProfile?.slug ?? profileSlug;
  const systemPrompt = selectedProfile?.versions[0]?.systemPrompt ?? "";

  const handleAppKeyChange = (value: string) => {
    setAppKey(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(StudioStorageKey.PLAYGROUND_APP_KEY, value.trim());
    }
  };

  const transport = useMemo(
    () => ({
      streamUrl: getGatewayStreamUrl(),
      appSlug: targetSlug,
      profileSlug: resolvedProfileSlug,
      headers: () => {
        const trimmed = appKey.trim();
        return trimmed
          ? { [HttpHeader.AUTHORIZATION]: `${HttpHeaderValue.BEARER_PREFIX}${trimmed}` }
          : ({} as Record<string, string>);
      },
    }),
    [appKey, resolvedProfileSlug, targetSlug],
  );

  const copy = useMemo(
    () => ({
      defaultTitle: `${STUDIO_WEB_COPY.PLAYGROUND.CONVERSATION_TITLE} · ${resolvedProfileSlug}`,
      emptyTitle: STUDIO_WEB_COPY.PLAYGROUND.EMPTY_TITLE,
      emptyDescription: STUDIO_WEB_COPY.PLAYGROUND.EMPTY_DESC,
      composerPlaceholder: STUDIO_WEB_COPY.PLAYGROUND.INPUT_PLACEHOLDER,
    }),
    [resolvedProfileSlug],
  );

  return (
    <div className="studio-page">
      <StudioPageHeader
        eyebrow={STUDIO_WEB_COPY.PLAYGROUND.EYEBROW}
        title={STUDIO_WEB_COPY.PLAYGROUND.TITLE}
        subtitle={STUDIO_WEB_COPY.PLAYGROUND.SUBTITLE}
        action={
          <StudioStatusPill
            tone={StudioStatusTone.STREAMING}
            label={STUDIO_WEB_COPY.PLAYGROUND.LIVE_BADGE}
          />
        }
      />

      <section className="studio-playground-layout">
        <aside className="studio-playground-config">
          <div className="studio-panel-heading" style={{ padding: 0, borderBottom: 0 }}>
            <h2>{STUDIO_WEB_COPY.PLAYGROUND.CONFIG_TITLE}</h2>
          </div>

          <StudioFormField label={STUDIO_WEB_COPY.PLAYGROUND.FIELD_APP_KEY}>
            <PasswordInput
              className="studio-mono"
              placeholder={STUDIO_WEB_COPY.PLAYGROUND.FIELD_APP_KEY_PLACEHOLDER}
              value={appKey}
              onChange={(event) => handleAppKeyChange(event.target.value)}
            />
          </StudioFormField>

          <StudioFormField label={STUDIO_WEB_COPY.PLAYGROUND.FIELD_PROFILE}>
            {profiles.length > 0 ? (
              <StudioSelectField
                value={resolvedProfileSlug}
                onValueChange={setProfileSlug}
                options={profiles.map((p) => ({ value: p.slug, label: `${p.name} (${p.slug})` }))}
              />
            ) : (
              <Input
                className="studio-mono"
                value={profileSlug}
                onChange={(event) => setProfileSlug(event.target.value)}
              />
            )}
          </StudioFormField>

          <StudioFormField label={STUDIO_WEB_COPY.PLAYGROUND.FIELD_SYSTEM_PROMPT}>
            <Textarea className="studio-mono" value={systemPrompt} readOnly />
          </StudioFormField>

          <div className="studio-panel-footnote" style={{ padding: 0, borderTop: 0 }}>
            <Sparkles size={13} />
            <span>{STUDIO_WEB_COPY.PLAYGROUND.CONFIG_HINT}</span>
          </div>
        </aside>

        <AgentChat
          transport={transport}
          layout={AgentChatLayout.EMBEDDED}
          showSidebar={false}
          showTraceInspector
          copy={copy}
        />
      </section>
    </div>
  );
}
