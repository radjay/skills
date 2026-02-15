import { describe, it, expect } from "vitest";
import { KitClient } from "../../skills/kit-analytics/src/api.js";

const API_KEY = process.env["KIT_API_KEY"] ?? "";
const client = new KitClient({ apiKey: API_KEY });

describe("KitClient", () => {
  describe("getAccount", () => {
    it("returns account and user info", async () => {
      const res = await client.getAccount();
      expect(res).toHaveProperty("user");
      expect(res).toHaveProperty("account");
      expect(res.account).toHaveProperty("name");
      expect(res.account).toHaveProperty("plan_type");
      expect(res.account).toHaveProperty("primary_email_address");
      expect(res.account).toHaveProperty("created_at");
      expect(res.user).toHaveProperty("id");
    });
  });

  describe("listSubscribers", () => {
    it("returns subscribers with pagination", async () => {
      const res = await client.listSubscribers();
      expect(res).toHaveProperty("subscribers");
      expect(res).toHaveProperty("pagination");
      expect(Array.isArray(res.subscribers)).toBe(true);
      expect(res.pagination).toHaveProperty("has_next_page");
      expect(res.pagination).toHaveProperty("per_page");
    });

    it("respects the limit option", async () => {
      const res = await client.listSubscribers({ limit: "2" });
      expect(res.subscribers.length).toBeLessThanOrEqual(2);
    });

    it("each subscriber has expected fields", async () => {
      const res = await client.listSubscribers({ limit: "1" });
      if (res.subscribers.length > 0) {
        const sub = res.subscribers[0];
        expect(sub).toHaveProperty("id");
        expect(sub).toHaveProperty("email_address");
        expect(sub).toHaveProperty("state");
        expect(sub).toHaveProperty("created_at");
      }
    });
  });

  describe("listBroadcasts", () => {
    it("returns broadcasts with pagination", async () => {
      const res = await client.listBroadcasts();
      expect(res).toHaveProperty("broadcasts");
      expect(res).toHaveProperty("pagination");
      expect(Array.isArray(res.broadcasts)).toBe(true);
    });

    it("each broadcast has expected fields", async () => {
      const res = await client.listBroadcasts({ limit: "1" });
      if (res.broadcasts.length > 0) {
        const b = res.broadcasts[0];
        expect(b).toHaveProperty("id");
        expect(b).toHaveProperty("created_at");
      }
    });
  });

  describe("listTags", () => {
    it("returns tags with pagination", async () => {
      const res = await client.listTags();
      expect(res).toHaveProperty("tags");
      expect(res).toHaveProperty("pagination");
      expect(Array.isArray(res.tags)).toBe(true);
    });

    it("each tag has expected fields", async () => {
      const res = await client.listTags();
      if (res.tags.length > 0) {
        const tag = res.tags[0];
        expect(tag).toHaveProperty("id");
        expect(tag).toHaveProperty("name");
        expect(tag).toHaveProperty("created_at");
      }
    });
  });

  describe("listForms", () => {
    it("returns forms with pagination", async () => {
      const res = await client.listForms();
      expect(res).toHaveProperty("forms");
      expect(res).toHaveProperty("pagination");
      expect(Array.isArray(res.forms)).toBe(true);
    });

    it("each form has expected fields", async () => {
      const res = await client.listForms();
      if (res.forms.length > 0) {
        const form = res.forms[0];
        expect(form).toHaveProperty("id");
        expect(form).toHaveProperty("name");
        expect(form).toHaveProperty("type");
        expect(form).toHaveProperty("created_at");
      }
    });
  });

  describe("listSequences", () => {
    it("returns sequences with pagination", async () => {
      const res = await client.listSequences();
      expect(res).toHaveProperty("sequences");
      expect(res).toHaveProperty("pagination");
      expect(Array.isArray(res.sequences)).toBe(true);
    });

    it("each sequence has expected fields", async () => {
      const res = await client.listSequences();
      if (res.sequences.length > 0) {
        const seq = res.sequences[0];
        expect(seq).toHaveProperty("id");
        expect(seq).toHaveProperty("name");
        expect(seq).toHaveProperty("created_at");
      }
    });
  });

  describe("error handling", () => {
    it("throws on invalid API key", async () => {
      const badClient = new KitClient({ apiKey: "invalid_key" });
      await expect(badClient.getAccount()).rejects.toThrow("Kit API error");
    });
  });
});
