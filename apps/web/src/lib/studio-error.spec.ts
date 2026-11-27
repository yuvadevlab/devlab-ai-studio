import { describe, expect, it } from "vitest";
import { formatStudioError, parseErrorPayload, StudioApiError } from "./studio-error";

describe("studio-error", () => {
  it("extracts and humanizes NestJS + Zod validation envelopes", () => {
    const raw = JSON.stringify({
      success: false,
      statusCode: 400,
      error: {
        message: "Validation failed: baseUrl: Invalid url, slug: Too small",
        error: "Bad Request",
        statusCode: 400,
      },
    });
    expect(parseErrorPayload(raw, 400)).toBe("Base URL: Invalid url · Slug: Too small");
  });

  it("formats raw Zod issues array", () => {
    const raw = JSON.stringify([{ path: ["monthlyBudgetUsd"], message: "Expected number" }]);
    expect(parseErrorPayload(raw, 400)).toBe("Monthly budget: Expected number");
  });

  it("falls back to clean status message when body is empty", () => {
    expect(parseErrorPayload("", 401)).toBe("Authentication failed. Check your API key.");
    expect(formatStudioError(new StudioApiError("Provider already exists", 409))).toBe(
      "Provider already exists",
    );
  });
});
