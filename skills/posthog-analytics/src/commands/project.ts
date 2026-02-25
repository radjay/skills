import { Command } from "commander";
import type { PostHogClient } from "../api.js";
import { output } from "../formatter.js";

export function projectCommand(): Command {
  return new Command("project")
    .description("Display current project info")
    .action(async function (this: Command) {
      const client = this.opts()["__client"] as PostHogClient;
      const format = this.opts()["__format"] as string;
      const project = await client.getProject();
      output(
        {
          id: project.id,
          name: project.name,
          timezone: project.timezone,
          created_at: project.created_at,
        },
        format,
      );
    });
}
