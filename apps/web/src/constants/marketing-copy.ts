/**
 * @file apps/web/src/constants/marketing-copy.ts
 * @description Centralized copy and structured SEO metadata for public DevLab AI Studio pages.
 * @module @devlab-ai-studio/web/constants/marketing
 */

export interface MarketingPageSpec {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  highlights: ReadonlyArray<{ title: string; detail: string }>;
}

export const STUDIO_MARKETING_COPY = {
  NAV: {
    FEATURES: "Features",
    GATEWAY: "AI Gateway",
    PROFILES: "Agent Profiles",
    TELEMETRY: "Cost & Telemetry",
    ABOUT: "About",
    OPEN_CONSOLE: "Open Console",
    BACK_HOME: "Back to overview",
  },
  HERO: {
    EYEBROW: "DEVLAB PLATFORM · AI GATEWAY & CONTROL PLANE",
    TITLE: "One Central AI Gateway for Every Model, Policy, and Dollar.",
    SUBTITLE:
      "Route completions across OpenAI, Anthropic, Google, Groq, and Ollama with encrypted keys, versioned agent profiles, automatic fallbacks, and real-time cost telemetry.",
    PRIMARY_CTA: "Launch Studio Console",
    SECONDARY_CTA: "Explore Architecture",
  },
  PILLARS: [
    {
      eyebrow: "01 · DATA PLANE",
      title: "Unbuffered SSE AI Gateway",
      description:
        "Stream completions with automatic multi-tier model fallbacks, bounded TTL profile caching, and scoped app-key authentication.",
      href: "/ai-gateway",
    },
    {
      eyebrow: "02 · CONTROL PLANE",
      title: "Versioned Agent Profiles",
      description:
        "Publish immutable agent policy versions with clamped temperature, turn/token bounds, feature flags, and instant rollback.",
      href: "/agent-profiles",
    },
    {
      eyebrow: "03 · OBSERVABILITY",
      title: "Live Telemetry & Cost Ledger",
      description:
        "Track TTFT latency histograms, per-attempt fallback outcomes, token usage, and monthly app budgets in real time.",
      href: "/cost-telemetry",
    },
  ],
  FAQS: [
    {
      question: "Which LLM providers does DevLab AI Studio support?",
      answer:
        "DevLab AI Studio supports OpenAI, Anthropic, Google Gemini, Groq, Ollama, and any OpenAI-compatible endpoint with AES-256-GCM encrypted API keys.",
    },
    {
      question: "How do consumer applications authenticate with the AI Gateway?",
      answer:
        "Each registered consumer app receives a scoped bearer key hashed with SHA-256 at rest. The Gateway verifies keys and enforces app budgets before streaming.",
    },
    {
      question: "Can I update agent prompts and routing without redeploying apps?",
      answer:
        "Yes. Agent profiles are versioned in the Control Plane. Publishing a new version updates Gateway routing and policy bounds within seconds.",
    },
  ],
  FOOTER: {
    COPYRIGHT: "© 2026 Yuva DevLab. Built for unified AI governance.",
    PRIVACY: "Privacy Policy",
    TERMS: "Terms of Service",
    ABOUT: "About",
  },
  PAGES: {
    FEATURES: {
      slug: "/features",
      eyebrow: "PLATFORM CAPABILITIES",
      title: "Everything Needed to Govern Production AI",
      description:
        "Centralize provider credentials, model pricing catalogs, versioned agent policies, and live SSE observability in one workspace.",
      metaTitle: "Features — AI Gateway, Model Catalog & Agent Policies",
      metaDescription:
        "Explore DevLab AI Studio capabilities: encrypted provider keys, model pricing catalog, versioned agent profiles, and live telemetry.",
      highlights: [
        {
          title: "Encrypted Provider Vault",
          detail: "Store upstream LLM keys encrypted with AES-256-GCM and masked in all UI views.",
        },
        {
          title: "Model Catalog & Deprecation",
          detail:
            "Track context windows, per-1M token pricing, and deprecation status per provider.",
        },
        {
          title: "Scoped Consumer App Keys",
          detail: "Issue, rotate, and revoke per-app gateway keys with monthly spend budgets.",
        },
        {
          title: "Interactive SSE Playground",
          detail:
            "Test published agent profiles and live streaming responses directly from the console.",
        },
      ],
    },
    GATEWAY: {
      slug: "/ai-gateway",
      eyebrow: "DATA PLANE · SSE STREAMING",
      title: "Multi-Provider AI Gateway with Automatic Fallbacks",
      description:
        "Eliminate scattered SDK keys and brittle retries. Stream low-latency responses through a single unified endpoint.",
      metaTitle: "AI Gateway — Multi-Provider LLM Streaming & Fallbacks",
      metaDescription:
        "Unified HTTP 200 SSE AI Gateway routing OpenAI, Anthropic, Google, Groq, and Ollama with automatic fallback chains.",
      highlights: [
        {
          title: "Provider-Agnostic Adapters",
          detail:
            "Powered by @yuva-devlab/ai-client across OpenAI, Anthropic, Google, Groq, and Ollama.",
        },
        {
          title: "Ordered Fallback Cascade",
          detail:
            "Automatically fail over to backup models on 429 rate limits or upstream timeouts.",
        },
        {
          title: "Bounded TTL Profile Cache",
          detail:
            "Coalesces concurrent profile lookups to keep Postgres off the streaming hot path.",
        },
      ],
    },
    PROFILES: {
      slug: "/agent-profiles",
      eyebrow: "CONTROL PLANE · GOVERNANCE",
      title: "Immutable Versioned Agent Profiles",
      description:
        "Decouple system prompts, temperature presets, and feature flags from application deployments.",
      metaTitle: "Agent Profiles — Versioned LLM Policies & Rollbacks",
      metaDescription:
        "Manage immutable agent policy versions with clamped temperature, max tokens, fallback chains, and instant publish/rollback.",
      highlights: [
        {
          title: "Immutable Version History",
          detail: "Every save creates an auditable version you can publish or roll back instantly.",
        },
        {
          title: "Clamped Runtime Overrides",
          detail: "Allow safe per-request overrides while enforcing hard Control Plane bounds.",
        },
        {
          title: "Feature Flag Controls",
          detail: "Toggle reasoning streams, tool execution, and live console flags per profile.",
        },
      ],
    },
    TELEMETRY: {
      slug: "/cost-telemetry",
      eyebrow: "OBSERVABILITY · COST LEDGER",
      title: "Real-Time Telemetry & Per-App Cost Attribution",
      description:
        "Measure every run, attempt, TTFT, and token dollar across your entire AI fleet.",
      metaTitle: "Cost & Telemetry — LLM Latency, Tokens & Spend Ledger",
      metaDescription:
        "Monitor TTFT latency histograms, fallback attempts, token counts, and monthly app budgets in real time.",
      highlights: [
        {
          title: "Non-Blocking Ingestion",
          detail:
            "The Gateway publishes async run and attempt batches without slowing token streams.",
        },
        {
          title: "TTFT & Latency Histograms",
          detail: "Inspect time-to-first-token and end-to-end latency distributions across models.",
        },
        {
          title: "Budget Progress Tracking",
          detail: "Track month-to-date spend against each consumer app's configured USD budget.",
        },
      ],
    },
    ABOUT: {
      slug: "/about",
      eyebrow: "ABOUT DEVLAB AI STUDIO",
      title: "Built by Yuva DevLab for Unified AI Operations",
      description:
        "DevLab AI Studio is the shared AI Gateway and Control Plane powering Yuva DevLab applications.",
      metaTitle: "About DevLab AI Studio",
      metaDescription:
        "Learn how Yuva DevLab built DevLab AI Studio to centralize LLM routing, cost governance, and agent observability.",
      highlights: [
        {
          title: "Ecosystem-First Design",
          detail:
            "Integrated natively with DevLab Portal SSO, shared tokens, and agent protocol packages.",
        },
        {
          title: "Zero Vendor Lock-In",
          detail:
            "Switch or blend cloud and local models anytime without changing consumer app code.",
        },
      ],
    },
    PRIVACY: {
      slug: "/privacy-policy",
      eyebrow: "LEGAL · PRIVACY",
      title: "Privacy Policy",
      description:
        "How DevLab AI Studio handles operator authentication, encrypted provider credentials, and telemetry.",
      metaTitle: "Privacy Policy",
      metaDescription: "Privacy Policy for DevLab AI Studio by Yuva DevLab.",
      highlights: [
        {
          title: "Encrypted Credentials",
          detail: "Upstream provider API keys are encrypted at rest using AES-256-GCM.",
        },
        {
          title: "Scoped Telemetry",
          detail:
            "Run metrics record token counts, latency, and cost attribution per registered app.",
        },
      ],
    },
    TERMS: {
      slug: "/terms-of-service",
      eyebrow: "LEGAL · TERMS",
      title: "Terms of Service",
      description:
        "Usage guidelines and operational terms for DevLab AI Studio Gateway and Control Plane.",
      metaTitle: "Terms of Service",
      metaDescription: "Terms of Service for DevLab AI Studio by Yuva DevLab.",
      highlights: [
        {
          title: "Authorized Access",
          detail: "Console access is governed by DevLab Portal SSO and platform status controls.",
        },
        {
          title: "Rate & Budget Governance",
          detail: "Consumer applications must operate within configured monthly USD spend budgets.",
        },
      ],
    },
  },
} as const;
