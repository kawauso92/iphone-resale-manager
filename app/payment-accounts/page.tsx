import { SimpleMasterClient } from "@/components/masters/SimpleMasterClient";
import { getPaymentAccounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PaymentAccountsPage() {
  const paymentAccounts = await getPaymentAccounts(true);

  return <SimpleMasterClient type="payment-accounts" title="口座・カード" items={paymentAccounts} />;
}
