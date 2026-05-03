import { notFound } from "next/navigation";

import { ManagedProductForm } from "@/components/products/ManagedProductForm";
import { getManagedProductById } from "@/lib/data";

export const dynamic = "force-dynamic";

type EditManagedProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditManagedProductPage({ params }: EditManagedProductPageProps) {
  const { id } = await params;
  const product = await getManagedProductById(id);

  if (!product) {
    notFound();
  }

  return <ManagedProductForm mode="edit" product={product} />;
}
