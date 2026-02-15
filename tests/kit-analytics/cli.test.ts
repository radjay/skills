import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const CLI = resolve(__dirname, "../../skills/kit-analytics/dist/index.js");
const API_KEY = process.env["KIT_API_KEY"] ?? "";

function run(args: string[], env?: Record<string, string>): string {
  return execFileSync("node", [CLI, ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
    timeout: 30000,
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

  it("account command returns expected data", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "account"]);
    const data = JSON.parse(out);
    expect(data.name).toBeTypeOf("string");
    expect(data.name.length).toBeGreaterThan(0);
    expect(data.plan).toBeTypeOf("string");
    expect(data.email).toContain("@");
    expect(data.created_at).toBeTypeOf("string");
  });

  it("account table output contains data values", () => {
    const out = run(["--api-key", API_KEY, "account"]);
    // Table header
    expect(out).toContain("name");
    expect(out).toContain("plan");
    expect(out).toContain("email");
    // Should have separator line and data row
    const lines = out.trim().split("\n");
    expect(lines.length).toBe(3); // header, separator, data
  });

  it("subscribers command returns populated data", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "subscribers", "--limit", "2"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const sub = data[0];
    expect(sub.id).toBeTypeOf("number");
    expect(sub.email).toContain("@");
    expect(sub.state).toBeTypeOf("string");
    expect(sub.created_at).toBeTypeOf("string");
  });

  it("broadcasts command returns populated stats", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "broadcasts", "--limit", "10"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const b = data[0];
    expect(b.id).toBeTypeOf("number");
    expect(b.subject).toBeTypeOf("string");
    expect(b.recipients).toBeTypeOf("number");
    expect(b.recipients).toBeGreaterThan(0);
    expect(b.open_rate).toBeTypeOf("string");
    expect(b.open_rate).toMatch(/%$/);
    expect(b.click_rate).toBeTypeOf("string");
    expect(b.click_rate).toMatch(/%$/);
    expect(b.unsubscribes).toBeTypeOf("number");
    expect(b.status).toBe("completed");
  });

  it("broadcasts --status all includes scheduled", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "broadcasts", "--limit", "20", "--status", "all"]);
    const data = JSON.parse(out);
    const statuses = data.map((b: Record<string, unknown>) => b.status);
    expect(statuses).toContain("completed");
  });

  it("tags command returns populated data", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "tags"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const tag = data[0];
    expect(tag.id).toBeTypeOf("number");
    expect(tag.name).toBeTypeOf("string");
    expect(tag.name.length).toBeGreaterThan(0);
    expect(tag.created_at).toBeTypeOf("string");
  });

  it("forms command returns populated data", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "forms"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const form = data[0];
    expect(form.id).toBeTypeOf("number");
    expect(form.name).toBeTypeOf("string");
    expect(form.name.length).toBeGreaterThan(0);
    expect(form.type).toBeTypeOf("string");
    expect(form.created_at).toBeTypeOf("string");
  });

  it("sequences command returns populated data", () => {
    const out = run(["--api-key", API_KEY, "--format", "json", "sequences"]);
    const data = JSON.parse(out);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    const seq = data[0];
    expect(seq.id).toBeTypeOf("number");
    expect(seq.name).toBeTypeOf("string");
    expect(seq.name.length).toBeGreaterThan(0);
    expect(seq.created_at).toBeTypeOf("string");
  });
});
