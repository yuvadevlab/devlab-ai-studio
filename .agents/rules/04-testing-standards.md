# Testing Standards

1. Use `vitest` for unit and integration tests.
2. Never hit real external LLM APIs or production databases in unit tests — mock repositories and HTTP adapters.
3. Always run `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, and `pnpm run test` after edits.
