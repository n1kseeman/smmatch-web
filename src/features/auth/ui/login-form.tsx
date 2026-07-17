"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  loginSchema,
  type LoginValues,
} from "@/features/auth/model/schemas";
import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

export function LoginForm({
  nextPath = "/dashboard",
  configurationError = false,
}: {
  nextPath?: string;
  configurationError?: boolean;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(
    configurationError
      ? "Supabase ещё не настроен. Добавьте значения из .env.example в .env.local."
      : null,
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        setFormError("Неверный email или пароль.");
        return;
      }
      const safeNext =
        nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.replace(safeNext);
      router.refresh();
    } catch {
      setFormError(
        "Авторизация недоступна: проверьте настройки Supabase и подключение.",
      );
    }
  });

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
      <Field error={errors.email?.message} label="Email">
        <Input
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          type="email"
          {...register("email")}
        />
      </Field>
      <Field error={errors.password?.message} label="Пароль">
        <Input
          autoComplete="current-password"
          placeholder="••••••••••"
          type="password"
          {...register("password")}
        />
      </Field>
      <div className="flex justify-end">
        <Link
          className="text-sm font-semibold text-[var(--brand)] hover:underline"
          href="/auth/forgot"
        >
          Забыли пароль?
        </Link>
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Войти
      </Button>
    </form>
  );
}
