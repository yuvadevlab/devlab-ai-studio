/**
 * @file apps/web/src/constants/auth.constants.ts
 * @description Server/edge-safe auth query parameter and storage key enums matching @yuva-devlab/auth-client.
 * @module @devlab-ai-studio/web/constants/auth
 */

export enum AuthQueryParamKey {
  REDIRECT = "redirect",
  APP = "app",
  TOKEN = "token",
  ACCESS_TOKEN = "access_token",
}

export enum AuthStorageKey {
  TOKEN = "devlab_auth_token",
  USER = "devlab_auth_user",
  SYNC = "devlab_auth_sync",
  ACCESS_TOKEN_LEGACY = "devlab_access_token",
}
