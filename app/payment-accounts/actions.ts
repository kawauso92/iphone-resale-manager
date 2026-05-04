"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { PaymentAccount } from "@/types";

function sanitizePaymentAccount(data: Partial<PaymentAccount>) {
  const name = `${data.name ?? ""}`.trim();
  return {
    name,
    is_active: data.is_active ?? true,
  };
}

function revalidatePaymentAccountPaths() {
  revalidatePath("/payment-accounts");
  revalidatePath("/orders");
}

export async function createPaymentAccount(data: Partial<PaymentAccount>) {
  const payload = sanitizePaymentAccount(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("payment_accounts").insert([payload]);

  if (error) {
    console.error("[supabase:createPaymentAccount]", error);
    throw new Error(error.message);
  }

  revalidatePaymentAccountPaths();
}

export async function updatePaymentAccount(id: string, data: Partial<PaymentAccount>) {
  const payload = sanitizePaymentAccount(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("payment_accounts").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updatePaymentAccount]", error);
    throw new Error(error.message);
  }

  revalidatePaymentAccountPaths();
}

export async function deletePaymentAccount(id: string) {
  const { error } = await supabase
    .from("payment_accounts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deletePaymentAccount]", error);
    throw new Error(error.message);
  }

  revalidatePaymentAccountPaths();
}

export async function duplicatePaymentAccount(id: string) {
  const { data, error } = await supabase.from("payment_accounts").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicatePaymentAccount:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase
    .from("payment_accounts")
    .insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicatePaymentAccount:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidatePaymentAccountPaths();
}
