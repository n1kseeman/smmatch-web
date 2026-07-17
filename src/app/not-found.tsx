import Link from "next/link";

import { buttonVariants } from "@/shared/ui/button";

export default function NotFound() {
  return (
    <main className="content-shell grid min-h-dvh place-items-center py-16 text-center">
      <div className="grid max-w-lg justify-items-center gap-4">
        <span className="text-sm font-bold text-[var(--brand)]">404</span>
        <h1 className="text-balance text-4xl font-black">Страница потерялась</h1>
        <p className="text-[var(--muted-foreground)]">
          Похоже, ссылка устарела или адрес введён с ошибкой.
        </p>
        <Link className={buttonVariants()} href="/">
          На главную
        </Link>
      </div>
    </main>
  );
}
