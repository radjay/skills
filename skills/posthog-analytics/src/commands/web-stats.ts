import { Command } from "commander";
import type { PostHogClient, WebStatsBreakdown } from "../api.js";
import { output } from "../formatter.js";

const VALID_BREAKDOWNS: WebStatsBreakdown[] = [
  "Page",
  "InitialPage",
  "ExitPage",
  "InitialChannelType",
  "InitialReferringDomain",
  "InitialUTMSource",
  "InitialUTMCampaign",
  "InitialUTMMedium",
  "InitialUTMTerm",
  "InitialUTMContent",
  "InitialUTMSourceMediumCampaign",
  "Browser",
  "OS",
  "DeviceType",
  "Viewport",
  "Country",
  "Region",
  "City",
  "Timezone",
  "Language",
];

function overviewCommand(): Command {
  return new Command("overview")
    .description("Web analytics overview: visitors, views, sessions, bounce rate, duration")
    .option("--date-from <date>", "Start date (e.g. -7d, -30d)", "-7d")
    .option("--date-to <date>", "End date")
    .option("--no-compare", "Disable comparison with previous period")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.webOverviewQuery({
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        compare: opts.compare,
      });

      if (format === "json") {
        output(res.results, format);
      } else {
        const rows = res.results.map((item) => {
          const row: Record<string, unknown> = {
            metric: item.key,
            value: formatValue(item.value, item.kind),
          };
          if (item.previous != null) {
            row.previous = formatValue(item.previous, item.kind);
          }
          if (item.changeFromPreviousPct != null) {
            row.change = `${item.changeFromPreviousPct > 0 ? "+" : ""}${item.changeFromPreviousPct.toFixed(1)}%`;
          }
          return row;
        });
        output(rows, format);
      }
    });
}

function formatValue(value: number | null, kind: string): string {
  if (value == null) return "-";
  switch (kind) {
    case "duration_s":
      return `${value.toFixed(1)}s`;
    case "percentage":
      return `${(value * 100).toFixed(1)}%`;
    default:
      return String(Math.round(value));
  }
}

function breakdownCommand(): Command {
  return new Command("breakdown")
    .description("Web stats broken down by a dimension (Page, Browser, Country, etc.)")
    .requiredOption(
      "--by <dimension>",
      `Breakdown dimension: ${VALID_BREAKDOWNS.join(", ")}`,
    )
    .option("--date-from <date>", "Start date (e.g. -7d, -30d)", "-7d")
    .option("--date-to <date>", "End date")
    .option("--include-bounce-rate", "Include bounce rate column")
    .option("--limit <n>", "Max rows", "10")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      if (!VALID_BREAKDOWNS.includes(opts.by)) {
        console.error(`Error: Invalid breakdown "${opts.by}".\nValid values: ${VALID_BREAKDOWNS.join(", ")}`);
        process.exit(1);
      }

      const res = await client.webStatsTableQuery({
        breakdownBy: opts.by as WebStatsBreakdown,
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        includeBounceRate: opts.includeBounceRate ?? false,
        limit: parseInt(opts.limit, 10),
      });

      if (format === "json") {
        output({ columns: res.columns, results: res.results }, format);
      } else {
        const rows = res.results.map((row) => {
          const obj: Record<string, unknown> = {};
          (row as unknown[]).forEach((val, i) => {
            obj[res.columns[i]] = val;
          });
          return obj;
        });
        output(rows, format);
      }
    });
}

function goalsCommand(): Command {
  return new Command("goals")
    .description("Web analytics conversion goals")
    .option("--date-from <date>", "Start date (e.g. -7d, -30d)", "-7d")
    .option("--date-to <date>", "End date")
    .option("--limit <n>", "Max rows", "10")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.webGoalsQuery({
        dateFrom: opts.dateFrom,
        dateTo: opts.dateTo,
        limit: parseInt(opts.limit, 10),
      });

      if (format === "json") {
        output({ columns: res.columns, results: res.results }, format);
      } else {
        const rows = res.results.map((row) => {
          const obj: Record<string, unknown> = {};
          (row as unknown[]).forEach((val, i) => {
            obj[res.columns[i]] = val;
          });
          return obj;
        });
        output(rows, format);
      }
    });
}

export function webStatsCommand(): Command {
  const cmd = new Command("web-stats")
    .description("Web analytics: overview, breakdowns, and goals");

  cmd.addCommand(overviewCommand());
  cmd.addCommand(breakdownCommand());
  cmd.addCommand(goalsCommand());

  return cmd;
}
