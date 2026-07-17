import { AlertTriangle, Inbox } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export function EmptyState({
  title = "Пока пусто",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <Card className="grid min-h-64 place-items-center text-center">
      <div className="grid max-w-sm justify-items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-[var(--brand)]">
          <Inbox aria-hidden className="size-6" />
        </span>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
        {action ? (
          <Link className={buttonVariants()} href={action.href}>
            {action.label}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

export function ErrorState({
  title = "Что-то пошло не так",
  description = "Попробуйте обновить страницу. Если ошибка повторится, сообщите поддержке.",
  reset,
}: {
  title?: string;
  description?: string;
  reset?: () => void;
}) {
  return (
    <Card className="grid min-h-64 place-items-center text-center">
      <div className="grid max-w-md justify-items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-red-500/10 text-red-600">
          <AlertTriangle aria-hidden className="size-6" />
        </span>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
        {reset ? (
          <button className={buttonVariants()} onClick={reset} type="button">
            Повторить
          </button>
        ) : null}
      </div>
    </Card>
  );
}
