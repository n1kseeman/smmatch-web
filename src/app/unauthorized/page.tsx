import Link from "next/link";

import { buttonVariants } from "@/shared/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="content-shell grid min-h-dvh place-items-center text-center">
      <div className="grid max-w-md justify-items-center gap-4">
        <span className="text-sm font-bold text-[var(--brand)]">403</span>
        <h1 className="text-3xl font-black">Недостаточно прав</h1>
        <p className="text-[var(--muted-foreground)]">
          Этот раздел предназначен для другой роли. Если это ошибка, обратитесь
          в поддержку.
        </p>
        <Link className={buttonVariants()} href="/dashboard">
          В своё пространство
        </Link>
      </div>
    </main>
  );
}
