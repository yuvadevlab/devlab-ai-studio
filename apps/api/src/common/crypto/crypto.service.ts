import { Injectable } from "@nestjs/common";
import { CRYPTO_CONSTANTS } from "@devlab-ai-studio/shared-types";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { loadApiConfig } from "../../config/api-config";

/**
 * Provides AES-256-GCM encryption for LLM provider API keys, key masking,
 * and SHA-256 hashing for issued consumer app keys.
 */
@Injectable()
export class CryptoService {
  private readonly keyBuffer: Buffer;

  constructor() {
    const { masterKeyHex } = loadApiConfig();
    this.keyBuffer = Buffer.from(masterKeyHex, "hex");
  }

  encryptSecret(plaintext: string): string {
    const iv = randomBytes(CRYPTO_CONSTANTS.IV_BYTES);
    const cipher = createCipheriv(CRYPTO_CONSTANTS.AES_ALGORITHM, this.keyBuffer, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decryptSecret(ciphertext: string): string {
    const [ivHex, tagHex, dataHex] = ciphertext.split(":");
    if (!ivHex || !tagHex || !dataHex) {
      throw new Error("Invalid encrypted secret format");
    }
    const decipher = createDecipheriv(
      CRYPTO_CONSTANTS.AES_ALGORITHM,
      this.keyBuffer,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }

  maskApiKey(rawKey: string): string {
    if (rawKey.length <= CRYPTO_CONSTANTS.KEY_MASK_MIN_LENGTH) {
      return CRYPTO_CONSTANTS.KEY_MASK_PLACEHOLDER;
    }
    const prefix = rawKey.slice(0, CRYPTO_CONSTANTS.KEY_MASK_PREFIX_LENGTH);
    const suffix = rawKey.slice(-CRYPTO_CONSTANTS.KEY_MASK_SUFFIX_LENGTH);
    return `${prefix}${CRYPTO_CONSTANTS.KEY_MASK_PLACEHOLDER}${suffix}`;
  }

  generateAppKey(): { rawKey: string; keyHash: string } {
    const token = randomBytes(CRYPTO_CONSTANTS.APP_KEY_RANDOM_BYTES).toString("hex");
    const rawKey = `${CRYPTO_CONSTANTS.APP_KEY_PREFIX}${token}`;
    return { rawKey, keyHash: this.hashAppKey(rawKey) };
  }

  hashAppKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
  }
}
