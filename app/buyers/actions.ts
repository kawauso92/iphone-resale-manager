"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { Buyer } from "@/types";

function sanitizeBuyer(data: Partial<Buyer>) {
  const name = `${data.name ?? ""}`.trim();
  return {
    name,
    is_active: data.is_active ?? true,
  };
}

function revalidateBuyerPaths() {
  revalidatePath("/buyers");
  revalidatePath("/orders");
}

export async function createBuyer(data: Partial<Buyer>) {
  const payload = sanitizeBuyer(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("buyers").insert([payload]);

  if (error) {
    console.error("[supabase:createBuyer]", error);
    throw new Error(error.message);
  }

  revalidateBuyerPaths();
}

export async function updateBuyer(id: string, data: Partial<Buyer>) {
  const payload = sanitizeBuyer(data);

  if (!payload.name) {
    throw new Error("名称は必須です。");
  }

  const { error } = await supabase.from("buyers").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateBuyer]", error);
    throw new Error(error.message);
  }

  revalidateBuyerPaths();
}

export async function deleteBuyer(id: string) {
  const { error } = await supabase
    .from("buyers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteBuyer]", error);
    throw new Error(error.message);
  }

  revalidateBuyerPaths();
}

export async function duplicateBuyer(id: string) {
  const { data, error } = await supabase.from("buyers").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateBuyer:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("buyers").insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateBuyer:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateBuyerPaths();
}
