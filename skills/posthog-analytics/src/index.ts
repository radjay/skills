#!/usr/bin/env node

import { Command } from "commander";
import { resolveKey } from "@radjay/resolve-key";
import { PostHogClient } from "./api.js";
import { projectCommand } from "./commands/project.js";
import { queryCommand } from "./commands/query.js";
import { eventsCommand } from "./commands/events.js";
import { personsCommand } from "./commands/persons.js";
import { trendsCommand } from "./commands/trends.js";
import { webStatsCommand } from "./commands/web-stats.js";
import { insightsCommand } from "./commands/insights.js";
import { dashboardsCommand } from "./commands/dashboards.js";
import { featureFlagsCommand } from "./commands/feature-flags.js";
import { schemaCommand } from "./commands/schema.js";

const APP_NAME = "posthog-analytics";
const DEFAULT_HOST = "https://us.posthog.com";

const program = new Command();

program
  .name(APP_NAME)
  .description("Pull PostHog product and web analytics data")
  .version("0.0.1")
  .option("--api-key <key>", "PostHog personal API key")
  .option("--api-key-cmd <cmd>", "Shell command that outputs the API key")
  .option("--project-id <id>", "PostHog project ID")
  .option("--project-id-cmd <cmd>", "Shell command that outputs the project ID")
  .option("--host <url>", "PostHog instance URL")
  .option("--host-cmd <cmd>", "Shell command that outputs the host URL")
  .option("--format <format>", "Output format: json or table", "table");

program.hook("preAction", () => {
  const opts = program.opts();

  const apiKey = resolveKey({
    flag: opts.apiKey,
    keyCmd: opts.apiKeyCmd,
    envVar: "POSTHOG_API_KEY",
    appName: APP_NAME,
    configKey: "api_key",
  });

  if (!apiKey) {
    console.error(
      "Error: PostHog API key is required.\n" +
        "  Set POSTHOG_API_KEY env var, pass --api-key, use --api-key-cmd,\n" +
        "  add it to a .env file, or save it in ~/.config/posthog-analytics/config.json.",
    );
    process.exit(1);
  }

  const projectId = resolveKey({
    flag: opts.projectId,
    keyCmd: opts.projectIdCmd,
    envVar: "POSTHOG_PROJECT_ID",
    appName: APP_NAME,
    configKey: "project_id",
  });

  if (!projectId) {
    console.error(
      "Error: PostHog project ID is required.\n" +
        "  Set POSTHOG_PROJECT_ID env var, pass --project-id, use --project-id-cmd,\n" +
        "  add it to a .env file, or save it in ~/.config/posthog-analytics/config.json.",
    );
    process.exit(1);
  }

  const host = resolveKey({
    flag: opts.host,
    keyCmd: opts.hostCmd,
    envVar: "POSTHOG_HOST",
    appName: APP_NAME,
    configKey: "host",
  }) ?? DEFAULT_HOST;

  const client = new PostHogClient({ apiKey, host, projectId });
  const format: string = opts.format;

  function propagate(cmd: Command) {
    cmd.setOptionValue("__client", client);
    cmd.setOptionValue("__format", format);
    for (const sub of cmd.commands) {
      propagate(sub);
    }
  }
  for (const cmd of program.commands) {
    propagate(cmd);
  }
});

program.addCommand(projectCommand());
program.addCommand(queryCommand());
program.addCommand(eventsCommand());
program.addCommand(personsCommand());
program.addCommand(trendsCommand());
program.addCommand(webStatsCommand());
program.addCommand(insightsCommand());
program.addCommand(dashboardsCommand());
program.addCommand(featureFlagsCommand());
program.addCommand(schemaCommand());

program.parseAsync(process.argv).catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
