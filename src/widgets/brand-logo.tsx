import Link from "next/link";

import { cn } from "@/shared/lib/cn";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <Link
      aria-label="SMMatch — главная"
      className={cn(
        "inline-flex items-center gap-2.5 text-[17px] font-black tracking-[-0.045em]",
        className,
      )}
      href="/"
    >
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-[11px] bg-slate-950 text-sm text-white shadow-md shadow-violet-500/15 dark:bg-white dark:text-slate-950">
        <span className="relative z-10">S</span>
        <span className="absolute -right-2 -top-2 size-5 rounded-full bg-violet-500" />
      </span>
      <span>
        SM<span className="text-[var(--brand)]">MATCH</span>
      </span>
    </Link>
  );
}
