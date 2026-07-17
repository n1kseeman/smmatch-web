"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  updatePasswordSchema,
  type UpdatePasswordValues,
} from "@/features/auth/model/schemas";
import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError("Ссылка устарела или пароль не удалось обновить.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Не удалось подключиться к сервису авторизации.");
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
      <Field
        error={errors.password?.message}
        hint="10+ символов, заглавная буква и цифра"
        label="Новый пароль"
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
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Сохранить пароль
      </Button>
    </form>
  );
}
