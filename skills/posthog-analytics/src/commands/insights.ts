import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function insightsCommand(): Command {
  return new Command("insights")
    .description("List saved insights")
    .option("--limit <n>", "Max results", "100")
    .option("--search <term>", "Search by insight name")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listInsights({
        limit: opts.limit,
        search: opts.search,
      });

      const rows = res.results.map((i) => ({
        id: i.id,
        short_id: i.short_id,
        name: i.name || "(untitled)",
        last_modified_at: i.last_modified_at,
      }));
      output(rows, format);
    });
}
