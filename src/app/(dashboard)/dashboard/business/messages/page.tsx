import { MessageSquareMore } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function BusinessMessagesPage() {
  return (
    <WorkspacePlaceholder
      description="Realtime-каналы ограничены участниками conversation; история сообщений защищена RLS."
      emptyTitle="Диалогов пока нет"
      icon={MessageSquareMore}
      title="Сообщения"
    />
  );
}
