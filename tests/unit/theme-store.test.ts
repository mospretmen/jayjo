import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "@/store/theme";

describe("theme store", () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ theme: "light", hasUserChoice: false });
  });

  it("defaults to light", () => {
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("toggles to dark and records user choice", () => {
    useThemeStore.getState().setTheme("dark");
    expect(useThemeStore.getState().theme).toBe("dark");
    expect(useThemeStore.getState().hasUserChoice).toBe(true);
  });
});
