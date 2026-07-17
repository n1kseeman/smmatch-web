import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { BrandLogo } from "@/widgets/brand-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <section className="flex min-h-dvh flex-col">
        <header className="flex min-h-16 items-center justify-between px-5 sm:px-8">
          <BrandLogo />
          <ThemeToggle />
        </header>
        <div className="grid flex-1 place-items-center px-5 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </section>
      <aside className="app-grid relative hidden overflow-hidden border-l border-[var(--border)] bg-[var(--surface)] p-10 lg:grid lg:place-items-center">
        <div className="relative grid max-w-lg gap-6">
          <span className="text-sm font-bold text-[var(--brand)]">
            SMMatch Workspace
          </span>
          <p className="text-balance text-4xl font-black leading-tight">
            Одна платформа для поиска, сделки и результата.
          </p>
          <p className="leading-7 text-[var(--muted-foreground)]">
            Роли, доступы, чат, платежи и модерация спроектированы как единый
            продукт, а не набор разрозненных экранов.
          </p>
          <Link className="text-sm font-bold text-[var(--brand)]" href="/">
            Узнать больше →
          </Link>
        </div>
      </aside>
    </main>
  );
}
