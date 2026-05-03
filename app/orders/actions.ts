"use server";

import { revalidatePath } from "next/cache";

import { supabase } from "@/lib/supabase";
import { MasterOption, MasterTable, Order } from "@/types";

function cleanText(value?: string | null) {
  const text = `${value ?? ""}`.trim();
  return text ? text : null;
}

function cleanNumber(value?: number | null) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? Math.round(numberValue) : 0;
}

function sanitizeOrder(data: Partial<Order>) {
  return {
    product_id: cleanText(data.product_id),
    status: data.status ?? "発注済み",
    order_date: cleanText(data.order_date),
    purchase_price: cleanNumber(data.purchase_price),
    supplier_id: cleanText(data.supplier_id),
    delivery_date: cleanText(data.delivery_date),
    payment_account_id: cleanText(data.payment_account_id),
    apple_account_id: cleanText(data.apple_account_id),
    earned_points: cleanNumber(data.earned_points),
    serial_number: cleanText(data.serial_number),
    order_number: cleanText(data.order_number),
    buyer_id: cleanText(data.buyer_id),
    sale_price: cleanNumber(data.sale_price),
    transfer_date: cleanText(data.transfer_date),
    shipping_fee: cleanNumber(data.shipping_fee),
    commission: cleanNumber(data.commission),
    other_expenses: cleanNumber(data.other_expenses),
    sold_date: cleanText(data.sold_date),
    memo: cleanText(data.memo),
  };
}

function revalidateOrderPaths() {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/reports");
}

export async function createOrder(data: Partial<Order>) {
  const payload = sanitizeOrder(data);
  const { error } = await supabase.from("orders").insert([payload]);

  if (error) {
    console.error("[supabase:createOrder]", error);
    throw new Error(error.message);
  }

  revalidateOrderPaths();
}

export async function updateOrder(id: string, data: Partial<Order>) {
  const payload = sanitizeOrder(data);
  const { error } = await supabase.from("orders").update(payload).eq("id", id);

  if (error) {
    console.error("[supabase:updateOrder]", error);
    throw new Error(error.message);
  }

  revalidateOrderPaths();
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from("orders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[supabase:deleteOrder]", error);
    throw new Error(error.message);
  }

  revalidateOrderPaths();
}

export async function duplicateOrder(id: string) {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

  if (error) {
    console.error("[supabase:duplicateOrder:select]", error);
    throw new Error(error.message);
  }

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, deleted_at: _deletedAt, ...copy } = data;
  const { error: insertError } = await supabase.from("orders").insert([{ ...copy, deleted_at: null }]);

  if (insertError) {
    console.error("[supabase:duplicateOrder:insert]", insertError);
    throw new Error(insertError.message);
  }

  revalidateOrderPaths();
}

export async function createInlineMaster(table: MasterTable, name: string): Promise<MasterOption> {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("名前を入力してください。");
  }

  if (table === "products") {
    const { data, error } = await supabase
      .from("products")
      .insert([{ name: trimmedName, condition: "未開封" }])
      .select("id, name")
      .single();

    if (error) {
      console.error("[supabase:createInlineMaster:products]", error);
      throw new Error(error.message);
    }

    revalidatePath("/product-master");
    revalidatePath("/orders");
    return data as MasterOption;
  }

  if (table === "apple_accounts") {
    const { data, error } = await supabase
      .from("apple_accounts")
      .insert([{ email: trimmedName, is_active: true }])
      .select("id, email, is_active")
      .single();

    if (error) {
      console.error("[supabase:createInlineMaster:apple_accounts]", error);
      throw new Error(error.message);
    }

    revalidatePath("/orders");
    revalidatePath("/apple-accounts");

    return {
      id: data.id,
      name: data.email,
      is_active: data.is_active,
    };
  }

  const { data, error } = await supabase
    .from(table)
    .insert([{ name: trimmedName, is_active: true }])
    .select("id, name, is_active")
    .single();

  if (error) {
    console.error(`[supabase:createInlineMaster:${table}]`, error);
    throw new Error(error.message);
  }

  revalidatePath("/orders");
  revalidatePath(`/${table === "payment_accounts" ? "payment-accounts" : table}`);

  return data as MasterOption;
}
