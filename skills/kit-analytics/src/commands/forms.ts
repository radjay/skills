import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function formsCommand(): Command {
  return new Command("forms")
    .description("List all forms")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const res = await client.listForms();
      const rows = res.forms.map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        archived: f.archived,
        created_at: f.created_at,
      }));
      output(rows, format);
    });
}
