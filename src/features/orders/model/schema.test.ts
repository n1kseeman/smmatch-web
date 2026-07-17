import { describe, expect, it } from "vitest";

import { createOrderSchema } from "./schema";

const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const validOrder = {
  title: "Монтаж серии коротких видео",
  category: "Reels/TikTok монтаж",
  description:
    "Нужно подготовить серию вертикальных роликов для запуска нового продукта.",
  budgetMin: "300",
  budgetMax: "600",
  deadline: futureDate,
  skills: "CapCut, motion design, CapCut",
};

describe("createOrderSchema", () => {
  it("normalizes skills and converts budget inputs", () => {
    const result = createOrderSchema.parse(validOrder);

    expect(result.budgetMin).toBe(300);
    expect(result.budgetMax).toBe(600);
    expect(result.skills).toEqual(["CapCut", "motion design"]);
  });

  it("does not allow an inverted budget range", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      budgetMin: "600",
      budgetMax: "300",
    });

    expect(result.success).toBe(false);
  });

  it("requires a deadline in the future", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      deadline: "2020-01-01",
    });

    expect(result.success).toBe(false);
  });
});
