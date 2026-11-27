import { describe, expect, it } from "vitest";
import { CryptoService } from "./crypto.service";

describe("CryptoService", () => {
  it("encrypts and decrypts secrets with AES-256-GCM", () => {
    const crypto = new CryptoService();
    const secret = "sk-test-1234567890abcdef";
    const encrypted = crypto.encryptSecret(secret);
    expect(encrypted).not.toContain(secret);
    expect(crypto.decryptSecret(encrypted)).toBe(secret);
  });

  it("masks API keys and generates hashed app keys", () => {
    const crypto = new CryptoService();
    expect(crypto.maskApiKey("sk-test-1234567890abcdef")).toBe("sk-****cdef");
    const { rawKey, keyHash } = crypto.generateAppKey();
    expect(rawKey.startsWith("dlai_app_")).toBe(true);
    expect(crypto.hashAppKey(rawKey)).toBe(keyHash);
  });
});
