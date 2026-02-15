export function formatTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "(no data)";

  const keys = Object.keys(rows[0]);
  const widths = keys.map((k) =>
    Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length))
  );

  const header = keys.map((k, i) => k.padEnd(widths[i])).join("  ");
  const separator = widths.map((w) => "-".repeat(w)).join("  ");
  const body = rows
    .map((r) => keys.map((k, i) => String(r[k] ?? "").padEnd(widths[i])).join("  "))
    .join("\n");

  return `${header}\n${separator}\n${body}`;
}

export function output(data: unknown, format: string): void {
  if (format === "json") {
    console.log(JSON.stringify(data, null, 2));
  } else {
    if (Array.isArray(data)) {
      console.log(formatTable(data as Record<string, unknown>[]));
    } else {
      console.log(formatTable([data as Record<string, unknown>]));
    }
  }
}
