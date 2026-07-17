import { ArrowUpRight, Clock3, FolderKanban, WalletCards } from "lucide-react";

import type { CurrentUser } from "@/entities/user/model/types";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/page-state";

export function DashboardOverview({
  user,
  mode,
}: {
  user: CurrentUser;
  mode: "customer" | "freelancer" | "admin";
}) {
  const stats =
    mode === "admin"
      ? [
          ["Новые пользователи", "—", ArrowUpRight],
          ["Открытые споры", "—", Clock3],
          ["GMV платформы", "—", WalletCards],
        ]
      : [
          [mode === "customer" ? "Активные заказы" : "Активные проекты", "0", FolderKanban],
          ["Ожидают ответа", "0", Clock3],
          [mode === "customer" ? "Расходы" : "Баланс", "0 BYN", WalletCards],
        ];

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div className="grid gap-2">
          <Badge>
            {mode === "admin"
              ? "Администрирование"
              : mode === "customer"
                ? "Для бизнеса"
                : "Для специалиста"}
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Добро пожаловать, {user.displayName}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Здесь появятся актуальные данные после первых действий.
          </p>
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Статистика">
        {stats.map(([label, value, Icon]) => (
          <Card className="grid gap-5" key={label as string}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-[var(--muted-foreground)]">
                {label as string}
              </span>
              <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-[var(--brand)]">
                <Icon className="size-4" />
              </span>
            </div>
            <strong className="text-3xl font-black">{value as string}</strong>
          </Card>
        ))}
      </section>
      <section>
        <h2 className="mb-3 text-lg font-bold">Последняя активность</h2>
        <EmptyState
          action={
            mode === "customer"
              ? { label: "Создать заказ", href: "/dashboard/business/orders" }
              : mode === "freelancer"
                ? { label: "Найти проект", href: "/dashboard/specialist/projects" }
                : undefined
          }
          description={
            mode === "admin"
              ? "Системные события и обращения появятся после подключения базы."
              : "Новые сделки, сообщения и статусы будут собраны здесь."
          }
          title="Активности пока нет"
        />
      </section>
    </div>
  );
}
