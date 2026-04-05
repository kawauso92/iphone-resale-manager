import { OrdersPageClient } from "@/components/orders/OrdersPageClient";
import { getOrders, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [ordersResult, productsResult] = await Promise.allSettled([getOrders(true), getProducts()]);
  const orders = ordersResult.status === "fulfilled" ? ordersResult.value : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value : [];

  return <OrdersPageClient orders={orders} products={products} />;
}
