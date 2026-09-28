import { describe, expect, it } from "vitest";
import { addMinor, formatMinor, fromMajor, multiplyMinor, percentOfMinor, subtractMinor } from "@/lib/money";

describe("money", () => {
  it("builds minor units from major units", () => {
    expect(fromMajor(25)).toBe(2500);
    expect(fromMajor(0)).toBe(0);
  });

  it("adds and subtracts without drift", () => {
    expect(addMinor(1999, 1)).toBe(2000);
    expect(addMinor(10, 20, 30)).toBe(60);
    expect(subtractMinor(2000, 1999)).toBe(1);
  });

  it("keeps a repeated addition exact where floats would drift", () => {
    let total = 0;
    for (let i = 0; i < 10; i += 1) {
      total = addMinor(total, 10);
    }

    expect(total).toBe(100);
  });

  it("multiplies by a quantity", () => {
    expect(multiplyMinor(6500, 3)).toBe(19500);
  });

  it("applies a percentage in basis points with half up rounding", () => {
    expect(percentOfMinor(10_000, 1500)).toBe(1500);
    expect(percentOfMinor(1999, 1500)).toBe(300);
  });

  it("honours the rounding mode the caller chose", () => {
    expect(percentOfMinor(1999, 1500, "floor")).toBe(299);
    expect(percentOfMinor(1999, 1500, "ceil")).toBe(300);
  });

  it("rejects a fractional amount instead of rounding it away", () => {
    expect(() => addMinor(19.99)).toThrow(TypeError);
    expect(() => percentOfMinor(1000, 12.5)).toThrow(TypeError);
  });

  it("formats for display", () => {
    expect(formatMinor(1999)).toBe("$19.99");
    expect(formatMinor(0)).toBe("$0.00");
    expect(formatMinor(123_456)).toBe("$1,234.56");
  });
});
