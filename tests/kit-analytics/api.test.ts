import { describe, it, expect } from "vitest";
import { KitClient } from "../../skills/kit-analytics/src/api.js";

const API_KEY = process.env["KIT_API_KEY"] ?? "";
const client = new KitClient({ apiKey: API_KEY });

describe("KitClient", () => {
  describe("getAccount", () => {
    it("returns account with non-empty values", async () => {
      const res = await client.getAccount();
      expect(res.user.id).toBeTypeOf("number");
      expect(res.account.name).toBeTypeOf("string");
      expect(res.account.name.length).toBeGreaterThan(0);
      expect(res.account.plan_type).toBeTypeOf("string");
      expect(res.account.primary_email_address).toContain("@");
      expect(res.account.created_at).toBeTypeOf("string");
    });
  });

  describe("listSubscribers", () => {
    it("returns subscribers with pagination", async () => {
      const res = await client.listSubscribers();
      expect(Array.isArray(res.subscribers)).toBe(true);
      expect(res.subscribers.length).toBeGreaterThan(0);
      expect(res.pagination.per_page).toBeTypeOf("number");
      expect(res.pagination).toHaveProperty("has_next_page");
    });

    it("respects the limit option", async () => {
      const res = await client.listSubscribers({ limit: "2" });
      expect(res.subscribers.length).toBeLessThanOrEqual(2);
    });

    it("each subscriber has populated fields", async () => {
      const res = await client.listSubscribers({ limit: "1" });
      const sub = res.subscribers[0];
      expect(sub.id).toBeTypeOf("number");
      expect(sub.email_address).toContain("@");
      expect(sub.state).toBeTypeOf("string");
      expect(sub.state.length).toBeGreaterThan(0);
      expect(sub.created_at).toBeTypeOf("string");
    });
  });

  describe("listBroadcasts", () => {
    it("returns broadcasts with pagination", async () => {
      const res = await client.listBroadcasts();
      expect(Array.isArray(res.broadcasts)).toBe(true);
      expect(res.broadcasts.length).toBeGreaterThan(0);
      expect(res.pagination).toHaveProperty("has_next_page");
    });

    it("each broadcast has populated fields", async () => {
      const res = await client.listBroadcasts({ limit: "1" });
      const b = res.broadcasts[0];
      expect(b.id).toBeTypeOf("number");
      expect(b.subject).toBeTypeOf("string");
      expect(b.created_at).toBeTypeOf("string");
    });
  });

  describe("getBroadcastStats", () => {
    it("returns stats with numeric open_rate, click_rate, recipients", async () => {
      const list = await client.listBroadcasts({ limit: "10" });
      // Find a completed broadcast to get meaningful stats
      let broadcastId: number | null = null;
      for (const b of list.broadcasts) {
        const statsRes = await client.getBroadcastStats(b.id);
        if (statsRes.broadcast.stats.status === "completed") {
          broadcastId = b.id;
          break;
        }
      }
      expect(broadcastId).not.toBeNull();

      const res = await client.getBroadcastStats(broadcastId!);
      const stats = res.broadcast.stats;
      expect(stats.recipients).toBeTypeOf("number");
      expect(stats.recipients).toBeGreaterThan(0);
      expect(stats.open_rate).toBeTypeOf("number");
      expect(stats.click_rate).toBeTypeOf("number");
      expect(stats.unsubscribes).toBeTypeOf("number");
      expect(stats.total_clicks).toBeTypeOf("number");
      expect(stats.status).toBe("completed");
    });
  });

  describe("listTags", () => {
    it("returns tags with pagination", async () => {
      const res = await client.listTags();
      expect(Array.isArray(res.tags)).toBe(true);
      expect(res.tags.length).toBeGreaterThan(0);
      expect(res.pagination).toHaveProperty("has_next_page");
    });

    it("each tag has populated fields", async () => {
      const res = await client.listTags();
      const tag = res.tags[0];
      expect(tag.id).toBeTypeOf("number");
      expect(tag.name).toBeTypeOf("string");
      expect(tag.name.length).toBeGreaterThan(0);
      expect(tag.created_at).toBeTypeOf("string");
    });
  });

  describe("listForms", () => {
    it("returns forms with pagination", async () => {
      const res = await client.listForms();
      expect(Array.isArray(res.forms)).toBe(true);
      expect(res.forms.length).toBeGreaterThan(0);
      expect(res.pagination).toHaveProperty("has_next_page");
    });

    it("each form has populated fields", async () => {
      const res = await client.listForms();
      const form = res.forms[0];
      expect(form.id).toBeTypeOf("number");
      expect(form.name).toBeTypeOf("string");
      expect(form.name.length).toBeGreaterThan(0);
      expect(form.type).toBeTypeOf("string");
      expect(form.created_at).toBeTypeOf("string");
    });
  });

  describe("listSequences", () => {
    it("returns sequences with pagination", async () => {
      const res = await client.listSequences();
      expect(Array.isArray(res.sequences)).toBe(true);
      expect(res.sequences.length).toBeGreaterThan(0);
      expect(res.pagination).toHaveProperty("has_next_page");
    });

    it("each sequence has populated fields", async () => {
      const res = await client.listSequences();
      const seq = res.sequences[0];
      expect(seq.id).toBeTypeOf("number");
      expect(seq.name).toBeTypeOf("string");
      expect(seq.name.length).toBeGreaterThan(0);
      expect(seq.created_at).toBeTypeOf("string");
    });
  });

  describe("error handling", () => {
    it("throws on invalid API key", async () => {
      const badClient = new KitClient({ apiKey: "invalid_key" });
      await expect(badClient.getAccount()).rejects.toThrow("Kit API error");
    });
  });
});
