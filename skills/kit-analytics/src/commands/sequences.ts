import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function sequencesCommand(): Command {
  return new Command("sequences")
    .description("List all sequences")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const res = await client.listSequences();
      const rows = res.sequences.map((s) => ({
        id: s.id,
        name: s.name,
        created_at: s.created_at,
      }));
      output(rows, format);
    });
}
