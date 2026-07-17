import {
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleDollarSign,
  LayoutDashboard,
  MessageSquareMore,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { CurrentUser } from "@/entities/user/model/types";
import { buttonVariants } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { BrandLogo } from "@/widgets/brand-logo";

const navigationByRole = {
  customer: [
    { label: "Обзор", href: "/dashboard/business", icon: LayoutDashboard },
    {
      label: "Заказы",
      href: "/dashboard/business/orders",
      icon: BriefcaseBusiness,
    },
    {
      label: "Сообщения",
      href: "/dashboard/business/messages",
      icon: MessageSquareMore,
    },
    {
      label: "Платежи",
      href: "/dashboard/business/payments",
      icon: CircleDollarSign,
    },
  ],
  freelancer: [
    { label: "Обзор", href: "/dashboard/specialist", icon: LayoutDashboard },
    {
      label: "Проекты",
      href: "/dashboard/specialist/projects",
      icon: BriefcaseBusiness,
    },
    {
      label: "Сообщения",
      href: "/dashboard/specialist/messages",
      icon: MessageSquareMore,
    },
    {
      label: "Аналитика",
      href: "/dashboard/specialist/analytics",
      icon: ChartNoAxesCombined,
    },
  ],
  admin: [
    { label: "Обзор", href: "/admin", icon: LayoutDashboard },
    { label: "Пользователи", href: "/admin/users", icon: Users },
    { label: "Споры", href: "/admin/disputes", icon: ShieldCheck },
    { label: "Настройки", href: "/admin/settings", icon: Settings },
  ],
} as const;

export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  const navigation = navigationByRole[user.role];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex lg:flex-col">
        <BrandLogo className="min-h-12 px-2" />
        <nav className="mt-6 grid gap-1" aria-label="Рабочее пространство">
          {navigation.map((item) => (
            <Link
              className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]"
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-3 border-t border-[var(--border)] pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-sm font-black text-[var(--brand)]">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <strong className="block truncate text-sm">
                {user.displayName}
              </strong>
              <span className="block truncate text-xs text-[var(--muted-foreground)]">
                {user.email}
              </span>
            </span>
          </div>
          <form action="/auth/signout" method="post">
            <button
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "w-full",
              })}
              type="submit"
            >
              Выйти
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[color:var(--background)]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <BrandLogo />
          </div>
          <div className="hidden lg:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Рабочее пространство
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Уведомления"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              type="button"
            >
              <Bell className="size-5" />
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
        <nav
          aria-label="Мобильное рабочее пространство"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-flow-col border-t border-[var(--border)] bg-[var(--surface)] px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
        >
          {navigation.slice(0, 4).map((item) => (
            <Link
              className="grid min-h-12 place-items-center gap-0.5 text-[10px] font-semibold text-[var(--muted-foreground)]"
              href={item.href}
              key={item.href}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
