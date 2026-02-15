import { Command } from "commander";
import type { KitClient } from "../api.js";
import { output } from "../formatter.js";

export function accountCommand(): Command {
  return new Command("account")
    .description("Display account info")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as KitClient;
      const format = this.opts()["__format"] as string;
      const res = await client.getAccount();
      output(
        {
          name: res.account.name,
          plan: res.account.plan_type,
          email: res.account.primary_email_address,
          created_at: res.account.created_at,
        },
        format,
      );
    });
}
