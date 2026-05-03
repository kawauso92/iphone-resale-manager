import { OrderForm } from "@/components/orders/OrderForm";
import { getMasterCollections } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  const { products, suppliers, buyers, paymentAccounts, appleAccounts } = await getMasterCollections();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">注文を作成</h1>
        <p className="mt-1 text-sm text-textSecondary">発注から売却までの情報を登録します。</p>
      </div>
      <OrderForm
        mode="create"
        products={products}
        suppliers={suppliers}
        buyers={buyers}
        paymentAccounts={paymentAccounts}
        appleAccounts={appleAccounts}
      />
    </div>
  );
}
