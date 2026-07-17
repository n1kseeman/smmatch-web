import { CheckCircle2, Clock3, Plus, WalletCards } from "lucide-react";

import { requireRole } from "@/features/auth/server/session";
import { CreateOrderForm } from "@/features/orders/ui/create-order-form";
import { createClient } from "@/shared/api/supabase/server";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { EmptyState, ErrorState } from "@/shared/ui/page-state";

const statusLabels = {
  draft: "Черновик",
  open: "Открыт",
  in_review: "На рассмотрении",
  matched: "Исполнитель выбран",
  in_progress: "В работе",
  completed: "Завершён",
  cancelled: "Отменён",
} as const;

function formatMoney(value: number | null, currency: string) {
  if (value === null) return "По договорённости";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value / 100);
}

export default async function BusinessOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const [user, query] = await Promise.all([
    requireRole(["customer", "admin"]),
    searchParams,
  ]);
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, title, category, budget_min_minor, budget_max_minor, currency, deadline_at, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <ErrorState description="Заказы не удалось загрузить. Обновите страницу или обратитесь в поддержку." />
    );
  }

  const canCreateOrder = user.role === "customer";

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <Badge>
            <WalletCards className="mr-1 size-3.5" /> Marketplace
          </Badge>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            {canCreateOrder ? "Ваши заказы" : "Заказы клиентов"}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
            {canCreateOrder
              ? "Публикуйте понятные задачи, сравнивайте отклики и работайте через безопасную сделку."
              : "Просматривайте опубликованные клиентами задачи и их текущие статусы."}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)]">
          <Clock3 className="size-4" /> {orders.length} {orders.length === 1 ? "заказ" : "заказов"}
        </span>
      </div>

      {query.created === "1" ? (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 aria-hidden className="size-4" /> Заказ опубликован и
          доступен специалистам.
        </p>
      ) : null}

      {canCreateOrder ? (
        <Card className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-violet-500/10 text-[var(--brand)]">
              <Plus aria-hidden className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-black">Новый заказ</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                Это займёт около двух минут.
              </p>
            </div>
          </div>
          <CreateOrderForm />
        </Card>
      ) : null}

      {orders.length === 0 ? (
        <EmptyState
          description={
            canCreateOrder
              ? "Опишите первую задачу — специалисты смогут отправить отклики сразу после публикации."
              : "Здесь появятся опубликованные клиентами задачи."
          }
          title={canCreateOrder ? "Пока нет заказов" : "Пока пусто"}
        />
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <Card className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5" key={order.id}>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge>{statusLabels[order.status]}</Badge>
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {order.category}
                  </span>
                </div>
                <h2 className="truncate text-base font-black">{order.title}</h2>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Создан {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(order.created_at))}
                </p>
              </div>
              <div className="grid gap-1 text-left sm:text-right">
                <strong className="text-sm tabular-nums">
                  {formatMoney(order.budget_min_minor, order.currency)} — {formatMoney(order.budget_max_minor, order.currency)}
                </strong>
                {order.deadline_at ? (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    До {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(order.deadline_at))}
                  </span>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
