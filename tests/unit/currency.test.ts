import { describe, it, expect } from "vitest";
import { formatPrice, formatPriceRange } from "@/lib/currency";

describe("currency", () => {
  it("formats USD cents to '$85.00'", () => {
    expect(formatPrice(8500, "USD", "en-US")).toBe("$85.00");
  });

  it("formats range as 'from $85.00' when min only", () => {
    expect(formatPriceRange([8500], "USD", "en-US")).toBe("$85.00");
  });

  it("formats range as 'from $85.00' when min < max", () => {
    expect(formatPriceRange([8500, 14500, 24500], "USD", "en-US")).toBe("from $85.00");
  });
});
