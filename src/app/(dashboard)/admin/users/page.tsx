import { Users } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function AdminUsersPage() {
  return (
    <WorkspacePlaceholder
      description="Администраторские операции выполняются только server-side через service role и журналируются."
      emptyTitle="Список пользователей загрузится из Supabase"
      icon={Users}
      title="Пользователи"
    />
  );
}
