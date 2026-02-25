import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

function eventsSchemaCommand(): Command {
  return new Command("events")
    .description("List event definitions (event names seen by the project)")
    .option("--limit <n>", "Max results", "100")
    .option("--search <term>", "Filter by event name")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listEventDefinitions({
        limit: opts.limit,
        search: opts.search,
      });

      const rows = res.results.map((e) => ({
        name: e.name,
        volume_30_day: e.volume_30_day ?? "",
        query_usage_30_day: e.query_usage_30_day ?? "",
      }));
      output(rows, format);
    });
}

function propertiesSchemaCommand(): Command {
  return new Command("properties")
    .description("List property definitions")
    .option("--limit <n>", "Max results", "100")
    .option("--search <term>", "Filter by property name")
    .option("--type <type>", "Filter by type: event, person, session")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();

      const res = await client.listPropertyDefinitions({
        limit: opts.limit,
        search: opts.search,
        type: opts.type,
      });

      const rows = res.results.map((p) => ({
        name: p.name,
        property_type: p.property_type ?? "",
        is_numerical: p.is_numerical,
      }));
      output(rows, format);
    });
}

export function schemaCommand(): Command {
  const cmd = new Command("schema")
    .description("Discover event and property schema for the project");

  cmd.addCommand(eventsSchemaCommand());
  cmd.addCommand(propertiesSchemaCommand());

  return cmd;
}
