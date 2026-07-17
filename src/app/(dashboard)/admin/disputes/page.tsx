import { ShieldAlert } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function AdminDisputesPage() {
  return (
    <WorkspacePlaceholder
      description="Очередь споров опирается на неизменяемую историю сделки и связанные транзакции."
      emptyTitle="Открытых споров нет"
      icon={ShieldAlert}
      title="Споры"
    />
  );
}
