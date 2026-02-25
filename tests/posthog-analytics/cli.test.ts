import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const CLI = resolve(__dirname, "../../skills/posthog-analytics/dist/index.js");
const API_KEY = process.env["POSTHOG_API_KEY"] ?? "";
const PROJECT_ID = process.env["POSTHOG_PROJECT_ID"] ?? "";

function run(args: string[], env?: Record<string, string>): string {
  return execFileSync("node", [CLI, ...args], {
    encoding: "utf-8",
    env: { ...process.env, ...env },
    timeout: 30000,
  });
}

function runJson(args: string[]): unknown {
  const out = run(["--api-key", API_KEY, "--project-id", PROJECT_ID, "--format", "json", ...args]);
  return JSON.parse(out);
}

describe("posthog-analytics CLI", () => {
  it("shows help with --help", () => {
    const out = run(["--help"]);
    expect(out).toContain("posthog-analytics");
    expect(out).toContain("project");
    expect(out).toContain("query");
    expect(out).toContain("events");
    expect(out).toContain("persons");
    expect(out).toContain("trends");
    expect(out).toContain("web-stats");
    expect(out).toContain("insights");
    expect(out).toContain("dashboards");
    expect(out).toContain("feature-flags");
    expect(out).toContain("schema");
  });

  it("shows version with --version", () => {
    const out = run(["--version"]);
    expect(out.trim()).toBe("0.0.1");
  });

  it("errors when no API key is provided", () => {
    expect(() =>
      run(["project"], { POSTHOG_API_KEY: "", POSTHOG_PROJECT_ID: PROJECT_ID }),
    ).toThrow();
  });

  it("errors when no project ID is provided", () => {
    expect(() =>
      run(["project"], { POSTHOG_API_KEY: API_KEY, POSTHOG_PROJECT_ID: "" }),
    ).toThrow();
  });

  describe("project", () => {
    it("returns project info as JSON", () => {
      const data = runJson(["project"]) as Record<string, unknown>;
      expect(data.id).toBe(254187);
      expect(data.name).toBeTypeOf("string");
      expect((data.name as string).length).toBeGreaterThan(0);
      expect(data.timezone).toBeTypeOf("string");
      expect(data.created_at).toBeTypeOf("string");
    });

    it("returns table format with header and data", () => {
      const out = run(["--api-key", API_KEY, "--project-id", PROJECT_ID, "project"]);
      expect(out).toContain("id");
      expect(out).toContain("name");
      expect(out).toContain("timezone");
      const lines = out.trim().split("\n");
      expect(lines.length).toBe(3); // header, separator, data
    });
  });

  describe("query", () => {
    it("runs a HogQL query and returns results", () => {
      const data = runJson([
        "query",
        "SELECT event, count() FROM events GROUP BY event ORDER BY count() DESC LIMIT 3",
      ]) as { columns: string[]; results: unknown[][] };
      expect(data.columns).toEqual(["event", "count()"]);
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results.length).toBeLessThanOrEqual(3);
    });

    it("table format shows column headers", () => {
      const out = run([
        "--api-key", API_KEY, "--project-id", PROJECT_ID,
        "query",
        "SELECT event, count() FROM events GROUP BY event LIMIT 2",
      ]);
      expect(out).toContain("event");
      expect(out).toContain("count()");
      const lines = out.trim().split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("events", () => {
    it("returns recent events", () => {
      const data = runJson(["events", "--limit", "5"]) as {
        columns: string[];
        results: unknown[][];
      };
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results.length).toBeLessThanOrEqual(5);
      expect(data.columns).toContain("event");
    });

    it("filters by event name", () => {
      const data = runJson(["events", "--event", "$pageview", "--limit", "3"]) as {
        columns: string[];
        results: unknown[][];
      };
      const eventIdx = data.columns.indexOf("event");
      for (const row of data.results) {
        expect(row[eventIdx]).toBe("$pageview");
      }
    });
  });

  describe("trends", () => {
    it("returns trend data for $pageview", () => {
      const data = runJson(["trends", "--event", "$pageview"]) as Array<{
        label: string;
        count: number;
        data: number[];
        days: string[];
      }>;
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].label).toContain("$pageview");
      expect(data[0].count).toBeTypeOf("number");
      expect(data[0].count).toBeGreaterThan(0);
    });

    it("table format shows date and count columns", () => {
      const out = run([
        "--api-key", API_KEY, "--project-id", PROJECT_ID,
        "trends", "--event", "$pageview", "--date-from", "-3d",
      ]);
      expect(out).toContain("label");
      expect(out).toContain("date");
      expect(out).toContain("count");
    });
  });

  describe("web-stats overview", () => {
    it("returns overview metrics as JSON", () => {
      const data = runJson(["web-stats", "overview"]) as Array<{
        key: string;
        value: number | null;
        kind: string;
      }>;
      expect(data.length).toBeGreaterThan(0);
      const keys = data.map((item) => item.key);
      expect(keys).toContain("visitors");
      expect(keys).toContain("views");
      expect(keys).toContain("sessions");
    });

    it("table format shows metric and value columns", () => {
      const out = run([
        "--api-key", API_KEY, "--project-id", PROJECT_ID,
        "web-stats", "overview",
      ]);
      expect(out).toContain("metric");
      expect(out).toContain("value");
      const lines = out.trim().split("\n");
      // header + separator + at least 5 metrics
      expect(lines.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe("web-stats breakdown", () => {
    it("returns page breakdown as JSON", () => {
      const data = runJson(["web-stats", "breakdown", "--by", "Page", "--limit", "3"]) as {
        columns: string[];
        results: unknown[][];
      };
      expect(data.columns.length).toBeGreaterThan(0);
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.results.length).toBeLessThanOrEqual(3);
    });

    it("returns browser breakdown", () => {
      const data = runJson(["web-stats", "breakdown", "--by", "Browser", "--limit", "3"]) as {
        columns: string[];
        results: unknown[][];
      };
      expect(data.results.length).toBeGreaterThan(0);
    });

    it("table format shows data rows", () => {
      const out = run([
        "--api-key", API_KEY, "--project-id", PROJECT_ID,
        "web-stats", "breakdown", "--by", "Country", "--limit", "3",
      ]);
      const lines = out.trim().split("\n");
      // header + separator + at least 1 data row
      expect(lines.length).toBeGreaterThanOrEqual(3);
    });

    it("errors on invalid breakdown dimension", () => {
      expect(() =>
        run([
          "--api-key", API_KEY, "--project-id", PROJECT_ID,
          "web-stats", "breakdown", "--by", "InvalidDimension",
        ]),
      ).toThrow();
    });
  });

  describe("dashboards", () => {
    it("returns dashboards with expected fields", () => {
      const data = runJson(["dashboards"]) as Array<{
        id: number;
        name: string;
        pinned: boolean;
        created_at: string;
      }>;
      expect(data.length).toBeGreaterThan(0);
      const d = data[0];
      expect(d.id).toBeTypeOf("number");
      expect(d.name).toBeTypeOf("string");
      expect(d.name.length).toBeGreaterThan(0);
      expect(d.created_at).toBeTypeOf("string");
    });
  });

  describe("schema events", () => {
    it("returns event definitions", () => {
      const data = runJson(["schema", "events"]) as Array<{
        name: string;
      }>;
      expect(data.length).toBeGreaterThan(0);
      const names = data.map((e) => e.name);
      expect(names).toContain("$pageview");
    });

    it("table format shows name column", () => {
      const out = run([
        "--api-key", API_KEY, "--project-id", PROJECT_ID,
        "schema", "events",
      ]);
      expect(out).toContain("name");
      expect(out).toContain("$pageview");
    });
  });

  describe("schema properties", () => {
    it("returns property definitions", () => {
      const data = runJson(["schema", "properties", "--limit", "5"]) as Array<{
        name: string;
        is_numerical: boolean;
      }>;
      expect(data.length).toBeGreaterThan(0);
      expect(data[0].name).toBeTypeOf("string");
      expect(typeof data[0].is_numerical).toBe("boolean");
    });
  });
});
