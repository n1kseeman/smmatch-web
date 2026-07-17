import type { Metadata } from "next";
import { Search, SlidersHorizontal, Star } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export const metadata: Metadata = {
  title: "SMM-специалисты",
  description: "Каталог проверенных SMM-специалистов SMMatch.",
};

const demoSpecialists = [
  {
    name: "Анна Мельник",
    title: "SMM-стратег для e-commerce",
    rating: "4.9",
    price: "от 1 200 BYN",
    tags: ["Instagram", "Стратегия", "Аналитика"],
  },
  {
    name: "Максим Ковалёв",
    title: "Reels & TikTok продюсер",
    rating: "4.8",
    price: "от 900 BYN",
    tags: ["Reels", "UGC", "Продакшн"],
  },
  {
    name: "Дарья Романовская",
    title: "Performance-маркетолог",
    rating: "5.0",
    price: "от 1 500 BYN",
    tags: ["Таргет", "Воронки", "CJM"],
  },
] as const;

export default function SpecialistsPage() {
  return (
    <main className="content-shell py-10 sm:py-14">
      <div className="mb-8 grid gap-3">
        <Badge>Каталог</Badge>
        <h1 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
          Найдите своего специалиста
        </h1>
        <p className="max-w-2xl text-[var(--muted-foreground)]">
          Демо-каталог подключён к будущему server-side поиску; после настройки
          Supabase данные будут загружаться из опубликованных профилей.
        </p>
      </div>
      <Card className="mb-6 flex flex-col gap-3 p-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <Input
            aria-label="Поиск специалистов"
            className="pl-10"
            placeholder="Навык, платформа или ниша"
          />
        </label>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold">
          <SlidersHorizontal className="size-4" /> Фильтры
        </button>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {demoSpecialists.map((specialist, index) => (
          <Card className="grid content-start gap-5" key={specialist.name}>
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-lg font-black text-[var(--brand)]">
                {specialist.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
              </span>
              <span className="flex items-center gap-1 text-sm font-bold">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {specialist.rating}
              </span>
            </div>
            <div className="grid gap-1">
              <h2 className="text-lg font-bold">{specialist.name}</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {specialist.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {specialist.tags.map((tag) => (
                <span
                  className="rounded-lg bg-[var(--surface-strong)] px-2.5 py-1 text-xs font-semibold"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
              <strong className="text-sm">{specialist.price}</strong>
              <span className="text-xs text-[var(--muted-foreground)]">
                #{index + 1}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
