import { Settings } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function AdminSettingsPage() {
  return (
    <WorkspacePlaceholder
      description="Системные настройки и feature flags будут редактироваться через проверяемые server actions."
      emptyTitle="Настройки используют переменные окружения"
      icon={Settings}
      title="Настройки"
    />
  );
}
