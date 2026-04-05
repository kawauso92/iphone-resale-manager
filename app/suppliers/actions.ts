"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { Supplier } from "@/types";

function sanitizeSupplier(data: Partial<Supplier>) {
  const name = `${data.name ?? ""}`.trim();
  return {
    name,
    is_active: data.is_active ?? true,
  };
}

function revalidateSupplierPaths() {
  revalidatePath("/suppliers");
  revalidatePath("/orders");
}

export async function createSupplier(data: Partial<Supplier>) {
  const payload = sanitizeSupplier(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("suppliers").insert([payload]);

  if (error) {
    console.error("[supabase:createSupplier]", error);
    throw new Error(error.message);
  }

  revalidateSupplierPaths();
}

export async function updateSupplier(id: string, data: Partial<Supplier>) {
  const payload = sanitizeSupplier(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("suppliers").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateSupplier]", error);
    throw new Error(error.message);
  }

  revalidateSupplierPaths();
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteSupplier]", error);
    throw new Error(error.message);
  }

  revalidateSupplierPaths();
}

export async function duplicateSupplier(id: string) {
  const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateSupplier:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("suppliers").insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateSupplier:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateSupplierPaths();
}
