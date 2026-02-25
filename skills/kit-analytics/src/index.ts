#!/usr/bin/env node

import { Command } from "commander";
import { resolveKey } from "@radjay/resolve-key";
import { KitClient } from "./api.js";
import { accountCommand } from "./commands/account.js";
import { subscribersCommand } from "./commands/subscribers.js";
import { broadcastsCommand } from "./commands/broadcasts.js";
import { tagsCommand } from "./commands/tags.js";
import { formsCommand } from "./commands/forms.js";
import { sequencesCommand } from "./commands/sequences.js";

const program = new Command();

program
  .name("kit-analytics")
  .description("Pull Kit.com newsletter analytics via Kit API v4")
  .version("0.0.2")
  .option("--api-key <key>", "Kit API key (overrides KIT_API_KEY env var)")
  .option("--api-key-cmd <cmd>", "Shell command that outputs the API key")
  .option("--format <format>", "Output format: json or table", "table");

program.hook("preAction", () => {
  const opts = program.opts();

  const apiKey = resolveKey({
    flag: opts.apiKey,
    keyCmd: opts.apiKeyCmd,
    envVar: "KIT_API_KEY",
    appName: "kit-analytics",
  });

  if (!apiKey) {
    console.error(
      "Error: Kit API key is required.\n" +
        "  Set KIT_API_KEY env var, pass --api-key, use --api-key-cmd,\n" +
        "  add it to a .env file, or save it in ~/.config/kit-analytics/config.json.",
    );
    process.exit(1);
  }

  const client = new KitClient({ apiKey });
  const format: string = opts.format;

  // Bind the client to all subcommands via metadata
  for (const cmd of program.commands) {
    cmd.setOptionValue("__client", client);
    cmd.setOptionValue("__format", format);
  }
});

// Register commands — each command pulls client/format from its own opts
program.addCommand(accountCommand());
program.addCommand(subscribersCommand());
program.addCommand(broadcastsCommand());
program.addCommand(tagsCommand());
program.addCommand(formsCommand());
program.addCommand(sequencesCommand());

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
