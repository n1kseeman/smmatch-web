import { MessageSquareMore } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function SpecialistMessagesPage() {
  return (
    <WorkspacePlaceholder
      description="Чат готов к Supabase Realtime, вложениям и системным сообщениям о статусах сделки."
      emptyTitle="Диалогов пока нет"
      icon={MessageSquareMore}
      title="Сообщения"
    />
  );
}
