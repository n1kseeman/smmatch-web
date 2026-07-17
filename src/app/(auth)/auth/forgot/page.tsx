import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/features/auth/ui/forgot-password-form";

export const metadata: Metadata = { title: "Восстановление пароля" };

export default function ForgotPasswordPage() {
  return (
    <div className="grid gap-7">
      <div className="grid gap-2">
        <h1 className="text-3xl font-black tracking-tight">Восстановить пароль</h1>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Пришлём безопасную ссылку для смены пароля.
        </p>
      </div>
      <ForgotPasswordForm />
      <Link
        className="text-center text-sm font-bold text-[var(--brand)]"
        href="/auth/login"
      >
        Назад ко входу
      </Link>
    </div>
  );
}
