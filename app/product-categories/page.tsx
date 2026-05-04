import { SimpleMasterClient } from "@/components/masters/SimpleMasterClient";
import { getProductCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductCategoriesPage() {
  const categories = await getProductCategories(true);

  return <SimpleMasterClient type="product-categories" title="カテゴリ" items={categories} />;
}
