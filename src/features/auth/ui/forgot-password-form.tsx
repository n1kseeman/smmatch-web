"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/model/schemas";
import { createClient } from "@/shared/api/supabase/client";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
    } finally {
      // Keep the response identical whether the email exists or not.
      setMessage("Если аккаунт существует, письмо уже отправлено.");
    }
  });

  return (
    <form className="grid gap-5" noValidate onSubmit={onSubmit}>
      {message ? (
        <div
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {message}
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
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : null}
        Отправить ссылку
      </Button>
    </form>
  );
}
