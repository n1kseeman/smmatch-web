import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold tracking-wide text-violet-700 dark:text-violet-300",
        className,
      )}
      {...props}
    />
  );
}
