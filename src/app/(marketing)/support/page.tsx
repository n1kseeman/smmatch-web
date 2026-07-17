import type { Metadata } from "next";
import { ArrowRight, CircleHelp, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "Поддержка",
  description: "Помощь заказчикам и специалистам SMMatch.",
};

const helpTopics = [
  {
    icon: CircleHelp,
    title: "Аккаунт и профиль",
    text: "Регистрация, вход, роли и публикация профиля.",
  },
  {
    icon: ShieldCheck,
    title: "Сделки и споры",
    text: "Условия работы, статусы, приёмка и сложные ситуации.",
  },
  {
    icon: Mail,
    title: "Общие вопросы",
    text: "Возможности платформы, обратная связь и партнёрство.",
  },
] as const;

export default function SupportPage() {
  return (
    <main className="content-shell py-14 sm:py-20">
      <div className="mx-auto grid max-w-4xl gap-10">
        <header className="grid justify-items-start gap-5">
          <Badge>Поддержка SMMatch</Badge>
          <h1 className="text-balance text-4xl font-black leading-tight tracking-[-0.045em] sm:text-5xl">
            Поможем разобраться
          </h1>
          <p className="max-w-xl leading-7 text-[var(--muted-foreground)]">
            Опишите ситуацию и добавьте номер сделки, если вопрос связан с
            конкретным проектом.
          </p>
          <a
            className={buttonVariants({
              size: "lg",
              className: "rounded-full px-6",
            })}
            href="mailto:support@smmatch.by"
          >
            Написать в поддержку
            <ArrowRight className="size-4" />
          </a>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {helpTopics.map((topic) => (
            <Card className="grid content-start gap-5" key={topic.title}>
              <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/10 text-[var(--brand)]">
                <topic.icon className="size-5" />
              </span>
              <div className="grid gap-2">
                <h2 className="font-bold">{topic.title}</h2>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  {topic.text}
                </p>
              </div>
            </Card>
          ))}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          Возможно, ответ уже есть в{" "}
          <Link className="font-bold text-[var(--brand)]" href="/#faq">
            разделе FAQ
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
