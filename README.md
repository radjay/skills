# Skills

Monorepo of CLI tools designed for AI agents and developers. Each skill provides scriptable, read-only access to a third-party platform from the terminal.

Built with TypeScript, managed with pnpm workspaces. Published under the `@radjay` npm scope.

## Skills

| Package | Description | npm |
|---|---|---|
| [@radjay/kit-analytics](skills/kit-analytics) | Pull newsletter data from [Kit.com](https://kit.com) — subscribers, broadcasts, tags, forms, sequences | [npm](https://www.npmjs.com/package/@radjay/kit-analytics) |
| [@radjay/posthog-analytics](skills/posthog-analytics) | Pull product and web analytics from [PostHog](https://posthog.com) — events, trends, web stats, user lookups | [npm](https://www.npmjs.com/package/@radjay/posthog-analytics) |

### In Progress

| Package | Description | PRD |
|---|---|---|
| @radjay/sailthru-analytics | Pull email marketing data from [Sailthru](https://www.sailthru.com/) — campaigns, lists, templates, user profiles, stats | [PRD](prds/sailthru-analytics.md) |

## Packages

| Package | Description | npm |
|---|---|---|
| [@radjay/resolve-key](packages/resolve-key) | Flexible API key resolution — flags, env vars, .env files, config files, shell commands | [npm](https://www.npmjs.com/package/@radjay/resolve-key) |

## Development

```bash
pnpm install        # install dependencies
pnpm build          # build all packages
pnpm test           # run tests
pnpm clean          # clean dist folders
```

To work on a single skill:

```bash
pnpm --filter @radjay/<name> build
```
