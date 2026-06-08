import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore, THEME_STORAGE_KEY } from "@/store/theme";

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

  it("persists to localStorage", () => {
    useThemeStore.getState().setTheme("dark");
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(raw).toContain('"theme":"dark"');
  });

  it("toggle() round-trips light→dark→light", () => {
    const { toggle } = useThemeStore.getState();
    toggle();
    expect(useThemeStore.getState().theme).toBe("dark");
    toggle();
    expect(useThemeStore.getState().theme).toBe("light");
    expect(useThemeStore.getState().hasUserChoice).toBe(true);
  });
});
