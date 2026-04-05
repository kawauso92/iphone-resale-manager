import { AppleAccountClient } from "@/components/masters/AppleAccountClient";
import { getAppleAccounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppleAccountsPage() {
  const items = await getAppleAccounts(true);
  return <AppleAccountClient items={items} />;
}
