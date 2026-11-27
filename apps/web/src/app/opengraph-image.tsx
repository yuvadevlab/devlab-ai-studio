/**
 * @file apps/web/src/app/opengraph-image.tsx
 * @description Dynamic Open Graph and Twitter preview image for DevLab AI Studio.
 * @module @devlab-ai-studio/web/app
 */

import { ImageResponse } from "next/og";
import { STUDIO_SITE_CONFIG } from "@/constants/seo.constants";

export const runtime = "nodejs";
// eslint-disable-next-line react-refresh/only-export-components
export const alt = STUDIO_SITE_CONFIG.OG_TITLE;
// eslint-disable-next-line react-refresh/only-export-components
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 80px",
        background: "linear-gradient(135deg, #0b0b12 0%, #12121a 55%, #19192a 100%)",
        color: "#f4f4f8",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            backgroundColor: "rgba(99, 102, 241, 0.14)",
            border: "2px solid rgba(99, 102, 241, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        </div>
        <span style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.02em" }}>
          DevLab AI Studio
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "960px" }}>
        <div
          style={{
            fontSize: "54px",
            fontWeight: 750,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
          }}
        >
          Central AI Gateway & Agent Control Plane
        </div>
        <div style={{ fontSize: "24px", color: "#a1a1b5", lineHeight: 1.4 }}>
          Multi-provider LLM routing, versioned agent policies, automatic fallbacks, and live cost
          telemetry across every DevLab application.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "24px",
          fontSize: "18px",
          color: "#8b8da3",
        }}
      >
        <span>OpenAI · Anthropic · Google · Groq · Ollama</span>
        <span style={{ color: "#818cf8", fontWeight: 600 }}>Yuva DevLab Platform</span>
      </div>
    </div>,
    { ...size },
  );
}
