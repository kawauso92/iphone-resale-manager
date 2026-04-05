import { notFound } from "next/navigation";

import { OrderForm } from "@/components/orders/OrderForm";
import { getMasterCollections, getOrderById } from "@/lib/data";

export const dynamic = "force-dynamic";

type EditOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;
  const [order, collections] = await Promise.all([getOrderById(id), getMasterCollections()]);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">商品を編集</h1>
        <p className="mt-1 text-sm text-textSecondary">登録済み案件の内容を更新します。</p>
      </div>
      <OrderForm
        mode="edit"
        order={order}
        products={collections.products}
        suppliers={collections.suppliers}
        buyers={collections.buyers}
        paymentAccounts={collections.paymentAccounts}
        appleAccounts={collections.appleAccounts}
      />
    </div>
  );
}
