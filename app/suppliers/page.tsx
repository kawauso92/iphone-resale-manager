import { SimpleMasterClient } from "@/components/masters/SimpleMasterClient";
import { getSuppliers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers(true);

  return <SimpleMasterClient type="suppliers" title="仕入れ先" items={suppliers} />;
}
