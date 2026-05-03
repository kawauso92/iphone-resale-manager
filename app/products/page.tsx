import { ManagedProductsClient } from "@/components/products/ManagedProductsClient";
import { getManagedProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getManagedProducts(true);

  return <ManagedProductsClient products={products} />;
}
