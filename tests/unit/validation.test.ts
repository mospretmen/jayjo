import { describe, it, expect } from "vitest";
import {
  sanitizeText,
  sanitizeEmail,
  validateContact,
  validateNewsletter,
  EMAIL_RE,
} from "@/lib/validation";

describe("sanitizeText", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeText("  hello   world  ")).toBe("hello world");
  });

  it("clamps to maxLen", () => {
    expect(sanitizeText("a".repeat(20), 5)).toBe("aaaaa");
  });

  it("strips C0 control chars while preserving newlines, tabs, and carriage returns", () => {
    const bell = String.fromCharCode(7);
    const del = String.fromCharCode(0x7f);
    const input = `clean${bell}up${del}text\nwith\ttabs`;
    const out = sanitizeText(input);
    expect(out).toBe("cleanuptext with tabs");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(sanitizeText("   \t  ")).toBe("");
  });
});

describe("sanitizeEmail", () => {
  it("lowercases and trims", () => {
    expect(sanitizeEmail("  USER@Example.COM  ")).toBe("user@example.com");
  });

  it("clamps oversized addresses", () => {
    const local = "a".repeat(300);
    expect(sanitizeEmail(`${local}@x.io`).length).toBeLessThanOrEqual(254);
  });
});

describe("EMAIL_RE", () => {
  it.each([
    ["a@b.co", true],
    ["user.name+tag@studio.example", true],
    ["user@x.io", true],
    ["not-an-email", false],
    ["a@b", false],
    ["@x.io", false],
    ["a@.io", false],
    ["", false],
  ])("matches %s correctly", (input, expected) => {
    expect(EMAIL_RE.test(input)).toBe(expected);
  });
});

describe("validateContact", () => {
  const valid = {
    name: "Jay",
    email: "jay@studio.example",
    projectType: "designer",
    message: "Looking to commission a piece for the foyer.",
  };

  it("returns no errors for a valid form", () => {
    expect(validateContact(valid)).toEqual({});
  });

  it("flags short name", () => {
    expect(validateContact({ ...valid, name: "" }).name).toBeDefined();
    expect(validateContact({ ...valid, name: "J" }).name).toBeDefined();
  });

  it("flags invalid email", () => {
    expect(validateContact({ ...valid, email: "no" }).email).toBeDefined();
  });

  it("flags missing project type", () => {
    expect(validateContact({ ...valid, projectType: "" }).projectType).toBeDefined();
  });

  it("flags short message", () => {
    expect(validateContact({ ...valid, message: "short" }).message).toBeDefined();
  });
});

describe("validateNewsletter", () => {
  it("accepts a valid email", () => {
    expect(validateNewsletter("a@b.co")).toBeUndefined();
  });
  it("rejects empty", () => {
    expect(validateNewsletter("")).toBeDefined();
  });
  it("rejects malformed", () => {
    expect(validateNewsletter("not-an-email")).toBeDefined();
  });
});
