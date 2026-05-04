import { ManagedProductsClient } from "@/components/products/ManagedProductsClient";
import { getManagedProductCollections, getManagedProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, collections] = await Promise.all([getManagedProducts(true), getManagedProductCollections()]);

  return (
    <ManagedProductsClient
      products={products}
      suppliers={collections.suppliers}
      buyers={collections.buyers}
      categories={collections.categories}
    />
  );
}
