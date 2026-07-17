"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/shared/lib/cn";

const questions = [
  {
    question: "Как SMMatch проверяет специалистов?",
    answer:
      "Профиль проходит модерацию, а опыт подтверждается кейсами и результатами завершённых сделок. Отзывы можно оставить только после реальной работы на платформе.",
  },
  {
    question: "Что такое безопасная сделка?",
    answer:
      "Оплата фиксируется внутри сделки и переводится исполнителю после принятия результата. Если возникает спор, история этапов и сообщений помогает поддержке разобраться в ситуации.",
  },
  {
    question: "Сколько стоит размещение задачи?",
    answer:
      "Создание профиля и публикация первой задачи доступны бесплатно. Все комиссии показываются заранее — до подтверждения сделки.",
  },
  {
    question: "Можно ли общаться со специалистом до выбора?",
    answer:
      "Да. Обсудите детали во встроенном чате, уточните подход и сроки, а затем выберите подходящее предложение.",
  },
  {
    question: "Что делать, если результат меня не устроил?",
    answer:
      "Сначала запросите доработку в рамках согласованного задания. Если договориться не получается, откройте спор — поддержка изучит условия, этапы и переписку.",
  },
] as const;

export function LandingFaq() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {questions.map((item, index) => {
        const isOpen = activeIndex === index;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={item.question}>
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className="flex min-h-20 w-full items-center justify-between gap-5 py-5 text-left sm:min-h-24"
              onClick={() => setActiveIndex(isOpen ? null : index)}
              type="button"
            >
              <span className="text-base font-bold tracking-[-0.01em] sm:text-lg">
                {item.question}
              </span>
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] transition duration-300",
                  isOpen &&
                    "rotate-180 border-violet-400/40 bg-violet-500/10 text-[var(--brand)]",
                )}
              >
                <ChevronDown className="size-4" aria-hidden />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  animate={{ height: "auto", opacity: 1 }}
                  className="overflow-hidden"
                  exit={{ height: 0, opacity: 0 }}
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <p className="max-w-3xl pb-6 pr-12 text-sm leading-7 text-[var(--muted-foreground)] sm:pb-8 sm:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
