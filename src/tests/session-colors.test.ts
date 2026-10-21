import { describe, it, expect } from "vitest";
import { SESSION_COLORS, getSessionColor, hexToRgba } from "@/lib/session-colors";

describe("getSessionColor", () => {
  it("returns the mapped color for a known session type", () => {
    expect(getSessionColor("group")).toBe(SESSION_COLORS.group);
    expect(getSessionColor("test")).toBe(SESSION_COLORS.test);
  });

  it("is case-insensitive", () => {
    expect(getSessionColor("GROUP")).toBe(SESSION_COLORS.group);
    expect(getSessionColor("Individual")).toBe(SESSION_COLORS.individual);
  });

  it("falls back to the individual color for unknown types", () => {
    expect(getSessionColor("unknown")).toBe(SESSION_COLORS.individual);
  });

  it("falls back to the individual color for empty or nullish input", () => {
    expect(getSessionColor("")).toBe(SESSION_COLORS.individual);
    // @ts-expect-error - exercising the nullish guard at runtime
    expect(getSessionColor(undefined)).toBe(SESSION_COLORS.individual);
  });
});

describe("hexToRgba", () => {
  it("converts a hex color to an rgba string", () => {
    expect(hexToRgba("#3b82f6", 0.5)).toBe("rgba(59, 130, 246, 0.5)");
  });

  it("handles full opacity", () => {
    expect(hexToRgba("#000000", 1)).toBe("rgba(0, 0, 0, 1)");
  });

  it("handles white", () => {
    expect(hexToRgba("#ffffff", 0.25)).toBe("rgba(255, 255, 255, 0.25)");
  });
});
