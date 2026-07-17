import { z } from "zod";

export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative().safe(),
  currency: z.enum(["BYN", "EUR", "USD"]),
});

export function formatMoney(
  amountMinor: number,
  currency: "BYN" | "EUR" | "USD",
  locale = "ru-BY",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}
