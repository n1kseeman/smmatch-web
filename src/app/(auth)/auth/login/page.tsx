import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/features/auth/ui/login-form";

export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/dashboard";

  return (
    <div className="grid gap-7">
      <div className="grid gap-2">
        <h1 className="text-3xl font-black tracking-tight">С возвращением</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Войдите, чтобы продолжить работу.
        </p>
      </div>
      <LoginForm
        configurationError={params.error === "configuration"}
        nextPath={nextPath}
      />
      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Нет аккаунта?{" "}
        <Link className="font-bold text-[var(--brand)]" href="/auth/register">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
