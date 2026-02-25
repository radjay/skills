# @radjay/posthog-analytics

CLI tool for pulling product analytics and web analytics data from [PostHog](https://posthog.com). Designed for AI agents and developers who need scriptable access to PostHog from the terminal.

## Install

```bash
npm install -g @radjay/posthog-analytics
```

Or run directly from the monorepo:

```bash
pnpm --filter @radjay/posthog-analytics build
```

## Getting Your PostHog API Key

You need two things: a **personal API key** and your **project ID**.

### 1. Create a Personal API Key

1. Log in to your PostHog instance (e.g. [us.posthog.com](https://us.posthog.com) or [eu.posthog.com](https://eu.posthog.com))
2. Click your **avatar** in the bottom-left corner
3. Click the **gear icon** to open **Account settings**
4. Go to the **Personal API Keys** tab
5. Click **Create personal API key**
6. Give it a name (e.g. "posthog-analytics CLI")
7. Under **Scopes**, grant at minimum:
   - **Query: Read** (required for `query`, `events`, `trends`, `web-stats`)
   - **Project: Read** (required for `project`)
   - **Person: Read** (required for `persons`)
   - **Feature Flag: Read** (required for `feature-flags`)
   - **Dashboard: Read** (required for `dashboards`, `insights`)
   - **Event Definition: Read** (required for `schema events`)
   - **Property Definition: Read** (required for `schema properties`)
8. Click **Create key**
9. **Copy the key immediately** — it is only shown once

### 2. Find Your Project ID

1. In PostHog, go to **Settings** (gear icon in the left sidebar)
2. Under **Project**, find the **Project ID** (a number like `12345`)

Alternatively, call the API directly:

```bash
curl -H "Authorization: Bearer <your-api-key>" https://us.posthog.com/api/projects/
```

## Configuration

The CLI needs three settings: **API key**, **project ID**, and **host**. Each is resolved in priority order:

1. CLI flag (e.g. `--api-key`)
2. Shell command flag (e.g. `--api-key-cmd "op read ..."`)
3. Environment variable (e.g. `POSTHOG_API_KEY`)
4. `.env` file in the current directory
5. Config file at `~/.config/posthog-analytics/config.json`

| Setting | Flag | Env var | Config key | Default |
|---|---|---|---|---|
| API key | `--api-key` | `POSTHOG_API_KEY` | `api_key` | _(required)_ |
| Project ID | `--project-id` | `POSTHOG_PROJECT_ID` | `project_id` | _(required)_ |
| Host | `--host` | `POSTHOG_HOST` | `host` | `https://us.posthog.com` |

### Option A: Environment Variables

```bash
export POSTHOG_API_KEY="phx_abc123..."
export POSTHOG_PROJECT_ID="12345"
# export POSTHOG_HOST="https://eu.posthog.com"  # only if EU or self-hosted
```

### Option B: Config File

```bash
mkdir -p ~/.config/posthog-analytics
cat > ~/.config/posthog-analytics/config.json << 'EOF'
{
  "api_key": "phx_abc123...",
  "project_id": "12345",
  "host": "https://us.posthog.com"
}
EOF
```

### Option C: `.env` File

```env
POSTHOG_API_KEY=phx_abc123...
POSTHOG_PROJECT_ID=12345
POSTHOG_HOST=https://us.posthog.com
```

### Option D: Secret Manager (via `--*-cmd` flags)

```bash
posthog-analytics --api-key-cmd "op read 'op://Vault/PostHog/api_key'" project
```

## Quick Start

Verify your setup:

```bash
posthog-analytics project
```

```
id    name        timezone          created_at
---   ---------   ---------------   -------------------------
1234  My Project  America/New_York  2024-06-15T10:30:00.000Z
```

## Commands

### `project`

Display current project info. Good for verifying credentials.

```bash
posthog-analytics project
```

### `query`

Run a raw HogQL (SQL) query. This is the most powerful and flexible command.

```bash
# Top 10 events by volume
posthog-analytics query "SELECT event, count() FROM events GROUP BY event ORDER BY count() DESC LIMIT 10"

# Unique users in the last 30 days
posthog-analytics query "SELECT count(DISTINCT distinct_id) FROM events WHERE timestamp >= now() - INTERVAL 30 DAY"

# Average session duration
posthog-analytics query "SELECT avg(duration) FROM sessions WHERE min_timestamp >= now() - INTERVAL 7 DAY"
```

### `events`

List recent events.

```bash
# All events from the last 7 days
posthog-analytics events

# Only pageviews, last 30 days, max 50
posthog-analytics events --event '$pageview' --days 30 --limit 50
```

### `persons`

List and search persons (users).

```bash
# Search by email
posthog-analytics persons --search "alice@example.com"

# Filter by distinct ID
posthog-analytics persons --distinct-id "user_abc123"

# Filter by person properties
posthog-analytics persons --properties '[{"key":"plan","value":"pro","operator":"exact","type":"person"}]'
```

### `trends`

Run a trends query for an event over time.

```bash
# Pageview trend, last 7 days, daily
posthog-analytics trends --event '$pageview'

# Last 30 days, weekly interval
posthog-analytics trends --event '$pageview' --date-from -30d --interval week

# Break down by browser
posthog-analytics trends --event '$pageview' --breakdown '$browser'

# Break down by country (person property)
posthog-analytics trends --event 'signup' --breakdown '$geoip_country_name' --breakdown-type person
```

### `web-stats`

Web analytics commands that mirror the PostHog web analytics dashboard.

#### `web-stats overview`

High-level metrics: visitors, pageviews, sessions, bounce rate, session duration — with period-over-period comparison.

```bash
# Last 7 days (default)
posthog-analytics web-stats overview

# Last 30 days, no comparison
posthog-analytics web-stats overview --date-from -30d --no-compare
```

```
metric            value   previous  change
----------------  ------  --------  ------
Unique visitors   1,245   1,102     +13.0%
Pageviews         4,892   4,310     +13.5%
Sessions          2,156   1,893     +13.9%
Session duration  42.3s   38.1s     +11.0%
Bounce rate       45.2%   48.1%     -6.0%
```

#### `web-stats breakdown`

Break down web stats by any dimension.

```bash
# Top pages
posthog-analytics web-stats breakdown --by Page

# Traffic sources
posthog-analytics web-stats breakdown --by InitialChannelType

# Top referring domains
posthog-analytics web-stats breakdown --by InitialReferringDomain

# Browsers
posthog-analytics web-stats breakdown --by Browser

# Countries, top 20
posthog-analytics web-stats breakdown --by Country --limit 20

# UTM campaigns with bounce rate
posthog-analytics web-stats breakdown --by InitialUTMCampaign --include-bounce-rate
```

Available breakdown dimensions:

| Category | Dimensions |
|---|---|
| Pages | `Page`, `InitialPage`, `ExitPage` |
| Sources | `InitialChannelType`, `InitialReferringDomain`, `InitialUTMSource`, `InitialUTMCampaign`, `InitialUTMMedium`, `InitialUTMTerm`, `InitialUTMContent`, `InitialUTMSourceMediumCampaign` |
| Devices | `Browser`, `OS`, `DeviceType`, `Viewport` |
| Geography | `Country`, `Region`, `City`, `Timezone`, `Language` |

#### `web-stats goals`

Conversion goal metrics.

```bash
posthog-analytics web-stats goals
posthog-analytics web-stats goals --date-from -30d --limit 20
```

### `insights`

List saved insights in the project.

```bash
posthog-analytics insights
posthog-analytics insights --search "revenue"
```

### `dashboards`

List dashboards.

```bash
posthog-analytics dashboards
```

### `feature-flags`

List feature flags and their status.

```bash
posthog-analytics feature-flags
posthog-analytics feature-flags --search "onboarding"
```

### `schema`

Discover what events and properties exist in your project. Useful before writing HogQL queries.

#### `schema events`

List all event names the project has seen.

```bash
posthog-analytics schema events
posthog-analytics schema events --search "signup"
```

#### `schema properties`

List property definitions.

```bash
# All properties
posthog-analytics schema properties

# Only person properties
posthog-analytics schema properties --type person

# Search for URL-related properties
posthog-analytics schema properties --search "url"
```

## Output Formats

All commands support `--format json` for machine-readable output:

```bash
# Table (default)
posthog-analytics web-stats overview

# JSON
posthog-analytics web-stats overview --format json
```

## Host Configuration

| Instance | Host URL |
|---|---|
| US Cloud | `https://us.posthog.com` (default) |
| EU Cloud | `https://eu.posthog.com` |
| Self-hosted | Your instance URL (e.g. `https://posthog.mycompany.com`) |

## Rate Limits

PostHog enforces rate limits per organization:

| Endpoint type | Limits |
|---|---|
| Query API (`query`, `events`, `trends`, `web-stats`) | 2,400/hour |
| Analytics REST (`persons`, `insights`, `dashboards`) | 240/min, 1,200/hour |
| CRUD REST (`feature-flags`, `schema`) | 480/min, 4,800/hour |
