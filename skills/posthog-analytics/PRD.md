# PRD: posthog-analytics

## Overview

CLI tool that pulls product analytics and web analytics data from [PostHog](https://posthog.com) via the [PostHog API](https://posthog.com/docs/api). Installed as `@radjay/posthog-analytics`, invoked as `posthog-analytics`.

Designed for AI agents and developers who need quick, scriptable access to PostHog data from the terminal — event counts, trends, web traffic stats, user lookups, and more.

## Configuration

All three required settings are resolved via `@radjay/resolve-key` using the same priority chain: flag → cmd flag → environment variable → `.env` file → `~/.config/posthog-analytics/config.json`.

| Setting | Flag | Cmd flag | Env var | Config key | Default |
|---|---|---|---|---|---|
| API key | `--api-key` | `--api-key-cmd` | `POSTHOG_API_KEY` | `api_key` | _(required)_ |
| Project ID | `--project-id` | `--project-id-cmd` | `POSTHOG_PROJECT_ID` | `project_id` | _(required)_ |
| Host | `--host` | `--host-cmd` | `POSTHOG_HOST` | `host` | `https://us.posthog.com` |

Example `~/.config/posthog-analytics/config.json`:

```json
{
  "api_key": "phx_...",
  "project_id": "12345",
  "host": "https://eu.posthog.com"
}
```

- PostHog API uses **Bearer token** auth via `Authorization: Bearer <key>` header
- Personal API key created in PostHog UI → Account Settings → Personal API Keys
- **Host URLs** (private endpoints): `https://us.posthog.com` (US), `https://eu.posthog.com` (EU), or self-hosted domain

## Commands

### `posthog-analytics project`

Displays current project info. Uses `GET /api/projects/:project_id/` to show project name, ID, and timezone. Useful for verifying credentials and project context.

### `posthog-analytics query`

Runs a HogQL query against the project. This is the most powerful and flexible command.

- **Required:** `<sql>` — HogQL SQL string (positional argument)
- `--limit <n>` — max rows (default: 100, max: 50000)

Example: `posthog-analytics query "SELECT event, count() FROM events GROUP BY event ORDER BY count() DESC LIMIT 10"`

Uses `POST /api/projects/:project_id/query/` with `kind: "HogQLQuery"`.

### `posthog-analytics events`

Lists recent events via HogQL query (the legacy events endpoint is deprecated).

- `--event <name>` — filter by event name (e.g. `$pageview`, `$autocapture`)
- `--limit <n>` — max results (default: 100)
- `--days <n>` — lookback period in days (default: 7)

Uses `POST /api/projects/:project_id/query/` with a HogQL query under the hood.

### `posthog-analytics persons`

Lists persons (users) with optional filters.

- `--search <term>` — search by email, name, or distinct ID
- `--distinct-id <id>` — filter by distinct ID
- `--properties <json>` — filter by person properties (JSON array of filter objects)
- `--limit <n>` — max results (default: 100)

Uses `GET /api/projects/:project_id/persons/`.

### `posthog-analytics trends`

Runs a trends query for a given event over a date range.

- **Required:** `--event <name>` — event to trend (e.g. `$pageview`)
- `--date-from <date>` — start date (default: `-7d`, supports relative like `-30d` or absolute `2025-01-01`)
- `--date-to <date>` — end date (default: now)
- `--interval <hour|day|week|month>` — breakdown interval (default: `day`)
- `--breakdown <property>` — break down by event or person property
- `--breakdown-type <event|person|session>` — type of breakdown property (default: `event`)

Uses `POST /api/projects/:project_id/query/` with `kind: "TrendsQuery"`.

### `posthog-analytics web-stats`

Provides web analytics overview and breakdowns, mirroring PostHog's web analytics dashboard.

**Subcommand: `web-stats overview`**

Returns high-level web metrics for the date range: visitors, pageviews, sessions, session duration, bounce rate — each with comparison to the previous period.

- `--date-from <date>` — start date (default: `-7d`)
- `--date-to <date>` — end date (default: now)
- `--compare` — include comparison with previous period (default: true)

Uses `POST /api/projects/:project_id/query/` with `kind: "WebOverviewQuery"`.

**Subcommand: `web-stats breakdown`**

Returns a table of web stats broken down by a dimension.

- **Required:** `--by <dimension>` — one of:
  - **Pages:** `Page`, `InitialPage`, `ExitPage`
  - **Sources:** `InitialChannelType`, `InitialReferringDomain`, `InitialUTMSource`, `InitialUTMCampaign`, `InitialUTMMedium`, `InitialUTMTerm`, `InitialUTMContent`, `InitialUTMSourceMediumCampaign`
  - **Devices:** `Browser`, `OS`, `DeviceType`, `Viewport`
  - **Geography:** `Country`, `Region`, `City`, `Timezone`, `Language`
- `--date-from <date>` — start date (default: `-7d`)
- `--date-to <date>` — end date (default: now)
- `--include-bounce-rate` — include bounce rate column
- `--limit <n>` — max rows (default: 10)

Uses `POST /api/projects/:project_id/query/` with `kind: "WebStatsTableQuery"` and `breakdownBy`.

**Subcommand: `web-stats goals`**

Returns conversion goal metrics.

- `--date-from <date>` — start date (default: `-7d`)
- `--date-to <date>` — end date (default: now)
- `--limit <n>` — max rows (default: 10)

Uses `POST /api/projects/:project_id/query/` with `kind: "WebGoalsQuery"`.

### `posthog-analytics insights`

Lists saved insights from the project.

- `--limit <n>` — max results (default: 100)
- `--search <term>` — search by insight name

Uses `GET /api/environments/:project_id/insights/`.

### `posthog-analytics dashboards`

Lists dashboards in the project.

- `--limit <n>` — max results (default: 100)

Uses `GET /api/environments/:project_id/dashboards/`.

### `posthog-analytics feature-flags`

Lists feature flags and their status.

- `--limit <n>` — max results (default: 100)
- `--search <term>` — search by flag key or name

Uses `GET /api/projects/:project_id/feature_flags/`.

### `posthog-analytics schema`

Discovers the event and property schema for the project. Useful for understanding what data is available before writing HogQL queries.

**Subcommand: `schema events`**

Lists all event definitions (event names seen by the project).

- `--limit <n>` — max results (default: 100)
- `--search <term>` — filter by event name

Uses `GET /api/projects/:project_id/event_definitions/`.

**Subcommand: `schema properties`**

Lists all property definitions.

- `--limit <n>` — max results (default: 100)
- `--search <term>` — filter by property name
- `--type <event|person|session>` — filter by property type

Uses `GET /api/projects/:project_id/property_definitions/`.

## Global Options

- `--api-key <key>` — PostHog personal API key
- `--api-key-cmd <cmd>` — shell command to retrieve API key
- `--project-id <id>` — PostHog project ID
- `--project-id-cmd <cmd>` — shell command to retrieve project ID
- `--host <url>` — PostHog instance URL (default: `https://us.posthog.com`)
- `--host-cmd <cmd>` — shell command to retrieve host URL
- `--format <json|table>` — output format (default: `table`)
- `--help` — show help

## Dependencies

- `commander` — CLI framework
- `@radjay/resolve-key` — API key resolution (env vars, config files, .env, shell commands)

## Technical Details

- **Package:** `@radjay/posthog-analytics`
- **Binary:** `posthog-analytics`
- **Language:** TypeScript
- **CLI framework:** Commander.js
- **API auth:** Bearer token via `Authorization` header
- **Config resolution:** `@radjay/resolve-key` for all 3 settings (flag → cmd → env var → .env → config file)
- **Pagination:** offset-based with `next` URL (REST endpoints), `LIMIT`/`OFFSET` for HogQL
- **Rate limits:** 240/min & 1200/hr (analytics), 2400/hr (query endpoint)

## Out of Scope (v1)

- Creating/updating/deleting resources (read-only tool)
- Event capture (`/i/v0/e` and `/batch` endpoints)
- Session replay playback (raw JSON not available via API)
- Cohort management
- Annotations management
- Experiments / A/B tests
- Data warehouse queries
- Async/polling queries
- Data caching
- CSV export
