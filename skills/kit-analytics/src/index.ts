#!/usr/bin/env node

import { Command } from "commander";
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
  .version("0.0.1")
  .option("--api-key <key>", "Kit API key (overrides KIT_API_KEY env var)")
  .option("--format <format>", "Output format: json or table", "table");

program.hook("preAction", () => {
  const opts = program.opts();
  const apiKey = opts.apiKey || process.env["KIT_API_KEY"];

  if (!apiKey) {
    console.error("Error: Kit API key is required. Set KIT_API_KEY env var or pass --api-key.");
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
