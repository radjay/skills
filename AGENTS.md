# AGENTS.md

## Project Overview

Monorepo for AI agent skills. Each skill is an independently publishable CLI tool under the `@skills` npm scope. Built with TypeScript, managed with pnpm workspaces.

## Structure

```
skills/
├── package.json          # Root workspace config (private)
├── pnpm-workspace.yaml   # Workspace: skills/*
├── tsconfig.base.json    # Shared TypeScript config
└── skills/
    └── <skill-name>/     # Each skill is its own package
        ├── package.json  # Publishable, with "bin" entry
        ├── tsconfig.json # Extends ../../tsconfig.base.json
        └── src/
            └── index.ts  # #!/usr/bin/env node entrypoint
```

## Setup Commands

```sh
pnpm install
```

## Build and Test

```sh
pnpm build        # Build all skills
pnpm clean        # Clean all dist folders
```

To build a single skill:

```sh
pnpm --filter @skills/<name> build
```

## Adding a New Skill

1. Create `skills/<name>/` with `package.json`, `tsconfig.json`, and `src/index.ts`.
2. The `package.json` must include a `bin` field pointing to `./dist/index.js` and use the `@skills/<name>` naming convention.
3. The `tsconfig.json` must extend `../../tsconfig.base.json` with `outDir: "dist"` and `rootDir: "src"`.
4. The `src/index.ts` entrypoint must start with `#!/usr/bin/env node`.
5. Run `pnpm install` from the root after adding.

## Code Style

- TypeScript strict mode is required.
- Each skill's entrypoint must include the node shebang (`#!/usr/bin/env node`).
- Keep skills self-contained — avoid cross-skill dependencies unless explicitly needed.
