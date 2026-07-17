"use client";

import { useEffect } from "react";

import { ErrorState } from "@/shared/ui/page-state";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="content-shell py-16">
      <ErrorState reset={reset} />
    </main>
  );
}
