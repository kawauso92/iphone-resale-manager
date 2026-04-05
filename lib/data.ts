import { supabase } from "@/lib/supabase";
import { Buyer, Order, PaymentAccount, Product, Supplier } from "@/types";

export const orderSelect = `
  *,
  products(*),
  suppliers(*),
  buyers(*),
  payment_accounts(*)
`;

function handleError(context: string, error: unknown) {
  console.error(`[supabase:${context}]`, {
    error,
    serialized:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : JSON.stringify(error, null, 2),
  });
}

export async function getProducts(includeDeleted = false) {
  let query = supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })
    .order("capacity", { ascending: true, nullsFirst: false })
    .order("color", { ascending: true, nullsFirst: false });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    handleError("getProducts", error);
    return [] as Product[];
  }

  return (data ?? []) as Product[];
}

export async function getSuppliers(includeDeleted = false) {
  let query = supabase.from("suppliers").select("*").order("name", { ascending: true });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    handleError("getSuppliers", error);
    return [] as Supplier[];
  }

  return (data ?? []) as Supplier[];
}

export async function getBuyers(includeDeleted = false) {
  let query = supabase.from("buyers").select("*").order("name", { ascending: true });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    handleError("getBuyers", error);
    return [] as Buyer[];
  }

  return (data ?? []) as Buyer[];
}

export async function getPaymentAccounts(includeDeleted = false) {
  let query = supabase
    .from("payment_accounts")
    .select("*")
    .order("name", { ascending: true });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    handleError("getPaymentAccounts", error);
    return [] as PaymentAccount[];
  }

  return (data ?? []) as PaymentAccount[];
}

export async function getOrders(includeDeleted = false) {
  let query = supabase
    .from("orders")
    .select(orderSelect)
    .order("order_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (!includeDeleted) {
    query = query.is("deleted_at", null);
  }

  const { data, error } = await query;

  if (error) {
    handleError("getOrders", error);
    return [] as Order[];
  }

  return (data ?? []) as Order[];
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", id)
    .single();

  if (error) {
    handleError("getOrderById", error);
    return null;
  }

  return data as Order | null;
}

export async function getMasterCollections() {
  const [products, suppliers, buyers, paymentAccounts] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getBuyers(),
    getPaymentAccounts(),
  ]);

  return {
    products,
    suppliers,
    buyers,
    paymentAccounts,
  };
}

export async function getSoldOrdersByRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("status", "売却済み")
    .is("deleted_at", null)
    .gte("order_date", startDate)
    .lte("order_date", endDate)
    .order("order_date", { ascending: true });

  if (error) {
    handleError("getSoldOrdersByRange", error);
    return [] as Order[];
  }

  return (data ?? []) as Order[];
}
