/**
 * @file apps/web/src/app/apple-icon.tsx
 * @description Dynamic Apple Touch Icon for DevLab AI Studio.
 * @module @devlab-ai-studio/web/app
 */

import { ImageResponse } from "next/og";

// eslint-disable-next-line react-refresh/only-export-components
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * Generates Apple Touch Icon for mobile home screens using the Studio Hexagon logo mark.
 */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#12121a",
        borderRadius: "36px",
        border: "2px solid rgba(99, 102, 241, 0.45)",
      }}
    >
      <svg
        width="104"
        height="104"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    </div>,
    {
      ...size,
    },
  );
}
