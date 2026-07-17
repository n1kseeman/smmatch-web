"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/cn";
import { useUiStore } from "@/shared/store/ui-store";
import { buttonVariants, Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { BrandLogo } from "@/widgets/brand-logo";

const navigation = [
  { label: "Категории", href: "/#categories" },
  { label: "Как это работает", href: "/#how-it-works" },
  { label: "Безопасность", href: "/#safety" },
  { label: "FAQ", href: "/#faq" },
] as const;

export function MarketingHeader() {
  const pathname = usePathname();
  const { mobileNavigationOpen, setMobileNavigationOpen } = useUiStore();

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.045] bg-[color:var(--background)]/82 backdrop-blur-2xl dark:border-white/[0.07]">
      <div className="content-shell flex min-h-[4.5rem] items-center justify-between gap-2">
        <BrandLogo />
        <nav
          aria-label="Основная навигация"
          className="hidden items-center lg:flex"
        >
          {navigation.map((item) => (
            <Link
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "px-3 text-[13px]",
                pathname === item.href && "text-[var(--foreground)]",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden md:inline-flex",
            )}
            href="/auth/login"
          >
            Войти
          </Link>
          <Link
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden rounded-full px-4 md:inline-flex",
            )}
            href="/auth/register?role=customer"
          >
            Разместить задачу
          </Link>
          <Button
            aria-expanded={mobileNavigationOpen}
            aria-label={mobileNavigationOpen ? "Закрыть меню" : "Открыть меню"}
            className="lg:hidden"
            onClick={() => setMobileNavigationOpen(!mobileNavigationOpen)}
            size="icon"
            variant="ghost"
          >
            {mobileNavigationOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {mobileNavigationOpen ? (
          <motion.nav
            animate={{ height: "auto", opacity: 1 }}
            aria-label="Мобильная навигация"
            className="content-shell grid overflow-hidden border-t border-[var(--border)] lg:hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="grid gap-1 py-3">
              {navigation.map((item) => (
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "justify-start px-3",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "justify-start px-3",
                )}
                href="/specialists"
                onClick={() => setMobileNavigationOpen(false)}
              >
                Каталог специалистов
              </Link>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  className={buttonVariants({ variant: "secondary" })}
                  href="/auth/login"
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  className={buttonVariants()}
                  href="/auth/register"
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  Начать
                </Link>
              </div>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
