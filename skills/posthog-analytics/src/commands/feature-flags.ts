import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function featureFlagsCommand(): Command {
  return new Command("feature-flags")
    .description("List feature flags")
    .option("--limit <n>", "Max results", "100")
    .option("--search <term>", "Search by flag key or name")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listFeatureFlags({
        limit: opts.limit,
        search: opts.search,
      });

      const rows = res.results.map((f) => ({
        id: f.id,
        key: f.key,
        name: f.name || "",
        active: f.active,
        rollout_percentage: f.rollout_percentage ?? "",
        created_at: f.created_at,
      }));
      output(rows, format);
    });
}
