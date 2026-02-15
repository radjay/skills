import { describe, it, expect } from "vitest";
import { formatTable } from "../../skills/kit-analytics/src/formatter.js";

describe("formatTable", () => {
  it("returns '(no data)' for empty array", () => {
    expect(formatTable([])).toBe("(no data)");
  });

  it("formats a single row", () => {
    const result = formatTable([{ name: "Alice", age: 30 }]);
    const lines = result.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("name");
    expect(lines[0]).toContain("age");
    expect(lines[2]).toContain("Alice");
    expect(lines[2]).toContain("30");
  });

  it("formats multiple rows with aligned columns", () => {
    const result = formatTable([
      { id: 1, name: "Short" },
      { id: 2, name: "A longer name" },
    ]);
    const lines = result.split("\n");
    expect(lines).toHaveLength(4); // header + separator + 2 rows
    // All lines should have consistent structure
    expect(lines[1]).toMatch(/^-+\s+-+$/);
  });

  it("handles null/undefined values", () => {
    const result = formatTable([{ a: null, b: undefined, c: "ok" }]);
    expect(result).toContain("ok");
  });
});
