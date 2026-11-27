# Universal Core Invariants

1. **Zero Commits Without Explicit Permission**: Leave changes in the working tree until explicitly asked to commit/push.
2. **250-Line File Limit**: Every `.ts` / `.tsx` / `.css` source file must remain strictly under 250 lines.
3. **Enums Over Raw String Unions**: Always use `enum` or `as const` dictionaries in `@devlab-ai-studio/shared-types`.
4. **Single Source of Truth**: Validation schemas live in `@devlab-ai-studio/validation`; DB access lives in `@devlab-ai-studio/database` + API repositories.
5. **Secret Isolation**: Provider API keys must be encrypted at rest (`AES-256-GCM`) and never returned unmasked from any API endpoint.
