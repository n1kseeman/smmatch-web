import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Введите корректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "Укажите имя")
      .max(80, "Не более 80 символов"),
    email: z.email("Введите корректный email"),
    role: z.enum(["customer", "freelancer"]),
    password: z
      .string()
      .min(10, "Минимум 10 символов")
      .max(72, "Не более 72 символов")
      .regex(/[A-ZА-ЯЁ]/, "Добавьте заглавную букву")
      .regex(/[0-9]/, "Добавьте цифру"),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      error: "Нужно принять условия сервиса",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Введите корректный email"),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Минимум 10 символов")
      .max(72, "Не более 72 символов")
      .regex(/[A-ZА-ЯЁ]/, "Добавьте заглавную букву")
      .regex(/[0-9]/, "Добавьте цифру"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
