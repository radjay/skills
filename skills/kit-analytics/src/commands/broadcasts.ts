import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function broadcastsCommand(): Command {
  return new Command("broadcasts")
    .description("List broadcasts with stats")
    .option("--status <status>", "Filter by status (draft, published, sent)")
    .option("--limit <n>", "Max results per page")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();
      const res = await client.listBroadcasts({
        status: opts.status,
        limit: opts.limit,
      });
      const rows = res.broadcasts.map((b) => ({
        id: b.id,
        subject: b.subject ?? "",
        created_at: b.created_at,
        recipients: b.stats?.recipients ?? "",
        open_rate: b.stats?.open_rate != null ? `${(b.stats.open_rate * 100).toFixed(1)}%` : "",
        click_rate: b.stats?.click_rate != null ? `${(b.stats.click_rate * 100).toFixed(1)}%` : "",
        unsubscribes: b.stats?.unsubscribes ?? "",
      }));
      output(rows, format);
    });
}
