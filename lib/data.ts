import { supabase } from "@/lib/supabase";
import {
  AppleAccount,
  Buyer,
  ManagedProduct,
  Order,
  PaymentAccount,
  Product,
  Supplier,
} from "@/types";

export const orderSelect = `
  *,
  products(*),
  suppliers(*),
  buyers(*),
  payment_accounts(*),
  apple_accounts(*)
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

function filterDeletedRecords<T extends { deleted_at?: string | null }>(
  records: T[],
  includeDeleted: boolean,
) {
  return includeDeleted ? records : records.filter((record) => !record.deleted_at);
}

export async function getProducts(includeDeleted = false) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true })
    .order("capacity", { ascending: true, nullsFirst: false })
    .order("color", { ascending: true, nullsFirst: false });

  if (error) {
    console.log("[supabase:getProducts:error:raw]", error);
    console.log("[supabase:getProducts:error:details]", {
      type: typeof error,
      constructorName:
        error && typeof error === "object" && "constructor" in error
          ? (error.constructor as { name?: string }).name
          : undefined,
      keys: error && typeof error === "object" ? Object.keys(error) : [],
      ownPropertyNames: error && typeof error === "object" ? Object.getOwnPropertyNames(error) : [],
      entries: error && typeof error === "object" ? Object.entries(error) : [],
      stringified:
        error && typeof error === "object" ? JSON.stringify(error, null, 2) : String(error),
    });
    handleError("getProducts", error);
    return [] as Product[];
  }

  return filterDeletedRecords((data ?? []) as Product[], includeDeleted);
}

export async function getManagedProducts(includeDeleted = false) {
  const { data, error } = await supabase
    .from("managed_products")
    .select("*")
    .order("purchase_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    handleError("getManagedProducts", error);
    return [] as ManagedProduct[];
  }

  return filterDeletedRecords((data ?? []) as ManagedProduct[], includeDeleted);
}

export async function getManagedProductById(id: string) {
  const { data, error } = await supabase
    .from("managed_products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    handleError("getManagedProductById", error);
    return null;
  }

  return data as ManagedProduct | null;
}

export async function getSuppliers(includeDeleted = false) {
  const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true });

  if (error) {
    handleError("getSuppliers", error);
    return [] as Supplier[];
  }

  return filterDeletedRecords((data ?? []) as Supplier[], includeDeleted);
}

export async function getBuyers(includeDeleted = false) {
  const { data, error } = await supabase.from("buyers").select("*").order("name", { ascending: true });

  if (error) {
    handleError("getBuyers", error);
    return [] as Buyer[];
  }

  return filterDeletedRecords((data ?? []) as Buyer[], includeDeleted);
}

export async function getPaymentAccounts(includeDeleted = false) {
  const { data, error } = await supabase
    .from("payment_accounts")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    handleError("getPaymentAccounts", error);
    return [] as PaymentAccount[];
  }

  return filterDeletedRecords((data ?? []) as PaymentAccount[], includeDeleted);
}

export async function getAppleAccounts(includeDeleted = false) {
  const { data, error } = await supabase
    .from("apple_accounts")
    .select("*")
    .order("email", { ascending: true });

  if (error) {
    handleError("getAppleAccounts", error);
    return [] as AppleAccount[];
  }

  return filterDeletedRecords((data ?? []) as AppleAccount[], includeDeleted);
}

export async function getOrders(includeDeleted = false) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("order_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    handleError("getOrders", error);
    return [] as Order[];
  }

  return filterDeletedRecords((data ?? []) as Order[], includeDeleted);
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
  const [products, suppliers, buyers, paymentAccounts, appleAccounts] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getBuyers(),
    getPaymentAccounts(),
    getAppleAccounts(),
  ]);

  return {
    products,
    suppliers,
    buyers,
    paymentAccounts,
    appleAccounts,
  };
}

export async function getOrdersByRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .gte("order_date", startDate)
    .lte("order_date", endDate)
    .order("order_date", { ascending: true });

  if (error) {
    handleError("getOrdersByRange", error);
    return [] as Order[];
  }

  return filterDeletedRecords((data ?? []) as Order[], false);
}

export async function getSoldOrdersByRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("status", "売却済み")
    .gte("order_date", startDate)
    .lte("order_date", endDate)
    .order("order_date", { ascending: true });

  if (error) {
    handleError("getSoldOrdersByRange", error);
    return [] as Order[];
  }

  return filterDeletedRecords((data ?? []) as Order[], false);
}
