import { ProductMasterClient } from "@/components/masters/ProductMasterClient";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductMasterPage() {
  const products = await getProducts(true);

  return <ProductMasterClient products={products} />;
}
