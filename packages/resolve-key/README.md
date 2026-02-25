# @radjay/resolve-key

Flexible API key resolution for CLI tools. Resolves secrets from multiple sources with a consistent priority chain.

## Install

```bash
npm install @radjay/resolve-key
```

## Usage

```typescript
import { resolveKey } from "@radjay/resolve-key";

const apiKey = await resolveKey({
  flag: opts.apiKey,           // --api-key flag value
  keyCmd: opts.apiKeyCmd,      // --api-key-cmd flag value
  envVar: "MY_API_KEY",        // environment variable name
  appName: "my-cli",           // used for ~/.config/<appName>/config.json
  configKey: "api_key",        // key in config JSON (default: "api_key")
  dotenvFiles: [".env"],       // .env file paths (default: [".env"])
});
```

## Resolution Order

1. **CLI flag** — direct value passed via flag (e.g. `--api-key`)
2. **Shell command** — output of a shell command (e.g. `--api-key-cmd "op read ..."`)
3. **Environment variable** — e.g. `MY_API_KEY=...`
4. **`.env` file** — parsed from `.env` in the current directory
5. **Config file** — JSON file at `~/.config/<appName>/config.json`

Returns `undefined` if no source provides a value.

## API

### `resolveKey(options): Promise<string | undefined>`

| Option | Type | Required | Description |
|---|---|---|---|
| `flag` | `string` | No | Direct value from a CLI flag |
| `keyCmd` | `string` | No | Shell command whose stdout is the key |
| `envVar` | `string` | Yes | Environment variable name |
| `appName` | `string` | Yes | App name for config directory |
| `configKey` | `string` | No | JSON key to read (default: `"api_key"`) |
| `dotenvFiles` | `string[]` | No | Paths to .env files (default: `[".env"]`) |
