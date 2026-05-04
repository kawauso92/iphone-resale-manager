import { ManagedProductForm } from "@/components/products/ManagedProductForm";
import { getManagedProductCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const collections = await getManagedProductCollections();

  return (
    <ManagedProductForm
      mode="create"
      suppliers={collections.suppliers}
      buyers={collections.buyers}
      categories={collections.categories}
    />
  );
}
