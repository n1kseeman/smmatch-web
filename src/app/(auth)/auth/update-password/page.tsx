import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/features/auth/ui/update-password-form";

export const metadata: Metadata = { title: "Новый пароль" };
export const dynamic = "force-dynamic";

export default function UpdatePasswordPage() {
  return (
    <div className="grid gap-7">
      <div className="grid gap-2">
        <h1 className="text-3xl font-black tracking-tight">Новый пароль</h1>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Придумайте новый пароль для аккаунта.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
