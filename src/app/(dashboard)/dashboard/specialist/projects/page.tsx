import { BriefcaseBusiness } from "lucide-react";

import { WorkspacePlaceholder } from "@/widgets/workspace-placeholder";

export default function SpecialistProjectsPage() {
  return (
    <WorkspacePlaceholder
      description="Опубликованные заказы и собственные предложения будут загружаться с серверной пагинацией."
      emptyTitle="Подходящих проектов пока нет"
      icon={BriefcaseBusiness}
      title="Проекты"
    />
  );
}
