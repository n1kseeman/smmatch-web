import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/widgets/brand-logo";

const platformLinks = [
  ["Специалисты", "/specialists"],
  ["Как это работает", "/#how-it-works"],
  ["Категории", "/#categories"],
] as const;

const documentLinks = [
  ["Пользовательское соглашение", "/legal/terms"],
  ["Политика конфиденциальности", "/legal/privacy"],
  ["Правила платформы", "/legal/rules"],
  ["Поддержка", "/support"],
] as const;

export function MarketingFooter() {
  return (
    <footer className="mt-20 overflow-hidden bg-slate-950 text-white sm:mt-28">
      <div className="content-shell">
        <div className="grid gap-12 py-12 sm:grid-cols-2 sm:py-16 lg:grid-cols-[1.35fr_.7fr_1fr]">
          <div className="grid max-w-sm content-start gap-5">
            <BrandLogo className="text-white" />
            <p className="text-sm leading-6 text-white/55">
              Маркетплейс для поиска проверенных SMM-специалистов и безопасной
              работы в одном пространстве.
            </p>
            <a
              className="group inline-flex w-fit items-center gap-2 text-sm font-bold text-white transition hover:text-violet-300"
              href="mailto:support@smmatch.by"
            >
              support@smmatch.by
              <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
          <FooterColumn links={platformLinks} title="Платформа" />
          <FooterColumn links={documentLinks} title="Документы и помощь" />
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SMMatch. Все права защищены.</p>
          <p>Сделано для сильных команд и независимых специалистов.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly (readonly [string, string])[];
}) {
  return (
    <div className="grid content-start gap-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
        {title}
      </h2>
      <div className="grid gap-3">
        {links.map(([label, href]) => (
          <Link
            className="w-fit text-sm text-white/65 transition hover:translate-x-0.5 hover:text-white"
            href={href}
            key={href}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
