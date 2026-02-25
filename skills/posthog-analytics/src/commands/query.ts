import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function queryCommand(): Command {
  return new Command("query")
    .description("Run a HogQL query")
    .argument("<sql>", "HogQL SQL string")
    .action(async function (this: Command, sql: string) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
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
