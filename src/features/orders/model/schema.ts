import { z } from "zod";

export const orderCategories = [
  "Reels/TikTok монтаж",
  "Ведение Instagram",
  "Дизайн сторис",
  "Таргет",
  "Контент-план",
  "Упаковка профиля",
] as const;

const moneySchema = z.coerce
  .number("Укажите сумму цифрами")
  .finite("Укажите корректную сумму")
  .min(10, "Минимальный бюджет — 10 BYN")
  .max(10_000_000, "Максимальный бюджет — 10 000 000 BYN");

const skillsSchema = z
  .string()
  .trim()
  .transform((value) =>
    [...new Set(value.split(",").map((skill) => skill.trim()).filter(Boolean))]
      .slice(0, 12),
  )
  .refine(
    (skills) => skills.every((skill) => skill.length <= 40),
    "Каждый навык — до 40 символов",
  );

export const createOrderSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Минимум 5 символов")
      .max(160, "Не более 160 символов"),
    category: z.enum(orderCategories, {
      error: "Выберите категорию",
    }),
    description: z
      .string()
      .trim()
      .min(20, "Опишите задачу минимум в 20 символах")
      .max(15_000, "Не более 15 000 символов"),
    budgetMin: moneySchema,
    budgetMax: moneySchema,
    deadline: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Выберите дату")
      .refine(
        (value) => new Date(`${value}T23:59:59.999Z`) > new Date(),
        "Дедлайн должен быть в будущем",
      ),
    skills: skillsSchema,
  })
  .refine((values) => values.budgetMax >= values.budgetMin, {
    message: "Максимальный бюджет не может быть меньше минимального",
    path: ["budgetMax"],
  });

export type CreateOrderValues = z.infer<typeof createOrderSchema>;
