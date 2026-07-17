"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  MessageCircle,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

const specialists = [
  {
    initials: "АМ",
    name: "Анна М.",
    role: "Reels-продюсер",
    rating: "4.9",
    match: "Лучший мэтч",
    tone: "from-violet-500 to-indigo-500",
  },
  {
    initials: "ДК",
    name: "Дарья К.",
    role: "SMM-стратег",
    rating: "4.8",
    match: "12 кейсов",
    tone: "from-fuchsia-500 to-rose-400",
  },
] as const;

export function HeroVisual() {
  return (
    <motion.div
      animate={{ y: [0, -5, 0] }}
      className="premium-shadow relative mx-auto min-h-[430px] w-full max-w-[32rem] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/75 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.055] sm:min-h-[500px] sm:rounded-[2rem] sm:p-5"
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      transition={{
        opacity: { duration: 0.65, delay: 0.12 },
        scale: { duration: 0.65, delay: 0.12 },
        y: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.8,
        },
      }}
      whileInView={{ opacity: 1, scale: 1 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(126,105,244,.17),transparent_38%),radial-gradient(circle_at_0%_100%,rgba(63,210,177,.12),transparent_36%)]" />
      <div className="relative rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)]/95 p-3 shadow-xl shadow-slate-900/[0.06] sm:rounded-[1.6rem] sm:p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,.12)]" />
            <span className="text-xs font-bold">Подбор специалиста</span>
          </div>
          <span className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[10px] font-bold text-[var(--muted-foreground)]">
            2 минуты
          </span>
        </div>

        <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3">
          <Search className="size-4 shrink-0 text-[var(--muted-foreground)]" />
          <span className="min-w-0 truncate text-xs font-medium sm:text-sm">
            Reels для бренда одежды
          </span>
          <span className="ml-auto hidden shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-600 shadow-sm dark:bg-white/10 dark:text-white/70 sm:inline">
            до 1 500 BYN
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Подходят под задачу
          </span>
          <span className="text-[11px] font-bold text-[var(--brand)]">
            Смотреть всех
          </span>
        </div>

        <div className="mt-3 grid gap-2.5">
          {specialists.map((specialist, index) => (
            <motion.div
              className="group flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 transition hover:border-violet-400/40 hover:shadow-lg hover:shadow-violet-500/[0.06] sm:p-3.5"
              initial={{ opacity: 0, x: 18, scale: 0.98 }}
              key={specialist.name}
              transition={{
                duration: 0.45,
                delay: 0.35 + index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
            >
              <span
                className={`grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${specialist.tone} text-xs font-black text-white shadow-md`}
              >
                {specialist.initials}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5">
                  <strong className="truncate text-sm">{specialist.name}</strong>
                  {index === 0 ? (
                    <BadgeCheck
                      className="size-3.5 shrink-0 fill-[var(--brand)] text-white dark:text-slate-950"
                      aria-label="Профиль проверен"
                    />
                  ) : null}
                </span>
                <span className="block truncate text-[11px] text-[var(--muted-foreground)] sm:text-xs">
                  {specialist.role}
                </span>
              </span>
              <span className="ml-auto grid shrink-0 justify-items-end gap-1">
                <span className="flex items-center gap-1 text-xs font-bold">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {specialist.rating}
                </span>
                <span className="text-[9px] font-semibold text-[var(--muted-foreground)] sm:text-[10px]">
                  {specialist.match}
                </span>
              </span>
              <ChevronRight className="hidden size-4 text-[var(--muted-foreground)] transition group-hover:translate-x-0.5 sm:block" />
            </motion.div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-950 p-3.5 text-white dark:bg-white dark:text-slate-950">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-600">
            <ShieldCheck className="size-5" />
          </span>
          <span className="min-w-0">
            <strong className="block text-xs sm:text-sm">
              Безопасная сделка
            </strong>
            <span className="block truncate text-[10px] opacity-60 sm:text-[11px]">
              Оплата после принятия результата
            </span>
          </span>
          <span className="ml-auto grid size-7 shrink-0 place-items-center rounded-full bg-emerald-400 text-slate-950">
            <Check className="size-3.5 stroke-[3]" />
          </span>
        </div>
      </div>

      <motion.div
        className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl border border-white/70 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90 sm:bottom-5 sm:right-5"
        initial={{ opacity: 0, y: 14 }}
        transition={{ delay: 0.75, duration: 0.45 }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        <MessageCircle className="size-4 text-[var(--brand)]" />
        <span className="text-[10px] font-bold sm:text-xs">
          Всё общение — внутри
        </span>
      </motion.div>
    </motion.div>
  );
}
