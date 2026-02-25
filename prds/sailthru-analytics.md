# PRD: sailthru-analytics

## Overview

CLI tool that pulls email marketing and analytics data from [Sailthru](https://www.sailthru.com/) (Marigold Engage) via the [Sailthru REST API](https://getstarted.meetmarigold.com/engagebysailthru/Content/dev-mobile/rest-api/getting-started.html). Installed as `@radjay/sailthru-analytics`, invoked as `sailthru-analytics`.

Designed for AI agents and developers who need quick, scriptable access to Sailthru data from the terminal — campaign stats, list metrics, user lookups, template info, and more.

## Authentication

Sailthru uses a custom MD5-based signature scheme. Every request includes three parameters:

- `api_key` — account identifier
- `format` — response format (`json`)
- `json` — URL-encoded JSON string of request-specific parameters
- `sig` — MD5 hash computed from all parameter values + the secret

**Signature algorithm:**
1. Build payload object: `{ api_key, format, json }`
2. Recursively extract all leaf values (strings, numbers, booleans → 1/0)
3. Sort values alphabetically
4. Concatenate: `secret + sorted_values.join("")`
5. MD5 hex digest of the result

Credentials are obtained from Sailthru → Settings → API & Postbacks.

## Configuration

Both required settings are resolved via `@radjay/resolve-key` using the standard priority chain: flag → cmd flag → environment variable → `.env` file → `~/.config/sailthru-analytics/config.json`.

| Setting | Flag | Cmd flag | Env var | Config key | Default |
|---|---|---|---|---|---|
| API key | `--api-key` | `--api-key-cmd` | `SAILTHRU_API_KEY` | `api_key` | _(required)_ |
| API secret | `--api-secret` | `--api-secret-cmd` | `SAILTHRU_API_SECRET` | `api_secret` | _(required)_ |

Example `~/.config/sailthru-analytics/config.json`:

```json
{
  "api_key": "abc123...",
  "api_secret": "def456..."
}
```

## Commands

### `sailthru-analytics account`

Displays account settings (timezone, domains, verified from-emails). Useful for verifying credentials.

Uses `GET /settings`.

### `sailthru-analytics blasts`

Lists campaigns (mass email sends) with stats.

- `--status <created|scheduled|sending|sent>` — filter by status (default: `sent`)
- `--list <name>` — filter by list name
- `--start-date <YYYY-MM-DD>` — filter by date range start
- `--end-date <YYYY-MM-DD>` — filter by date range end
- `--limit <n>` — max results (default: 20)
- `--skip <n>` — pagination offset (default: 0)

Uses `GET /blast?json={"status":"..."}`.

### `sailthru-analytics blast <blast_id>`

Displays details for a single campaign by ID — subject, list, send time, email count, open totals.

Uses `GET /blast?json={"blast_id":...}`.

### `sailthru-analytics blast-stats <blast_id>`

Displays detailed performance stats for a single campaign.

- `--domain` — include domain breakdown
- `--engagement` — include engagement tier breakdown
- `--device` — include device/client breakdown
- `--urls` — include per-URL click breakdown
- `--signup` — include signup source breakdown
- `--subject` — include subject line stats (A/B tests)
- `--top-users` — include top engaged users

Returns: send count, opens, confirmed opens, estimated opens, clicks, unique clicks, bounces, optouts, spam complaints, revenue, purchases, plus any requested breakdowns.

Uses `GET /stats?json={"stat":"blast","blast_id":...}`.

### `sailthru-analytics blast-stats-summary`

Displays aggregate campaign stats across a date range.

- **Required:** `--start-date <YYYY-MM-DD>` — date range start
- **Required:** `--end-date <YYYY-MM-DD>` — date range end
- `--list <name>` — filter by list
- `--domain` — include domain breakdown
- `--engagement` — include engagement tier breakdown
- `--device` — include device/client breakdown

Uses `GET /stats?json={"stat":"blast","start_date":"...","end_date":"..."}`.

### `sailthru-analytics lists`

Lists all mailing lists with subscriber counts.

- `--primary` — show only primary lists

Uses `GET /list`.

### `sailthru-analytics list <name>`

Displays details for a specific list by name — subscriber count, type, create/send time.

Uses `GET /list?json={"list":"..."}`.

### `sailthru-analytics list-stats`

Displays list subscriber metrics for a given date.

- `--list <name>` — specific list (omit for all lists combined)
- `--date <YYYY-MM-DD>` — snapshot date (default: today)

Returns: active, passive, disengaged, dormant counts, optouts, bounces, new signups, monthly signup breakdown.

Uses `GET /stats?json={"stat":"list"}`.

### `sailthru-analytics templates`

Lists all email templates with metadata.

Uses `GET /template`.

### `sailthru-analytics template <name>`

Displays details for a specific template — subject, from address, content, labels, revision info.

Uses `GET /template?json={"template":"..."}`.

### `sailthru-analytics template-stats`

Displays triggered/transactional send stats for a template over a date range.

- **Required:** `--template <name>` — template name
- **Required:** `--start-date <YYYY-MM-DD>` — date range start
- **Required:** `--end-date <YYYY-MM-DD>` — date range end
- `--domain` — include domain breakdown
- `--engagement` — include engagement tier breakdown
- `--device` — include device/client breakdown

Uses `GET /stats?json={"stat":"send","template":"..."}`.

### `sailthru-analytics user <id>`

Looks up a user profile by email (default), sid, or extid.

- `--key <email|sid|extid>` — identifier type (default: `email`)
- `--activity` — include recent activity (opens, clicks, signups)
- `--lifetime` — include lifetime metrics (messages, pageviews, purchases, revenue)
- `--device` — include device/email client info
- `--purchases` — include purchase history

Uses `GET /user?json={"id":"...","key":"..."}`.

### `sailthru-analytics content`

Lists recent content library items.

- `--limit <n>` — number of items (default: 20, max: 20000)

Uses `GET /content?json={"items":...}`.

### `sailthru-analytics triggers`

Lists all triggers with their templates and events.

- `--template <name>` — filter by template name

Uses `GET /trigger`.

### `sailthru-analytics recurring`

Lists all recurring (repeat) campaigns.

Uses `GET /blast_repeat`.

## Global Options

- `--api-key <key>` — Sailthru API key
- `--api-key-cmd <cmd>` — shell command to retrieve API key
- `--api-secret <secret>` — Sailthru API secret
- `--api-secret-cmd <cmd>` — shell command to retrieve API secret
- `--format <json|table>` — output format (default: `table`)
- `--help` — show help

## Dependencies

- `commander` — CLI framework
- `@radjay/resolve-key` — credential resolution (env vars, config files, .env, shell commands)

## Technical Details

- **Package:** `@radjay/sailthru-analytics`
- **Binary:** `sailthru-analytics`
- **Language:** TypeScript
- **CLI framework:** Commander.js
- **API base:** `https://api.sailthru.com`
- **API auth:** Custom MD5 signature (api_key + sig params on every request)
- **Request format:** `application/x-www-form-urlencoded` with `api_key`, `sig`, `format`, `json` params
- **Config resolution:** `@radjay/resolve-key` for both settings (flag → cmd → env var → .env → config file)
- **Pagination:** `limit` + `skip` on `/blast` endpoint only; other endpoints return all results
- **Rate limits:** 300 GET req/sec, 40 POST/DELETE req/sec; HTTP 429 on exceeded

## Out of Scope (v1)

- Creating/updating/deleting resources (read-only tool)
- POST `/send` (triggered sends)
- POST `/event` (custom events)
- POST `/user` (profile updates)
- POST `/purchase` (purchase tracking)
- Async export jobs (`/job`)
- Ad targeter plans (`/ad/plan`)
- Template previewing (`/preview`)
- Reusable includes (`/include`)
- Data caching
- CSV export
