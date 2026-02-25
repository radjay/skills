import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function eventsCommand(): Command {
  return new Command("events")
    .description("List recent events")
    .option("--event <name>", "Filter by event name (e.g. $pageview)")
    .option("--limit <n>", "Max results", "100")
    .option("--days <n>", "Lookback period in days", "7")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const where = [`timestamp >= now() - INTERVAL ${opts.days} DAY`];
      if (opts.event) {
        where.push(`event = '${opts.event}'`);
      }

      const sql =
        `SELECT event, distinct_id, timestamp, properties.$current_url as url ` +
        `FROM events WHERE ${where.join(" AND ")} ` +
        `ORDER BY timestamp DESC LIMIT ${opts.limit}`;

      const res = await client.hogqlQuery(sql);

      if (format === "json") {
        output({ columns: res.columns, results: res.results }, format);
      } else {
        const rows = res.results.map((row) => {
          const obj: Record<string, unknown> = {};
          res.columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        });
        output(rows, format);
      }
    });
}
