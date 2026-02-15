# PRD: kit-analytics

## Overview

CLI tool that pulls newsletter data from [Kit.com](https://kit.com) via the [Kit API v4](https://developers.kit.com/api-reference/overview). Installed as `@skills/kit-analytics`, invoked as `kit-analytics`.

## Authentication

- Kit API v4 uses `X-Kit-Api-Key` header auth
- The CLI accepts the API key via `KIT_API_KEY` environment variable or `--api-key` flag
- Base URL: `https://api.kit.com/v4/`

## Commands

### `kit-analytics account`

Displays account info (name, plan, subscriber count).

### `kit-analytics subscribers`

Lists subscribers with pagination. Options:
- `--status <active|cancelled|bounced|complained>` — filter by status
- `--tag <tag_id>` — filter by tag
- `--since <date>` / `--until <date>` — filter by date range
- `--limit <n>` — max results

### `kit-analytics broadcasts`

Lists broadcasts (sent emails) with stats (open rate, click rate, unsubscribes, etc.). Options:
- `--status <draft|published|sent>` — filter by status
- `--limit <n>` — max results

### `kit-analytics tags`

Lists all tags with subscriber counts.

### `kit-analytics forms`

Lists all forms with subscriber counts.

### `kit-analytics sequences`

Lists all sequences with subscriber counts.

## Global Options

- `--api-key <key>` — Kit API key (overrides `KIT_API_KEY` env var)
- `--format <json|table>` — output format (default: `table`)
- `--help` — show help

## Technical Details

- **Package:** `@skills/kit-analytics`
- **Binary:** `kit-analytics`
- **Language:** TypeScript
- **API base:** `https://api.kit.com/v4/`
- **Pagination:** cursor-based (as per Kit API v4)

## Out of Scope (v1)

- Creating/updating/deleting resources (read-only tool)
- Webhooks
- Purchases
- Custom fields
- Data caching
- CSV export
