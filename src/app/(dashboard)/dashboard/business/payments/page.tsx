import { CircleDollarSign } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function BusinessPaymentsPage() {
  return (
    <WorkspacePlaceholder
      description="Суммы хранятся в минимальных денежных единицах. Платёжный провайдер, idempotency key и webhook-журнал уже предусмотрены."
      emptyTitle="Транзакций пока нет"
      icon={CircleDollarSign}
      title="Платежи"
    />
  );
}
