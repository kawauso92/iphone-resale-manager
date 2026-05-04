"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { ProductCategory } from "@/types";

function sanitizeProductCategory(data: Partial<ProductCategory>) {
  const name = `${data.name ?? ""}`.trim();
  return {
    name,
    is_active: data.is_active ?? true,
  };
}

function revalidateProductCategoryPaths() {
  revalidatePath("/product-categories");
  revalidatePath("/products");
}

export async function createProductCategory(data: Partial<ProductCategory>) {
  const payload = sanitizeProductCategory(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("product_categories").insert([payload]);

  if (error) {
    console.error("[supabase:createProductCategory]", error);
    throw new Error(error.message);
  }

  revalidateProductCategoryPaths();
}

export async function updateProductCategory(id: string, data: Partial<ProductCategory>) {
  const payload = sanitizeProductCategory(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("product_categories").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateProductCategory]", error);
    throw new Error(error.message);
  }

  revalidateProductCategoryPaths();
}

export async function deleteProductCategory(id: string) {
  const { error } = await supabase
    .from("product_categories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteProductCategory]", error);
    throw new Error(error.message);
  }

  revalidateProductCategoryPaths();
}

export async function duplicateProductCategory(id: string) {
  const { data, error } = await supabase.from("product_categories").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateProductCategory:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("product_categories").insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateProductCategory:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateProductCategoryPaths();
}
