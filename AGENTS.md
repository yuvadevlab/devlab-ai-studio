# DevLab AI Studio — AI Agent Guidelines & Architecture Index

> **FOR ALL AI ASSISTANTS (Antigravity, GitHub Copilot, Claude Code):**
> This repository uses a modular rules architecture. Master invariants are listed below, and domain-specific rulebooks live in `.agents/rules/`.

---

## 1. Modular Rulebook Index

| Topic                         | Rulebook                                                                   | Primary Scope                                                    |
| :---------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Universal Core Invariants** | [`00-core-invariants.md`](file:///.agents/rules/00-core-invariants.md)     | Monorepo boundaries, 250-line rule, zero commits without consent |
| **Backend API**               | [`02-backend-api.md`](file:///.agents/rules/02-backend-api.md)             | 5-layer NestJS + Fastify architecture, repositories, logging     |
| **Testing Standards**         | [`04-testing-standards.md`](file:///.agents/rules/04-testing-standards.md) | Vitest, mock contracts, zero test side-effects                   |

---

## 2. Universal Monorepo Invariants (Zero Exceptions)

0. **Zero Commits Without Explicit Confirmation (CRITICAL)**:
   - NEVER execute `git commit`, `git push`, or open pull requests unless the user explicitly commands it.
1. **Attribution & Conventional Commits**:
   - Standardize all author and committer attribution to `yuva.devlab@gmail.com`.
   - Branch naming: `^(feat|fix|refactor|perf|chore|docs|test|ci|hotfix)/[a-z0-9-]+$`.
   - Commits must conform to Conventional Commits (`commitlint.config.ts`).
2. **Pure Platform CSS & Design Tokens**:
   - Utility-first CSS frameworks are prohibited. Use pure platform CSS, `@layer dl-*`, and `@yuva-devlab/tokens`.
3. **Strict Package Boundaries**:
   - Enums and constants live in `@devlab-ai-studio/shared-types`.
   - Zod schemas and DTO input types live in `@devlab-ai-studio/validation`. Never inline Zod schemas in `apps/api` or `apps/web`.
4. **Standardized Backend Logging (`.info`, `.warn`, `.error` ONLY)**:
   - Use `@yuva-devlab/logger` (`new Logger(ClassName.name)`).
   - NEVER use `.debug`, `.log`, `.verbose`, or `.trace`.
   - Prefix messages with the method tag only: `[methodName] message`.
5. **Hard 250-Line Maximum Rule**:
   - No source file may exceed **250 lines** (decompose early at 200 lines).
