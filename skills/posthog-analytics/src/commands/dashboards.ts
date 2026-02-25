import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function dashboardsCommand(): Command {
  return new Command("dashboards")
    .description("List dashboards")
    .option("--limit <n>", "Max results", "100")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listDashboards({ limit: opts.limit });

      const rows = res.results.map((d) => ({
        id: d.id,
        name: d.name,
        pinned: d.pinned,
        created_at: d.created_at,
      }));
      output(rows, format);
    });
}
