# @radjay/kit-analytics

CLI tool for pulling newsletter data from [Kit.com](https://kit.com) via the Kit API v4.

## Install

```bash
npm install -g @radjay/kit-analytics
```

## Configuration

Provide your Kit API key via any of these methods (in priority order):

1. `--api-key` flag
2. `--api-key-cmd` flag (shell command, e.g. `--api-key-cmd "op read ..."`)
3. `KIT_API_KEY` environment variable
4. `.env` file in the current directory
5. `~/.config/kit-analytics/config.json` (`api_key` field)

## Commands

| Command | Description |
|---|---|
| `account` | Display account info (name, plan, subscriber count) |
| `subscribers` | List subscribers with filtering by status, tag, date range |
| `broadcasts` | List sent emails with stats (open rate, click rate, etc.) |
| `tags` | List all tags with subscriber counts |
| `forms` | List all forms with subscriber counts |
| `sequences` | List all sequences with subscriber counts |

## Examples

```bash
# Verify setup
kit-analytics account

# Active subscribers added this month
kit-analytics subscribers --status active --since 2025-02-01

# Broadcast performance
kit-analytics broadcasts --limit 10

# JSON output
kit-analytics tags --format json
```

## Global Options

- `--api-key <key>` — Kit API key
- `--api-key-cmd <cmd>` — shell command to retrieve API key
- `--format <json|table>` — output format (default: `table`)
- `--help` — show help
