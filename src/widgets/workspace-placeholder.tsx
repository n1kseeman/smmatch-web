import type { LucideIcon } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { EmptyState } from "@/shared/ui/page-state";

export function WorkspacePlaceholder({
  title,
  description,
  emptyTitle,
  icon: Icon,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <div className="grid gap-2">
        <Badge>
          <Icon className="mr-1 size-3.5" /> Workspace
        </Badge>
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
      </div>
      <EmptyState description={description} title={emptyTitle} />
    </div>
  );
}
