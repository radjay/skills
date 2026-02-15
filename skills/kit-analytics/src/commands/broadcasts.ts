import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function broadcastsCommand(): Command {
  return new Command("broadcasts")
    .description("List broadcasts with stats (defaults to completed only)")
    .option("--status <status>", "Filter by stats status (completed, scheduled, all)", "completed")
    .option("--limit <n>", "Max results per page")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();
      const res = await client.listBroadcasts({ limit: opts.limit });

      const rows: Record<string, unknown>[] = [];
      for (const b of res.broadcasts) {
        const statsRes = await client.getBroadcastStats(b.id);
        const s = statsRes.broadcast.stats;

        if (opts.status !== "all" && s.status !== opts.status) continue;

        rows.push({
          id: b.id,
          subject: b.subject ?? "",
          sent_at: b.published_at ?? b.send_at ?? b.created_at,
          recipients: s.recipients,
          open_rate: `${s.open_rate.toFixed(1)}%`,
          click_rate: `${s.click_rate.toFixed(1)}%`,
          unsubscribes: s.unsubscribes,
          status: s.status,
        });
      }

      output(rows, format);
    });
}
