import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function personsCommand(): Command {
  return new Command("persons")
    .description("List persons (users)")
    .option("--search <term>", "Search by email, name, or distinct ID")
    .option("--distinct-id <id>", "Filter by distinct ID")
    .option("--properties <json>", "Filter by person properties (JSON array)")
    .option("--limit <n>", "Max results", "100")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listPersons({
        search: opts.search,
        distinctId: opts.distinctId,
        properties: opts.properties,
        limit: opts.limit,
      });

      const rows = res.results.map((p) => ({
        id: p.id,
        name: p.name || "",
        distinct_id: p.distinct_ids[0] ?? "",
        email: (p.properties["email"] as string) ?? "",
        created_at: p.created_at,
      }));
      output(rows, format);
    });
}
