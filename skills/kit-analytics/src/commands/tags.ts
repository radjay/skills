import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function tagsCommand(): Command {
  return new Command("tags")
    .description("List all tags")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const res = await client.listTags();
      const rows = res.data.map((t) => ({
        id: t.id,
        name: t.name,
        created_at: t.created_at,
      }));
      output(rows, format);
    });
}
