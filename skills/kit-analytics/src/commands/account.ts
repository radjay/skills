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
      const { name, plan_name, primary_email_address, state, created_at } = res.user;
      output({ name, plan: plan_name, email: primary_email_address, state, created_at }, format);
    });
}
