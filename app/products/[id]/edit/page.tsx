import { notFound } from "next/navigation";

import { ManagedProductForm } from "@/components/products/ManagedProductForm";
import { getManagedProductById, getManagedProductCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

type EditManagedProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManagedProductPage({ params }: EditManagedProductPageProps) {
  const { id } = await params;
  const [product, collections] = await Promise.all([getManagedProductById(id), getManagedProductCollections()]);

  if (!product) {
    notFound();
  }

  return (
    <ManagedProductForm
      mode="edit"
      product={product}
      suppliers={collections.suppliers}
      buyers={collections.buyers}
      categories={collections.categories}
    />
  );
}
