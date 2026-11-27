"use client";

import { useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { AgentChatRole, GatewayStreamEventType } from "@devlab-ai-studio/shared-types";
import {
  Bot,
  Button,
  Check,
  EmptyState,
  Input,
  LoaderCircle,
  PasswordInput,
  RotateCcw,
  Send,
  Sparkles,
  StudioFormField,
  StudioPageHeader,
  StudioSelectField,
  StudioStatusPill,
  StudioStatusTone,
  Textarea,
  UserRound,
} from "@devlab-ai-studio/ui";
import { StudioQueryKey, StudioStorageKey, StudioWebDefaults } from "@/constants/routes.constants";
import { STUDIO_WEB_COPY } from "@/constants/ui-copy";
import { useActiveApp } from "@/lib/active-app";
import { notifyStudioError } from "@/lib/studio-error";
import { fetchApps, fetchProfiles, streamGatewayRun } from "@/lib/studio-api";

interface ChatMessage {
  role: AgentChatRole;
  content: string;
}

/** Gateway SSE Playground feature wired directly to the Data Plane streaming endpoint. */
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
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [usage, setUsage] = useState({ tokensIn: 0, tokensOut: 0, latencyMs: 0 });

  const selectedProfile = profiles.find((p) => p.slug === profileSlug) ?? profiles[0];
  const resolvedProfileSlug = selectedProfile?.slug ?? profileSlug;
  const systemPrompt = selectedProfile?.versions[0]?.systemPrompt ?? "";

  const handleSend = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = draft.trim();
    if (!prompt || !appKey.trim() || streaming) return;

    window.localStorage.setItem(StudioStorageKey.PLAYGROUND_APP_KEY, appKey.trim());
    setMessages((prev) => [
      ...prev,
      { role: AgentChatRole.USER, content: prompt },
      { role: AgentChatRole.ASSISTANT, content: "" },
    ]);
    setDraft("");
    setStreaming(true);

    const startedAt = Date.now();
    try {
      await streamGatewayRun(
        {
          appKey: appKey.trim(),
          appSlug: targetSlug || undefined,
          profileSlug: resolvedProfileSlug,
          prompt,
        },
        (sseEvent) => {
          if (sseEvent.type === GatewayStreamEventType.TOKEN) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === AgentChatRole.ASSISTANT) {
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + sseEvent.content,
                };
              }
              return updated;
            });
          } else if (sseEvent.type === GatewayStreamEventType.ERROR) {
            notifyStudioError(sseEvent.error);
          } else if (sseEvent.type === GatewayStreamEventType.DONE) {
            setUsage((prev) => ({
              ...prev,
              latencyMs: Date.now() - startedAt,
            }));
          }
        },
      );
    } catch (err) {
      notifyStudioError(err);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={STUDIO_WEB_COPY.TELEMETRY.CLEAR}
              onClick={() => {
                setMessages([]);
                setUsage({ tokensIn: 0, tokensOut: 0, latencyMs: 0 });
              }}
            >
              <RotateCcw size={14} />
            </Button>
          </div>

          <StudioFormField label={STUDIO_WEB_COPY.PLAYGROUND.FIELD_APP_KEY}>
            <PasswordInput
              className="studio-mono"
              placeholder={STUDIO_WEB_COPY.PLAYGROUND.FIELD_APP_KEY_PLACEHOLDER}
              value={appKey}
              onChange={(event) => setAppKey(event.target.value)}
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

        <div className="studio-chat-pane">
          <div className="studio-panel-heading">
            <strong>{STUDIO_WEB_COPY.PLAYGROUND.CONVERSATION_TITLE}</strong>
            <span className="studio-mono">{resolvedProfileSlug}</span>
          </div>

          <div className="studio-chat-content" aria-live="polite">
            {messages.length === 0 ? (
              <EmptyState
                icon={<Bot size={21} />}
                title={STUDIO_WEB_COPY.PLAYGROUND.EMPTY_TITLE}
                description={STUDIO_WEB_COPY.PLAYGROUND.EMPTY_DESC}
              />
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`studio-chat-message${message.role === AgentChatRole.USER ? " is-user" : ""}`}
                >
                  <div className="studio-mono">
                    {message.role === AgentChatRole.USER ? (
                      <UserRound size={12} />
                    ) : (
                      <Bot size={12} />
                    )}{" "}
                    {message.role === AgentChatRole.USER
                      ? STUDIO_WEB_COPY.PLAYGROUND.ROLE_USER
                      : STUDIO_WEB_COPY.PLAYGROUND.ROLE_ASSISTANT}
                  </div>
                  <div className="studio-chat-bubble">{message.content}</div>
                </article>
              ))
            )}
          </div>

          <form className="studio-chat-input-row" onSubmit={handleSend}>
            <Textarea
              placeholder={STUDIO_WEB_COPY.PLAYGROUND.INPUT_PLACEHOLDER}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              type="submit"
              size="icon"
              disabled={streaming || !draft.trim() || !appKey.trim()}
            >
              {streaming ? <LoaderCircle size={15} /> : <Send size={15} />}
            </Button>
          </form>

          <div className="studio-panel-footnote">
            <span>
              {STUDIO_WEB_COPY.PLAYGROUND.USAGE_PROMPT}: <strong>{usage.tokensIn}</strong>
            </span>
            <span>
              {STUDIO_WEB_COPY.PLAYGROUND.USAGE_COMPLETION}: <strong>{usage.tokensOut}</strong>
            </span>
            <span>
              {STUDIO_WEB_COPY.PLAYGROUND.USAGE_LATENCY}: <strong>{usage.latencyMs} ms</strong>
            </span>
            <span style={{ marginLeft: "auto" }}>
              <Check size={11} /> {STUDIO_WEB_COPY.PLAYGROUND.LIVE_LABEL}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
