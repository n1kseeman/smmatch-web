import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/features/auth/ui/register-form";

export const metadata: Metadata = { title: "Регистрация" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialRole =
    params.role === "freelancer" ? "freelancer" : "customer";

  return (
    <div className="grid gap-7 py-4">
      <div className="grid gap-2">
        <h1 className="text-3xl font-black tracking-tight">Создать аккаунт</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Выберите роль — её можно расширить через поддержку.
        </p>
      </div>
      <RegisterForm initialRole={initialRole} />
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Уже с нами?{" "}
        <Link className="font-bold text-[var(--brand)]" href="/auth/login">
          Войти
        </Link>
      </p>
    </div>
  );
}
