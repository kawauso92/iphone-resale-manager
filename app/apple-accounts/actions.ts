"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { AppleAccount } from "@/types";

function cleanText(value?: string | null) {
  const text = `${value ?? ""}`.trim();
  return text ? text : null;
}

function sanitizeAppleAccount(data: Partial<AppleAccount>) {
  return {
    email: `${data.email ?? ""}`.trim(),
    memo: cleanText(data.memo),
    is_active: data.is_active ?? true,
  };
}

function revalidateAppleAccountPaths() {
  revalidatePath("/apple-accounts");
  revalidatePath("/orders");
  revalidatePath("/reports");
}

export async function createAppleAccount(data: Partial<AppleAccount>) {
  const payload = sanitizeAppleAccount(data);

  if (!payload.email) {
    throw new Error("メールアドレスは必須です。");
  }

  const { error } = await supabase.from("apple_accounts").insert([payload]);

  if (error) {
    console.error("[supabase:createAppleAccount]", error);
    throw new Error(error.message);
  }

  revalidateAppleAccountPaths();
}

export async function updateAppleAccount(id: string, data: Partial<AppleAccount>) {
  const payload = sanitizeAppleAccount(data);

  if (!payload.email) {
    throw new Error("メールアドレスは必須です。");
  }

  const { error } = await supabase.from("apple_accounts").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateAppleAccount]", error);
    throw new Error(error.message);
  }

  revalidateAppleAccountPaths();
}

export async function deleteAppleAccount(id: string) {
  const { error } = await supabase.from("apple_accounts").delete().eq("id", id);

  if (error) {
    console.error("[supabase:deleteAppleAccount]", error);
    throw new Error(error.message);
  }

  revalidateAppleAccountPaths();
}

export async function duplicateAppleAccount(id: string) {
  const { data, error } = await supabase.from("apple_accounts").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateAppleAccount:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("apple_accounts").insert([copy]);

  if (insertError) {
    console.error("[supabase:duplicateAppleAccount:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateAppleAccountPaths();
}
