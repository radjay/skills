import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function trendsCommand(): Command {
  return new Command("trends")
    .description("Run a trends query for an event")
    .requiredOption("--event <name>", "Event to trend (e.g. $pageview)")
    .option("--date-from <date>", "Start date (e.g. -7d, -30d, 2025-01-01)", "-7d")
    .option("--date-to <date>", "End date")
    .option("--interval <interval>", "Breakdown interval: hour, day, week, month", "day")
    .option("--breakdown <property>", "Break down by property")
    .option("--breakdown-type <type>", "Breakdown type: event, person, session", "event")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.trendsQuery({
        event: opts.event,
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        interval: opts.interval,
        breakdown: opts.breakdown,
        breakdownType: opts.breakdownType,
      });

      if (format === "json") {
        output(res.results, format);
      } else {
        const rows: Record<string, unknown>[] = [];
        for (const series of res.results) {
          for (let i = 0; i < series.days.length; i++) {
            rows.push({
              label: series.label,
              date: series.days[i],
              count: series.data[i],
            });
          }
        }
        output(rows, format);
      }
    });
}
