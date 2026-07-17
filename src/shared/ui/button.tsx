import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/cn";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[color,background-color,border-color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#7969ee] to-[#5e4bd5] text-white shadow-[0_10px_28px_-12px_rgba(91,71,210,.72)] hover:-translate-y-0.5 hover:from-[#8475f2] hover:to-[#6754df] hover:shadow-[0_14px_32px_-12px_rgba(91,71,210,.78)]",
        secondary:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] shadow-sm hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--surface-strong)] hover:shadow-md",
        ghost:
          "text-[var(--muted-foreground)] hover:bg-[var(--surface-strong)] hover:text-[var(--foreground)]",
        danger:
          "bg-red-600 text-white shadow-lg shadow-red-500/15 hover:bg-red-700",
      },
      size: {
        sm: "min-h-9 rounded-lg px-3 text-xs",
        md: "min-h-11 px-4",
        lg: "min-h-12 rounded-2xl px-6 text-base",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
