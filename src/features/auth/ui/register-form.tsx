"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, LoaderCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth/model/schemas";
import { createClient } from "@/shared/api/supabase/client";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

export function RegisterForm({
  initialRole = "customer",
}: {
  initialRole?: "customer" | "freelancer";
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      email: "",
      role: initialRole,
      password: "",
      confirmPassword: "",
      terms: undefined,
    },
  });
  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            display_name: values.displayName,
            role: values.role,
          },
        },
      });
      if (error) {
        setFormError(
          error.message.toLowerCase().includes("registered")
            ? "Аккаунт с таким email уже существует."
            : "Не удалось создать аккаунт. Попробуйте ещё раз.",
        );
        return;
      }
      setSuccess(true);
    } catch {
      setFormError(
        "Регистрация недоступна: проверьте настройки Supabase и подключение.",
      );
    }
  });

  if (success) {
    return (
      <div className="grid gap-4 text-center" role="status">
        <span className="text-4xl">✉️</span>
        <h2 className="text-xl font-bold">Проверьте почту</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Мы отправили ссылку подтверждения. После перехода профиль будет создан
          автоматически.
        </p>
        <Link className="font-semibold text-[var(--brand)]" href="/auth/login">
          Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={onSubmit}>
      {formError ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300"
          role="alert"
        >
          {formError}
        </div>
      ) : null}
      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-semibold">Я хочу</legend>
        <div className="grid grid-cols-2 gap-2">
          <RoleOption
            checked={selectedRole === "customer"}
            icon={BriefcaseBusiness}
            label="Нанимать"
            value="customer"
            {...register("role")}
          />
          <RoleOption
            checked={selectedRole === "freelancer"}
            icon={UserRound}
            label="Работать"
            value="freelancer"
            {...register("role")}
          />
        </div>
      </fieldset>
      <Field error={errors.displayName?.message} label="Имя">
        <Input
          autoComplete="name"
          placeholder="Как к вам обращаться"
          {...register("displayName")}
        />
      </Field>
      <Field error={errors.email?.message} label="Email">
        <Input
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          type="email"
          {...register("email")}
        />
      </Field>
      <Field
        error={errors.password?.message}
        hint="10+ символов, заглавная буква и цифра"
        label="Пароль"
      >
        <Input
          autoComplete="new-password"
          type="password"
          {...register("password")}
        />
      </Field>
      <Field error={errors.confirmPassword?.message} label="Повторите пароль">
        <Input
          autoComplete="new-password"
          type="password"
          {...register("confirmPassword")}
        />
      </Field>
      <label className="flex items-start gap-3 text-sm leading-5">
        <input
          className="mt-1 size-4 accent-[var(--brand)]"
          type="checkbox"
          {...register("terms")}
        />
        <span>
          Принимаю условия сервиса и политику обработки данных
          {errors.terms ? (
            <span className="mt-1 block text-xs text-red-600" role="alert">
              {errors.terms.message}
            </span>
          ) : null}
        </span>
      </label>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Создать аккаунт
      </Button>
    </form>
  );
}

function RoleOption({
  label,
  icon: Icon,
  checked,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  checked: boolean;
  icon: typeof UserRound;
}) {
  return (
    <label
      className={cn(
        "relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition",
        checked
          ? "border-[var(--brand)] bg-violet-500/10 text-[var(--brand)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)]",
      )}
    >
      <input className="sr-only" type="radio" {...inputProps} />
      <Icon className="size-5" />
      {label}
    </label>
  );
}
