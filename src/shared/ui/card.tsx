import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_18px_60px_-36px_rgba(15,23,42,.26)] sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
