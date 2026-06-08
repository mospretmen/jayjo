import { describe, it, expect } from "vitest";

// Smoke check: the files adapter module loads without throwing,
// and once content files exist (Task 9), listArtworks returns a non-empty array.
describe("files catalog adapter", () => {
  it("module imports without throwing", async () => {
    const { filesAdapter } = await import("@/catalog/adapters/files");
    expect(filesAdapter).toBeDefined();
    expect(typeof filesAdapter.listArtworks).toBe("function");
  });
});
