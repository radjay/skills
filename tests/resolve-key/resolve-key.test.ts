import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolveKey } from "@radjay/resolve-key";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const TMP = join(tmpdir(), `resolve-key-test-${process.pid}`);

beforeEach(() => mkdirSync(TMP, { recursive: true }));
afterEach(() => rmSync(TMP, { recursive: true, force: true }));

const base = {
  envVar: "TEST_RESOLVE_KEY",
  appName: "resolve-key-test",
};

describe("resolveKey", () => {
  it("returns undefined when no source provides a key", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    try {
      expect(resolveKey(base)).toBeUndefined();
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
    }
  });

  it("flag takes highest priority", () => {
    process.env[base.envVar] = "from-env";
    try {
      expect(resolveKey({ ...base, flag: "from-flag" })).toBe("from-flag");
    } finally {
      delete process.env[base.envVar];
    }
  });

  it("reads from environment variable", () => {
    process.env[base.envVar] = "env-value";
    try {
      expect(resolveKey(base)).toBe("env-value");
    } finally {
      delete process.env[base.envVar];
    }
  });

  it("reads from .env file", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const dotenvPath = join(TMP, ".env");
    writeFileSync(dotenvPath, `${base.envVar}=dotenv-value\n`);
    try {
      expect(resolveKey({ ...base, dotenvFiles: [dotenvPath] })).toBe("dotenv-value");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
    }
  });

  it("strips quotes from .env values", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const dotenvPath = join(TMP, ".env");
    writeFileSync(dotenvPath, `${base.envVar}="quoted-value"\n`);
    try {
      expect(resolveKey({ ...base, dotenvFiles: [dotenvPath] })).toBe("quoted-value");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
    }
  });

  it("skips comments and blank lines in .env", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const dotenvPath = join(TMP, ".env");
    writeFileSync(dotenvPath, `# comment\n\nOTHER=foo\n${base.envVar}=found\n`);
    try {
      expect(resolveKey({ ...base, dotenvFiles: [dotenvPath] })).toBe("found");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
    }
  });

  it("reads from config file", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const savedXdg = process.env["XDG_CONFIG_HOME"];
    process.env["XDG_CONFIG_HOME"] = TMP;
    const configDir = join(TMP, base.appName);
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, "config.json"), JSON.stringify({ api_key: "config-value" }));
    try {
      expect(resolveKey(base)).toBe("config-value");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
      if (savedXdg !== undefined) {
        process.env["XDG_CONFIG_HOME"] = savedXdg;
      } else {
        delete process.env["XDG_CONFIG_HOME"];
      }
    }
  });

  it("supports custom configKey", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const savedXdg = process.env["XDG_CONFIG_HOME"];
    process.env["XDG_CONFIG_HOME"] = TMP;
    const configDir = join(TMP, base.appName);
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, "config.json"), JSON.stringify({ token: "custom-key" }));
    try {
      expect(resolveKey({ ...base, configKey: "token" })).toBe("custom-key");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
      if (savedXdg !== undefined) {
        process.env["XDG_CONFIG_HOME"] = savedXdg;
      } else {
        delete process.env["XDG_CONFIG_HOME"];
      }
    }
  });

  it("keyCmd executes shell command and returns output", () => {
    expect(resolveKey({ ...base, keyCmd: "echo cmd-value" })).toBe("cmd-value");
  });

  it("keyCmd takes priority over env var", () => {
    process.env[base.envVar] = "from-env";
    try {
      expect(resolveKey({ ...base, keyCmd: "echo from-cmd" })).toBe("from-cmd");
    } finally {
      delete process.env[base.envVar];
    }
  });

  it("keyCmd throws on empty output", () => {
    expect(() => resolveKey({ ...base, keyCmd: "echo" })).toThrow("empty output");
  });

  it("keyCmd throws on failing command", () => {
    expect(() => resolveKey({ ...base, keyCmd: "false" })).toThrow("--api-key-cmd failed");
  });

  it("env var takes priority over .env file", () => {
    process.env[base.envVar] = "from-env";
    const dotenvPath = join(TMP, ".env");
    writeFileSync(dotenvPath, `${base.envVar}=from-dotenv\n`);
    try {
      expect(resolveKey({ ...base, dotenvFiles: [dotenvPath] })).toBe("from-env");
    } finally {
      delete process.env[base.envVar];
    }
  });

  it(".env takes priority over config file", () => {
    const saved = process.env[base.envVar];
    delete process.env[base.envVar];
    const savedXdg = process.env["XDG_CONFIG_HOME"];
    process.env["XDG_CONFIG_HOME"] = TMP;

    const dotenvPath = join(TMP, ".env");
    writeFileSync(dotenvPath, `${base.envVar}=from-dotenv\n`);

    const configDir = join(TMP, base.appName);
    mkdirSync(configDir, { recursive: true });
    writeFileSync(join(configDir, "config.json"), JSON.stringify({ api_key: "from-config" }));

    try {
      expect(resolveKey({ ...base, dotenvFiles: [dotenvPath] })).toBe("from-dotenv");
    } finally {
      if (saved !== undefined) process.env[base.envVar] = saved;
      if (savedXdg !== undefined) {
        process.env["XDG_CONFIG_HOME"] = savedXdg;
      } else {
        delete process.env["XDG_CONFIG_HOME"];
      }
    }
  });
});
