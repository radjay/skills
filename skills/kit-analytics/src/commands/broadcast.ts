import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function broadcastCommand(): Command {
  return new Command("broadcast")
    .description("Get a single broadcast by ID (includes HTML content)")
    .argument("<id>", "Broadcast ID")
    .option("--content-only", "Output only the HTML content")
    .action(async function (this: Command, id: string) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const opts = this.opts();
      const res = await client.getBroadcast(Number(id));
      const b = res.broadcast;

      if (opts.contentOnly) {
        console.log(b.content ?? "");
        return;
      }

      if (format === "json") {
        console.log(JSON.stringify(b, null, 2));
        return;
      }

      output(
        {
          id: b.id,
          subject: b.subject,
          preview_text: b.preview_text ?? "",
          email_address: b.email_address ?? "",
          email_template: b.email_template?.name ?? "",
          public: b.public,
          public_url: b.public_url ?? "",
          published_at: b.published_at ?? "",
          send_at: b.send_at ?? "",
          created_at: b.created_at,
        },
        format,
      );

      if (b.content) {
        console.log("\n--- Content ---\n");
        console.log(b.content);
      }
    });
}
