"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

function cleanText(value?: string | null) {
  const text = `${value ?? ""}`.trim();
  return text ? text : null;
}

function sanitizeProduct(data: Partial<Product>) {
  return {
    name: `${data.name ?? ""}`.trim(),
    capacity: cleanText(data.capacity),
    color: cleanText(data.color),
    condition: cleanText(data.condition),
  };
}

function revalidateProductPaths() {
  revalidatePath("/products");
  revalidatePath("/orders");
}

export async function createProduct(data: Partial<Product>) {
  const payload = sanitizeProduct(data);

  if (!payload.name) {
    throw new Error("商品名は必須です。");
  }

  const { error } = await supabase.from("products").insert([payload]);

  if (error) {
    console.error("[supabase:createProduct]", error);
    throw new Error(error.message);
  }

  revalidateProductPaths();
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const payload = sanitizeProduct(data);

  if (!payload.name) {
    throw new Error("商品名は必須です。");
  }

  const { error } = await supabase.from("products").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateProduct]", error);
    throw new Error(error.message);
  }

  revalidateProductPaths();
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteProduct]", error);
    throw new Error(error.message);
  }

  revalidateProductPaths();
}

export async function duplicateProduct(id: string) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateProduct:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("products").insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateProduct:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateProductPaths();
}
