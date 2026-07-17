import type { ReactNode } from "react";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      <span>{label}</span>
      {children}
      {error ? (
        <span className="text-xs font-medium text-red-600" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs font-normal text-[var(--muted-foreground)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
