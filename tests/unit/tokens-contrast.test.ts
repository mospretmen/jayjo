import { describe, it, expect } from "vitest";
import { hex } from "wcag-contrast";

// Mirror of tokens.css. If you change tokens.css, change here too.
const LIGHT = {
  bg: "#F2EBDC",
  bgElevated: "#E8E2D3",
  text: "#2E1F12",
  textMuted: "#756751",
  accent: "#A6541F",
};
const DARK = {
  bg: "#1A140E",
  bgElevated: "#241A12",
  text: "#F2EBDC",
  textMuted: "#C9BFA8",
  accent: "#C77A3E",
};

describe("token contrast (WCAG 2.2 AA)", () => {
  it.each([
    ["light text on bg", LIGHT.text, LIGHT.bg, 4.5],
    ["light text on elevated", LIGHT.text, LIGHT.bgElevated, 4.5],
    ["dark text on bg", DARK.text, DARK.bg, 4.5],
    ["dark text on elevated", DARK.text, DARK.bgElevated, 4.5],
    ["light muted on bg", LIGHT.textMuted, LIGHT.bg, 4.5],
    ["dark muted on bg", DARK.textMuted, DARK.bg, 4.5],
  ])("%s meets %s:1", (_, fg, bg, min) => {
    expect(hex(fg, bg)).toBeGreaterThanOrEqual(min as number);
  });
});
