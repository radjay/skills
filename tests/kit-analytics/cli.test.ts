import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const CLI = resolve(__dirname, "../../skills/kit-analytics/dist/index.js");
const API_KEY = process.env["KIT_API_KEY"] ?? "";

function run(args: string[], env?: Record<string, string>): string {
  return execFileSync("node", [CLI, ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
    timeout: 15000,
  });
}

describe("kit-analytics CLI", () => {
  it("shows help with --help", () => {
    const out = run(["--help"]);
    expect(out).toContain("kit-analytics");
    expect(out).toContain("account");
    expect(out).toContain("subscribers");
    expect(out).toContain("broadcasts");
    expect(out).toContain("tags");
    expect(out).toContain("forms");
    expect(out).toContain("sequences");
  });

  it("shows version with --version", () => {
    const out = run(["--version"]);
    expect(out.trim()).toBe("0.0.1");
  });

  it("errors when no API key is provided", () => {
    expect(() => run(["account"], { KIT_API_KEY: "" })).toThrow();
  });

  it("account command returns table output", () => {
    const out = run(["--api-key", API_KEY, "account"]);
    expect(out).toContain("name");
    expect(out).toContain("plan");
    expect(out).toContain("email");
  });

  it("account command returns JSON with --format json", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "account"]);
    const data = JSON.parse(out);
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("plan");
    expect(data).toHaveProperty("email");
  });

  it("subscribers command returns output", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "subscribers", "--limit", "2"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
  });

  it("broadcasts command returns output", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "broadcasts", "--limit", "2"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
  });

  it("tags command returns output", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "tags"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
  });

  it("forms command returns output", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "forms"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
  });

  it("sequences command returns output", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "sequences"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
  });
});
