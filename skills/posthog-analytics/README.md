# @radjay/posthog-analytics

CLI tool for pulling product analytics and web analytics data from [PostHog](https://posthog.com). Designed for AI agents and developers who need scriptable access to PostHog from the terminal.

## Install

```bash
npm install -g @radjay/posthog-analytics
```

## Configuration

You need a **personal API key** and **project ID** from PostHog. Create an API key in PostHog → Account Settings → Personal API Keys. Find your project ID in PostHog → Settings → Project.

All settings are resolved in priority order: flag → cmd flag → env var → `.env` → `~/.config/posthog-analytics/config.json`.

| Setting | Flag | Env var | Config key | Default |
|---|---|---|---|---|
| API key | `--api-key` | `POSTHOG_API_KEY` | `api_key` | _(required)_ |
| Project ID | `--project-id` | `POSTHOG_PROJECT_ID` | `project_id` | _(required)_ |
| Host | `--host` | `POSTHOG_HOST` | `host` | `https://us.posthog.com` |

### Quick setup with env vars

```bash
export POSTHOG_API_KEY="phx_abc123..."
export POSTHOG_PROJECT_ID="12345"
```

### Or config file

```bash
mkdir -p ~/.config/posthog-analytics
echo '{"api_key":"phx_...","project_id":"12345"}' > ~/.config/posthog-analytics/config.json
```

## Commands

| Command | Description |
|---|---|
| `project` | Display project info (verify credentials) |
| `query <sql>` | Run a HogQL (SQL) query |
| `events` | List recent events |
| `persons` | Search and filter persons (users) |
| `trends` | Event trends over time with breakdowns |
| `web-stats overview` | High-level web metrics with period comparison |
| `web-stats breakdown` | Web stats by dimension (pages, sources, devices, geo) |
| `web-stats goals` | Conversion goal metrics |
| `insights` | List saved insights |
| `dashboards` | List dashboards |
| `feature-flags` | List feature flags |
| `schema events` | List event definitions |
| `schema properties` | List property definitions |

## Examples

```bash
# Verify setup
posthog-analytics project

# Top events by volume
posthog-analytics query "SELECT event, count() FROM events GROUP BY event ORDER BY count() DESC LIMIT 10"

# Pageview trend, last 30 days
posthog-analytics trends --event '$pageview' --date-from -30d --interval week

# Web traffic overview
posthog-analytics web-stats overview

# Top pages
posthog-analytics web-stats breakdown --by Page

# Search users
posthog-analytics persons --search "alice@example.com"

# JSON output
posthog-analytics events --format json
```

## Global Options

- `--api-key <key>` / `--api-key-cmd <cmd>` — PostHog API key
- `--project-id <id>` / `--project-id-cmd <cmd>` — PostHog project ID
- `--host <url>` / `--host-cmd <cmd>` — PostHog instance URL
- `--format <json|table>` — output format (default: `table`)
- `--help` — show help
