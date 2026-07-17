import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Check,
  CircleDollarSign,
  Clapperboard,
  Crosshair,
  Headphones,
  LayoutTemplate,
  MessageCircleMore,
  MessagesSquare,
  PackageCheck,
  Palette,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  UserRoundCheck,
  UserRoundSearch,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Reveal } from "@/shared/ui/reveal";
import { HeroVisual } from "@/widgets/hero-visual";
import { LandingFaq } from "@/widgets/landing-faq";

export const metadata: Metadata = {
  title: "Проверенные SMM-специалисты для бизнеса",
  description:
    "Найдите SMM-специалиста и работайте через безопасную сделку, отзывы и встроенный чат.",
};

const steps = [
  {
    number: "01",
    icon: LayoutTemplate,
    title: "Создайте задачу",
    text: "Опишите цель, сроки и комфортный бюджет в коротком брифе.",
  },
  {
    number: "02",
    icon: MessagesSquare,
    title: "Получите отклики",
    text: "Специалисты предложат подход, стоимость и сроки работы.",
  },
  {
    number: "03",
    icon: UserRoundSearch,
    title: "Выберите исполнителя",
    text: "Сравните кейсы, рейтинг и предложения без спешки.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Работайте безопасно",
    text: "Зафиксируйте условия и ведите проект внутри платформы.",
  },
] as const;

