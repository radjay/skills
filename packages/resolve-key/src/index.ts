import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";

export interface ResolveKeyOptions {
  /** Key passed directly via CLI flag */
  flag?: string;
  /** Environment variable name to check */
  envVar: string;
  /** App name used for config directory (~/.config/<appName>/config.json) */
  appName: string;
  /** Key within the config JSON to read (defaults to "api_key") */
  configKey?: string;
  /** .env file paths to search (defaults to [".env"]) */
  dotenvFiles?: string[];
  /** Shell command whose stdout provides the key */
  keyCmd?: string;
}

/**
 * Resolve an API key from multiple sources, in priority order:
 *
 * 1. Explicit flag value (--api-key)
 * 2. Shell command (--api-key-cmd)
 * 3. Environment variable
 * 4. .env file
 * 5. Config file (~/.config/<appName>/config.json)
 */
export function resolveKey(opts: ResolveKeyOptions): string | undefined {
  const { flag, envVar, appName, configKey = "api_key", keyCmd } = opts;
  const dotenvFiles = opts.dotenvFiles ?? [".env"];

  // 1. Explicit flag
  if (flag) return flag;

  // 2. Shell command
  if (keyCmd) {
    return execKeyCmd(keyCmd);
  }

  // 3. Environment variable
  const envValue = process.env[envVar];
  if (envValue) return envValue;

  // 4. .env file
  const dotenvValue = readDotenv(dotenvFiles, envVar);
  if (dotenvValue) return dotenvValue;

  // 5. Config file
  const configValue = readConfigFile(appName, configKey);
  if (configValue) return configValue;

  return undefined;
}

function execKeyCmd(cmd: string): string {
  try {
    const result = execSync(cmd, {
      encoding: "utf-8",
      timeout: 10000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const trimmed = result.trim();
    if (!trimmed) {
      throw new Error(`--api-key-cmd produced empty output`);
    }
    return trimmed;
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("--api-key-cmd")) {
      throw err;
    }
    throw new Error(
      `--api-key-cmd failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function readDotenv(files: string[], key: string): string | undefined {
  for (const file of files) {
    if (!existsSync(file)) continue;
    try {
      const content = readFileSync(file, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex === -1) continue;
        const k = trimmed.slice(0, eqIndex).trim();
        if (k !== key) continue;
        let v = trimmed.slice(eqIndex + 1).trim();
        // Strip surrounding quotes
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        if (v) return v;
      }
    } catch {
      // Ignore unreadable files
    }
  }
  return undefined;
}

function configDir(appName: string): string {
  const xdg = process.env["XDG_CONFIG_HOME"];
  const base = xdg || join(homedir(), ".config");
  return join(base, appName);
}

function readConfigFile(
  appName: string,
  configKey: string,
): string | undefined {
  const filePath = join(configDir(appName), "config.json");
  if (!existsSync(filePath)) return undefined;
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    const value = data[configKey];
    return typeof value === "string" && value ? value : undefined;
  } catch {
    return undefined;
  }
}
