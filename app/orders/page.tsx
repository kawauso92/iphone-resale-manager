import { OrdersPageClient } from "@/components/orders/OrdersPageClient";
import { getOrders, getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const [orders, products] = await Promise.all([getOrders(true), getProducts()]);

  return <OrdersPageClient orders={orders} products={products} />;
}