const categories = [
  {
    icon: Clapperboard,
    title: "Reels/TikTok монтаж",
    text: "Динамичный монтаж, субтитры и адаптация под тренды.",
    href: "/specialists?category=reels",
    tone: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  },
  {
    icon: Camera,
    title: "Ведение Instagram",
    text: "Стратегия, публикации, stories и работа с аудиторией.",
    href: "/specialists?category=instagram",
    tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
  },
  {
    icon: Palette,
    title: "Дизайн сторис",
    text: "Визуальная система и макеты, которые держат внимание.",
    href: "/specialists?category=stories",
    tone: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
  },
  {
    icon: Crosshair,
    title: "Таргет",
    text: "Запуск, тестирование гипотез и понятная аналитика.",
    href: "/specialists?category=target",
    tone: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
  },
  {
    icon: CalendarDays,
    title: "Контент-план",
    text: "Темы, рубрики и сценарии под реальные цели бизнеса.",
    href: "/specialists?category=content",
    tone: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  {
    icon: PackageCheck,
    title: "Упаковка профиля",
    text: "Позиционирование, структура и сильная точка входа.",
    href: "/specialists?category=profile",
    tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
] as const;

const advantages = [
  {
    icon: SearchCheck,
    title: "Выбор по фактам",
    text: "Смотрите релевантные кейсы, специализацию, рейтинг и подтверждённые отзывы.",
  },
  {
    icon: MessagesSquare,
    title: "Всё в одном месте",
    text: "Отклики, условия, сообщения и этапы проекта не теряются в разных сервисах.",
  },
  {
    icon: Sparkles,
    title: "Только про SMM",
    text: "Категории и профили спроектированы вокруг задач социальных сетей, а не абстрактного фриланса.",
  },
] as const;

const trustItems = [
  [UserRoundCheck, "Проверенные специалисты", "Профили, опыт и кейсы проходят модерацию."],
  [ShieldCheck, "Безопасная сделка", "Условия и оплата зафиксированы внутри проекта."],
  [Star, "Отзывы и рейтинг", "Оценки связаны с завершёнными сделками."],
  [MessageCircleMore, "Встроенный чат", "Вся важная переписка остаётся под рукой."],
  [Headphones, "Поддержка платформы", "Помогаем разобраться в сложных ситуациях."],
] as const;

export default function HomePage() {
  return (
    <main className="overflow-clip">
      <section className="relative isolate">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-15rem] size-[34rem] -translate-x-1/2 rounded-full bg-violet-500/[0.14] blur-[110px] sm:size-[48rem]" />
          <div className="absolute right-[-10rem] top-[16rem] size-[24rem] rounded-full bg-cyan-400/[0.08] blur-[100px]" />
          <div className="landing-grid absolute inset-x-0 top-0 h-[44rem] opacity-70" />
        </div>

        <div className="content-shell grid min-h-[calc(100svh-4.5rem)] gap-12 py-12 sm:py-16 lg:min-h-[47rem] lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="grid justify-items-start gap-7">
            <Reveal>
              <Badge className="gap-2 border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]" />
                Проверенные SMM-специалисты
              </Badge>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="grid gap-5">
                <h1 className="text-balance max-w-[48rem] text-[2.35rem] font-black leading-[1.04] tracking-[-0.055em] sm:text-[4rem] lg:text-[4.45rem]">
                  Найдите проверенного{" "}
                  <span className="premium-text-gradient">
                    <span className="sm:hidden">
                      SMM-<wbr />
                      специалиста
                    </span>
                    <span className="hidden sm:inline">SMM-специалиста</span>
                  </span>{" "}
                  для вашего бизнеса
                </h1>
                <p className="max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg sm:leading-8">
                  Работайте через безопасную сделку, отзывы и встроенный чат.
                </p>
              </div>
            </Reveal>

            <Reveal className="w-full" delay={0.12}>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "group w-full rounded-full px-6 sm:w-auto sm:min-w-52",
                  })}
                  href="/specialists"
                >
                  Найти специалиста
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className:
                      "group w-full rounded-full bg-[var(--surface)]/70 px-6 backdrop-blur-sm sm:w-auto sm:min-w-48",
                  })}
                  href="/auth/register?role=freelancer"
                >
                  Стать исполнителем
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-semibold text-[var(--muted-foreground)] sm:text-sm">
                <span className="flex items-center gap-2">
                  <BadgeCheck className="size-4 text-[var(--brand)]" />
                  Проверка профилей
                </span>
                <span className="flex items-center gap-2">
                  <Star className="size-4 text-[var(--brand)]" />
                  Отзывы после сделки
                </span>
                <span className="flex items-center gap-2">
                  <Headphones className="size-4 text-[var(--brand)]" />
                  Поддержка
                </span>
              </div>
            </Reveal>
          </div>

          <HeroVisual />
        </div>

        <div className="content-shell pb-8 sm:pb-12">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-[var(--border)] py-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted-foreground)] sm:justify-between sm:text-xs">
              <span>Поиск специалиста</span>
              <span className="hidden size-1 rounded-full bg-[var(--border-strong)] sm:block" />
              <span>Прозрачный выбор</span>
              <span className="hidden size-1 rounded-full bg-[var(--border-strong)] sm:block" />
              <span>Безопасная работа</span>
              <span className="hidden size-1 rounded-full bg-[var(--border-strong)] sm:block" />
              <span>Результат под контролем</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        className="content-shell scroll-mt-24 py-20 sm:py-28"
        id="how-it-works"
      >
        <Reveal>
          <SectionHeading
            eyebrow="Как это работает"
            title="Понятный путь от задачи до результата"
            text="Без бесконечных чатов и потерянных договорённостей. Каждый следующий шаг виден заранее."
          />
        </Reveal>
        <div className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          <div className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t border-dashed border-violet-400/35 lg:block" />
          {steps.map((step, index) => (
            <Reveal delay={index * 0.07} key={step.title}>
              <article className="group relative grid h-full content-start gap-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/35 hover:shadow-xl hover:shadow-violet-500/[0.06] sm:p-6">
                <div className="relative z-10 flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-2xl border border-violet-400/20 bg-[var(--surface)] text-[var(--brand)] shadow-[0_8px_30px_-16px_rgba(109,92,232,.55)] transition group-hover:scale-105">
                    <step.icon className="size-5" />
                  </span>
                  <span className="text-xs font-black tracking-[0.12em] text-[var(--muted-foreground)]/60">
                    {step.number}
                  </span>
                </div>
                <div className="grid gap-2">
                  <h3 className="text-lg font-bold tracking-[-0.02em]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                    {step.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        className="scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)]/55 py-20 sm:py-28"
        id="categories"
      >
        <div className="content-shell">
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Популярные категории"
                title="Найдите эксперта под конкретную задачу"
                text="От одного ролика до полной системы продвижения."
              />
              <Link
                className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand)]"
                href="/specialists"
              >
                Весь каталог
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal delay={(index % 3) * 0.06} key={category.title}>
                <Link className="group block h-full" href={category.href}>
                  <Card className="relative grid h-full min-h-52 content-between overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/35 hover:shadow-2xl hover:shadow-violet-500/[0.07] sm:p-6">
                    <div className="absolute -right-10 -top-10 size-32 rounded-full bg-violet-500/[0.05] blur-2xl transition group-hover:bg-violet-500/[0.11]" />
                    <div className="relative flex items-start justify-between">
                      <span
                        className={`grid size-11 place-items-center rounded-2xl ${category.tone}`}
                      >
                        <category.icon className="size-5" />
                      </span>
                      <span className="grid size-8 place-items-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition group-hover:border-[var(--brand)] group-hover:bg-[var(--brand)] group-hover:text-white">
                        <ArrowRight className="size-3.5 transition group-hover:-rotate-45" />
                      </span>
                    </div>
                    <div className="relative mt-8 grid gap-2">
                      <h3 className="text-lg font-bold tracking-[-0.02em]">
                        {category.title}
                      </h3>
                      <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                        {category.text}
                      </p>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="content-shell py-20 sm:py-28">
        <Reveal>
          <SectionHeading
            eyebrow="Преимущества"
            title="Не просто каталог. Рабочая система."
            text="SMMatch помогает принять решение и довести проект до результата — спокойно и прозрачно."
          />
        </Reveal>
        <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-3">
          {advantages.map((advantage, index) => (
            <Reveal delay={index * 0.08} key={advantage.title}>
              <Card
                className={`grid h-full min-h-64 content-between overflow-hidden p-6 sm:p-7 ${
                  index === 1
                    ? "border-violet-400/20 bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                    : ""
                }`}
              >
                <span
                  className={`grid size-11 place-items-center rounded-2xl ${
                    index === 1
                      ? "bg-white/10 text-violet-300 dark:bg-violet-500/10 dark:text-violet-600"
                      : "bg-violet-500/10 text-[var(--brand)]"
                  }`}
                >
                  <advantage.icon className="size-5" />
                </span>
                <div className="mt-10 grid gap-3">
                  <h3 className="text-xl font-bold tracking-[-0.025em]">
                    {advantage.title}
                  </h3>
                  <p
                    className={`text-sm leading-6 ${
                      index === 1
                        ? "text-white/60 dark:text-slate-600"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    {advantage.text}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        className="content-shell scroll-mt-24 py-12 sm:py-20"
        id="safety"
      >
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-8 text-white shadow-2xl shadow-slate-950/15 sm:rounded-[2.5rem] sm:px-10 sm:py-12 lg:grid lg:grid-cols-[.86fr_1.14fr] lg:gap-14 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,rgba(124,92,255,.34),transparent_38%),radial-gradient(circle_at_100%_100%,rgba(45,212,191,.12),transparent_35%)]" />
            <div className="grid content-start gap-7">
              <Badge className="border-white/15 bg-white/[0.07] text-violet-200">
                Доверие встроено в продукт
              </Badge>
              <div className="grid gap-4">
                <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
                  Спокойная работа на каждом этапе
                </h2>
                <p className="max-w-md text-sm leading-7 text-white/55 sm:text-base">
                  Инструменты платформы защищают договорённости и помогают обеим
                  сторонам сосредоточиться на результате.
                </p>
              </div>
              <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-4 lg:flex">
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <CircleDollarSign className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm">Условия зафиксированы</strong>
                  <span className="text-xs text-white/45">
                    Бюджет, сроки и этапы видны участникам
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-9 grid gap-2.5 lg:mt-0">
              {trustItems.map(([Icon, title, text], index) => (
                <Reveal delay={index * 0.05} key={title} y={12}>
                  <div className="group flex items-start gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.045] p-4 transition hover:border-white/15 hover:bg-white/[0.075] sm:items-center">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-violet-300">
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm">{title}</strong>
                      <span className="mt-0.5 block text-xs leading-5 text-white/45">
                        {text}
                      </span>
                    </span>
                    <Check className="ml-auto hidden size-4 shrink-0 text-emerald-400 sm:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section
        className="content-shell scroll-mt-24 py-20 sm:py-28"
        id="faq"
      >
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-16">
          <Reveal>
            <div className="grid content-start gap-5 lg:sticky lg:top-28">
              <Badge>FAQ</Badge>
              <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">
                Ответы на частые вопросы
              </h2>
              <p className="max-w-sm text-sm leading-7 text-[var(--muted-foreground)]">
                Не нашли нужный ответ? Напишите поддержке — поможем разобраться.
              </p>
              <Link
                className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-[var(--brand)]"
                href="/support"
              >
                Открыть поддержку
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <LandingFaq />
          </Reveal>
        </div>
      </section>

      <section className="content-shell pb-4 pt-8 sm:pb-6 sm:pt-12">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-violet-400/20 bg-[var(--surface)] px-5 py-10 text-center shadow-2xl shadow-violet-500/[0.08] sm:rounded-[2.5rem] sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-52 w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-[90px]" />
            <div className="mx-auto grid max-w-2xl justify-items-center gap-5">
              <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/10 text-[var(--brand)]">
                <UsersRound className="size-5" />
              </span>
              <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.045em] sm:text-5xl">
                Найдите человека, который усилит ваш бизнес
              </h2>
              <p className="text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                Опишите задачу или начните с каталога — без обязательств и
                лишних звонков.
              </p>
              <div className="mt-2 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full rounded-full px-7 sm:w-auto",
                  })}
                  href="/specialists"
                >
                  Найти специалиста
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className={buttonVariants({
                    variant: "secondary",
                    size: "lg",
                    className: "w-full rounded-full px-7 sm:w-auto",
                  })}
                  href="/auth/register?role=freelancer"
                >
                  Стать исполнителем
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="grid max-w-2xl gap-3">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
        {eyebrow}
      </span>
      <h2 className="text-balance text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      <p className="max-w-xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
        {text}
      </p>
    </div>
  );
}
