"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/features/auth/server/session";
import { createOrderSchema } from "@/features/orders/model/schema";
import { createClient } from "@/shared/api/supabase/server";

export type CreateOrderState = {
  formError?: string;
  fieldErrors?: Partial<Record<string, string>>;
};

export const initialCreateOrderState: CreateOrderState = {};

function getFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    budgetMin: formData.get("budgetMin"),
    budgetMax: formData.get("budgetMax"),
    deadline: formData.get("deadline"),
    skills: formData.get("skills") ?? "",
  };
}

export async function createOrder(
  _previousState: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const parsed = createOrderSchema.safeParse(getFormValues(formData));

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    return {
      formError: "Проверьте поля формы и попробуйте снова.",
      fieldErrors: Object.fromEntries(
        Object.entries(flattened).map(([field, errors]) => [
          field,
          errors?.[0] ?? "Некорректное значение",
        ]),
      ),
    };
  }

  const user = await requireRole(["customer"]);
  const values = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("orders").insert({
    customer_id: user.id,
    title: values.title,
    category: values.category,
    description: values.description,
    required_skills: values.skills,
    budget_min_minor: Math.round(values.budgetMin * 100),
    budget_max_minor: Math.round(values.budgetMax * 100),
    currency: "BYN",
    deadline_at: `${values.deadline}T23:59:59.999Z`,
    status: "open",
    published_at: new Date().toISOString(),
  });

  if (error) {
    return {
      formError:
        "Не удалось опубликовать заказ. Обновите страницу и повторите попытку.",
    };
  }

  revalidatePath("/dashboard/business/orders");
  redirect("/dashboard/business/orders?created=1");
}
