import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "style",
        "test",
        "docs",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
    "scope-empty": [2, "never"],
    "scope-case": [2, "always", "kebab-case"],
    "scope-enum": [
      2,
      "always",
      [
        "api",
        "web",
        "database",
        "shared-types",
        "validation",
        "providers",
        "profiles",
        "analytics",
        "gateway",
        "workspace",
        "docs",
        "deps",
        "ci",
        "infra",
        "config",
      ],
    ],
  },
};

export default config;
