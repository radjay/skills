import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function subscribersCommand(): Command {
  return new Command("subscribers")
    .description("List subscribers")
    .option("--status <status>", "Filter by status (active, cancelled, bounced, complained)")
    .option("--tag <tag_id>", "Filter by tag ID")
    .option("--since <date>", "Created after date (ISO 8601)")
    .option("--until <date>", "Created before date (ISO 8601)")
    .option("--limit <n>", "Max results per page")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();
      const res = await client.listSubscribers({
        status: opts.status,
        tagId: opts.tag,
        since: opts.since,
        until: opts.until,
        limit: opts.limit,
      });
      const rows = res.subscribers.map((s) => ({
        id: s.id,
        email: s.email_address,
        first_name: s.first_name ?? "",
        state: s.state,
        created_at: s.created_at,
      }));
      output(rows, format);
    });
}
