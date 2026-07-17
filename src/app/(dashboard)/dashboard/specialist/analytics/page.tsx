import { ChartNoAxesCombined } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function SpecialistAnalyticsPage() {
  return (
    <WorkspacePlaceholder
      description="Метрики профиля и сделок будут агрегироваться отдельными read-моделями без нагрузки на транзакционные таблицы."
      emptyTitle="Недостаточно данных для аналитики"
      icon={ChartNoAxesCombined}
      title="Аналитика"
    />
  );
}
