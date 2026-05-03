"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { ManagedProduct } from "@/types";

function cleanText(value?: string | null) {
  const text = `${value ?? ""}`.trim();
  return text ? text : null;
}

function cleanRequiredText(value?: string | null) {
  return `${value ?? ""}`.trim();
}

function cleanNumber(value?: number | null, fallback = 0) {
  if (value === null || value === undefined || value === Number.NaN) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function cleanNumberOrNull(value?: number | null) {
  if (value === null || value === undefined || value === Number.NaN) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function sanitizeManagedProduct(data: Partial<ManagedProduct>) {
  return {
    name: cleanRequiredText(data.name),
    category: cleanRequiredText(data.category),
    purchase_date: cleanRequiredText(data.purchase_date),
    purchase_source: cleanRequiredText(data.purchase_source),
    purchase_price: cleanNumber(data.purchase_price),
    sell_source: cleanText(data.sell_source),
    sell_expected_price: cleanNumber(data.sell_expected_price),
    sell_price: cleanNumberOrNull(data.sell_price),
    points: cleanNumberOrNull(data.points),
    shipping_cost: cleanNumberOrNull(data.shipping_cost),
    fee: cleanNumberOrNull(data.fee),
    memo: cleanText(data.memo),
    status: data.status ?? "ordered",
    sold_date: cleanText(data.sold_date),
  };
}

function validateManagedProduct(payload: ReturnType<typeof sanitizeManagedProduct>) {
  if (!payload.name) {
    throw new Error("商品名は必須です。");
  }

  if (!payload.category) {
    throw new Error("カテゴリは必須です。");
  }

  if (!payload.purchase_date) {
    throw new Error("仕入日は必須です。");
  }

  if (!payload.purchase_source) {
    throw new Error("仕入先は必須です。");
  }
}

function revalidateManagedProductPaths() {
  revalidatePath("/");
  revalidatePath("/products");
}

export async function createManagedProduct(data: Partial<ManagedProduct>) {
  const payload = sanitizeManagedProduct(data);
  validateManagedProduct(payload);

  const { error } = await supabase.from("managed_products").insert([payload]);

  if (error) {
    console.error("[supabase:createManagedProduct]", error);
    throw new Error(error.message);
  }

  revalidateManagedProductPaths();
}

export async function updateManagedProduct(id: string, data: Partial<ManagedProduct>) {
  const payload = sanitizeManagedProduct(data);
  validateManagedProduct(payload);

  const { error } = await supabase.from("managed_products").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateManagedProduct]", error);
    throw new Error(error.message);
  }

  revalidateManagedProductPaths();
}

export async function deleteManagedProduct(id: string) {
  const { error } = await supabase
    .from("managed_products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteManagedProduct]", error);
    throw new Error(error.message);
  }

  revalidateManagedProductPaths();
}

export async function duplicateManagedProduct(id: string) {
  const { data, error } = await supabase.from("managed_products").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateManagedProduct:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase
    .from("managed_products")
    .insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateManagedProduct:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateManagedProductPaths();
}
