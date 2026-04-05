import { SimpleMasterClient } from "@/components/masters/SimpleMasterClient";
import { getBuyers } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function BuyersPage() {
  const buyers = await getBuyers(true);

  return <SimpleMasterClient type="buyers" title="販売先" items={buyers} />;
}
