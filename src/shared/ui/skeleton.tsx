import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-xl bg-[var(--surface-strong)]",
        className,
      )}
      {...props}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="content-shell grid gap-5 py-8" aria-label="Загрузка">
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-36" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
