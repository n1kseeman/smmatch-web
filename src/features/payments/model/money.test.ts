import { describe, expect, it } from "vitest";

import { formatMoney, moneySchema } from "./money";

describe("money", () => {
  it("stores values as integer minor units", () => {
    expect(moneySchema.safeParse({ amountMinor: 125050, currency: "BYN" }).success).toBe(
      true,
    );
    expect(moneySchema.safeParse({ amountMinor: 12.5, currency: "BYN" }).success).toBe(
      false,
    );
  });

  it("formats minor units without floating-point business logic", () => {
    expect(formatMoney(12345, "BYN")).toContain("123");
  });
});
