import { describe, it, expect } from "vitest";
import { PostHogClient } from "../../skills/posthog-analytics/src/api.js";

const API_KEY = process.env["POSTHOG_API_KEY"] ?? "";
const PROJECT_ID = process.env["POSTHOG_PROJECT_ID"] ?? "";
const HOST = process.env["POSTHOG_HOST"] ?? "https://us.posthog.com";
const client = new PostHogClient({ apiKey: API_KEY, host: HOST, projectId: PROJECT_ID });

describe("PostHogClient", () => {
  describe("getProject", () => {
    it("returns project with name, timezone, and id", async () => {
      const project = await client.getProject();
      expect(project.id).toBe(254187);
      expect(project.name).toBeTypeOf("string");
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.timezone).toBeTypeOf("string");
      expect(project.created_at).toBeTypeOf("string");
    });
  });

  describe("hogqlQuery", () => {
    it("returns columns and results for a count query", async () => {
      const res = await client.hogqlQuery(
        "SELECT event, count() FROM events GROUP BY event ORDER BY count() DESC LIMIT 5",
      );
      expect(res.columns).toEqual(["event", "count()"]);
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.length).toBeLessThanOrEqual(5);
      // Each row should be [string, number]
      const row = res.results[0];
      expect(row[0]).toBeTypeOf("string");
      expect(row[1]).toBeTypeOf("number");
    });

    it("returns hogql echo of the query", async () => {
      const res = await client.hogqlQuery("SELECT 1");
      expect(res.hogql).toBeTypeOf("string");
      expect(res.hogql).toContain("SELECT");
    });
  });

  describe("trendsQuery", () => {
    it("returns trend data for $pageview", async () => {
      const res = await client.trendsQuery({ event: "$pageview" });
      expect(res.results.length).toBeGreaterThan(0);
      const series = res.results[0];
      expect(series.label).toContain("$pageview");
      expect(series.count).toBeTypeOf("number");
      expect(series.count).toBeGreaterThan(0);
      expect(series.days.length).toBeGreaterThan(0);
      expect(series.data.length).toBe(series.days.length);
    });

    it("respects date range", async () => {
      const res = await client.trendsQuery({
        event: "$pageview",
        dateFrom: "-3d",
        interval: "day",
      });
      const series = res.results[0];
      // -3d with daily interval should give ~4 days (today + 3 prior)
      expect(series.days.length).toBeLessThanOrEqual(5);
      expect(series.days.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("webOverviewQuery", () => {
    it("returns overview items with expected keys", async () => {
      const res = await client.webOverviewQuery({ dateFrom: "-7d" });
      expect(res.results.length).toBeGreaterThan(0);

      const keys = res.results.map((item) => item.key);
      expect(keys).toContain("visitors");
      expect(keys).toContain("views");
      expect(keys).toContain("sessions");
      expect(keys).toContain("bounce rate");
      expect(keys).toContain("session duration");
    });

    it("each item has value and kind", async () => {
      const res = await client.webOverviewQuery({ dateFrom: "-7d" });
      for (const item of res.results) {
        expect(item.key).toBeTypeOf("string");
        expect(item.value).toBeTypeOf("number");
        expect(["unit", "duration_s", "percentage", "currency"]).toContain(item.kind);
      }
    });

    it("includes previous values for comparison", async () => {
      const res = await client.webOverviewQuery({ dateFrom: "-7d", compare: true });
      for (const item of res.results) {
        expect(item.previous).toBeTypeOf("number");
      }
    });
  });

  describe("webStatsTableQuery", () => {
    it("returns page breakdown with columns and results", async () => {
      const res = await client.webStatsTableQuery({
        breakdownBy: "Page",
        dateFrom: "-7d",
        limit: 5,
      });
      expect(res.columns.length).toBeGreaterThan(0);
      expect(res.results.length).toBeGreaterThan(0);
      expect(res.results.length).toBeLessThanOrEqual(5);
    });

    it("returns browser breakdown", async () => {
      const res = await client.webStatsTableQuery({
        breakdownBy: "Browser",
        dateFrom: "-7d",
        limit: 3,
      });
      expect(res.results.length).toBeGreaterThan(0);
      // First column is the breakdown value (browser name)
      const firstRow = res.results[0] as unknown[];
      expect(firstRow[0]).toBeTypeOf("string");
    });

    it("returns country breakdown", async () => {
      const res = await client.webStatsTableQuery({
        breakdownBy: "Country",
        dateFrom: "-7d",
        limit: 3,
      });
      expect(res.results.length).toBeGreaterThan(0);
    });
  });

  describe("listDashboards", () => {
    it("returns dashboards with expected fields", async () => {
      const res = await client.listDashboards({ limit: "5" });
      expect(res.results.length).toBeGreaterThan(0);
      const dashboard = res.results[0];
      expect(dashboard.id).toBeTypeOf("number");
      expect(dashboard.name).toBeTypeOf("string");
      expect(dashboard.name.length).toBeGreaterThan(0);
      expect(dashboard.created_at).toBeTypeOf("string");
      expect(typeof dashboard.pinned).toBe("boolean");
    });
  });

  describe("listEventDefinitions", () => {
    it("returns event definitions with names", async () => {
      const res = await client.listEventDefinitions({ limit: "10" });
      expect(res.results.length).toBeGreaterThan(0);
      const eventDef = res.results[0];
      expect(eventDef.id).toBeTypeOf("string");
      expect(eventDef.name).toBeTypeOf("string");
      expect(eventDef.name.length).toBeGreaterThan(0);
    });

    it("includes known events like $pageview", async () => {
      const res = await client.listEventDefinitions({ limit: "50" });
      const names = res.results.map((e) => e.name);
      expect(names).toContain("$pageview");
    });
  });

  describe("listPropertyDefinitions", () => {
    it("returns property definitions", async () => {
      const res = await client.listPropertyDefinitions({ limit: "10" });
      expect(res.results.length).toBeGreaterThan(0);
      const prop = res.results[0];
      expect(prop.id).toBeTypeOf("string");
      expect(prop.name).toBeTypeOf("string");
      expect(prop.name.length).toBeGreaterThan(0);
      expect(typeof prop.is_numerical).toBe("boolean");
    });
  });

  describe("error handling", () => {
    it("throws on invalid API key", async () => {
      const badClient = new PostHogClient({
        apiKey: "phx_invalid",
        host: HOST,
        projectId: PROJECT_ID,
      });
      await expect(badClient.getProject()).rejects.toThrow("PostHog API error");
    });
  });
});
