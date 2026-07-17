"use client";

import { useActionState } from "react";
import { LoaderCircle, Send } from "lucide-react";

import {
  initialCreateOrderState,
  createOrder,
} from "@/features/orders/server/create-order";
import { orderCategories } from "@/features/orders/model/schema";
import { Button } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-violet-500/15";

export function CreateOrderForm() {
  const [state, formAction, isPending] = useActionState(
    createOrder,
    initialCreateOrderState,
  );

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.formError ? (
        <p
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300"
          role="alert"
        >
          {state.formError}
        </p>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={state.fieldErrors?.title} label="Название задачи">
          <Input
            aria-invalid={Boolean(state.fieldErrors?.title)}
            autoComplete="off"
            name="title"
            placeholder="Например, монтаж 12 Reels для бренда"
            required
          />
        </Field>
        <Field error={state.fieldErrors?.category} label="Категория">
          <select
            aria-invalid={Boolean(state.fieldErrors?.category)}
            className={inputClassName}
            defaultValue=""
            name="category"
            required
          >
            <option disabled value="">
              Выберите направление
            </option>
            {orderCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field
        error={state.fieldErrors?.description}
        hint="Укажите результат, формат материалов, референсы и критерии приёмки."
        label="Описание"
      >
        <textarea
          aria-invalid={Boolean(state.fieldErrors?.description)}
          className={`${inputClassName} min-h-36 resize-y py-3`}
          name="description"
          placeholder="Расскажите, что нужно получить и для какой аудитории."
          required
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field error={state.fieldErrors?.budgetMin} label="Бюджет от, BYN">
          <Input
            aria-invalid={Boolean(state.fieldErrors?.budgetMin)}
            inputMode="decimal"
            min="10"
            name="budgetMin"
            placeholder="300"
            required
            step="0.01"
            type="number"
          />
        </Field>
        <Field error={state.fieldErrors?.budgetMax} label="Бюджет до, BYN">
          <Input
            aria-invalid={Boolean(state.fieldErrors?.budgetMax)}
            inputMode="decimal"
            min="10"
            name="budgetMax"
            placeholder="600"
            required
            step="0.01"
            type="number"
          />
        </Field>
        <Field error={state.fieldErrors?.deadline} label="Дедлайн">
          <Input
            aria-invalid={Boolean(state.fieldErrors?.deadline)}
            name="deadline"
            required
            type="date"
          />
        </Field>
      </div>
      <Field
        error={state.fieldErrors?.skills}
        hint="Необязательно. До 12 навыков через запятую."
        label="Нужные навыки"
      >
        <Input
          aria-invalid={Boolean(state.fieldErrors?.skills)}
          autoComplete="off"
          name="skills"
          placeholder="CapCut, motion design, copywriting"
        />
      </Field>
      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-[var(--muted-foreground)]">
          После публикации специалисты смогут отправлять отклики, а условия
          заказа останутся под вашим контролем.
        </p>
        <Button className="shrink-0" disabled={isPending} type="submit">
          {isPending ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <Send aria-hidden className="size-4" />
          )}
          {isPending ? "Публикуем…" : "Опубликовать заказ"}
        </Button>
      </div>
    </form>
  );
}
