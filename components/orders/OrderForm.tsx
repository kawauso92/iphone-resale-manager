"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createOrder, updateOrder } from "@/app/orders/actions";
import { MasterSelect } from "@/components/ui/MasterSelect";
import { PriceInput } from "@/components/ui/PriceInput";
import { calcCostRate, calcNetProfit, calcProfitRate } from "@/lib/calculations";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency, formatPercent, toDateInputValue } from "@/lib/format";
import { Buyer, MasterOption, Order, OrderFormValues, PaymentAccount, Product, Supplier } from "@/types";

type OrderFormProps = {
  mode: "create" | "edit";
  order?: Order;
  products: Product[];
  suppliers: Supplier[];
  buyers: Buyer[];
  paymentAccounts: PaymentAccount[];
};

function toOrderFormValues(order?: Order): OrderFormValues {
  return {
    product_id: order?.product_id ?? "",
    status: order?.status ?? "発注済み",
    order_date: order?.order_date ?? toDateInputValue(),
    purchase_price: order?.purchase_price ?? 0,
    supplier_id: order?.supplier_id ?? "",
    delivery_date: order?.delivery_date ?? "",
    payment_account_id: order?.payment_account_id ?? "",
    earned_points: order?.earned_points ?? 0,
    serial_number: order?.serial_number ?? "",
    order_number: order?.order_number ?? "",
    buyer_id: order?.buyer_id ?? "",
    sale_price: order?.sale_price ?? 0,
    transfer_date: order?.transfer_date ?? "",
    shipping_fee: order?.shipping_fee ?? 0,
    commission: order?.commission ?? 0,
    other_expenses: order?.other_expenses ?? 0,
    sold_date: order?.sold_date ?? "",
    memo: order?.memo ?? "",
  };
}

function toOptions(items: MasterOption[]) {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    is_active: item.is_active,
  }));
}

export function OrderForm({
  mode,
  order,
  products,
  suppliers,
  buyers,
  paymentAccounts,
}: OrderFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitMode, setSubmitMode] = useState<"default" | "continue">("default");
  const [form, setForm] = useState<OrderFormValues>(() => toOrderFormValues(order));
  const [productOptions, setProductOptions] = useState<MasterOption[]>(() => toOptions(products));
  const [supplierOptions, setSupplierOptions] = useState<MasterOption[]>(() => toOptions(suppliers));
  const [buyerOptions, setBuyerOptions] = useState<MasterOption[]>(() => toOptions(buyers));
  const [paymentOptions, setPaymentOptions] = useState<MasterOption[]>(() => toOptions(paymentAccounts));

  const selectedProduct = useMemo(() => {
    return productOptions.find((item) => item.id === form.product_id)?.name ?? "未選択";
  }, [form.product_id, productOptions]);

  const netProfit = calcNetProfit(form);
  const profitRate = calcProfitRate(netProfit, form.sale_price);
  const costRate = calcCostRate(form.purchase_price, form.sale_price);

  const updateField = <K extends keyof OrderFormValues>(key: K, value: OrderFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.product_id) {
      toast.error("商品を選択してください。");
      return;
    }

    startTransition(async () => {
      try {
        const payload: Partial<Order> = { ...form };

        if (mode === "create") {
          await createOrder(payload);
        } else if (order) {
          await updateOrder(order.id, payload);
        }

        toast.success(mode === "create" ? "商品を登録しました。" : "商品を更新しました。");

        if (mode === "create" && submitMode === "continue") {
          setForm(toOrderFormValues());
          router.refresh();
          return;
        }

        router.push("/orders");
        router.refresh();
      } catch (error) {
        console.error("[order-form:submit]", error);
        toast.error(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="card-base space-y-4">
            <div>
              <h2 className="text-lg font-semibold">基本情報</h2>
              <p className="mt-1 text-sm text-textSecondary">注文の起点となる情報を登録します。</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label-base">商品</label>
                <MasterSelect
                  table="products"
                  value={form.product_id}
                  onChange={(value) => updateField("product_id", value)}
                  placeholder="商品を選択"
                  options={productOptions}
                  onOptionsChange={setProductOptions}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">ステータス</label>
                <select
                  className="field-base"
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value as OrderFormValues["status"])}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-base">注文日</label>
                <input
                  type="date"
                  className="field-base"
                  value={form.order_date}
                  onChange={(event) => updateField("order_date", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card-base space-y-4">
            <div>
              <h2 className="text-lg font-semibold">仕入れ詳細</h2>
              <p className="mt-1 text-sm text-textSecondary">仕入れ先、配送予定、決済情報を管理します。</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label-base">仕入れ価格</label>
                <PriceInput value={form.purchase_price} onChange={(value) => updateField("purchase_price", value)} />
              </div>
              <div className="space-y-2">
                <label className="label-base">仕入れ先</label>
                <MasterSelect
                  table="suppliers"
                  value={form.supplier_id}
                  onChange={(value) => updateField("supplier_id", value)}
                  placeholder="仕入れ先を選択"
                  options={supplierOptions}
                  onOptionsChange={setSupplierOptions}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">配送予定日</label>
                <input
                  type="date"
                  className="field-base"
                  value={form.delivery_date}
                  onChange={(event) => updateField("delivery_date", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">使用カード・口座</label>
                <MasterSelect
                  table="payment_accounts"
                  value={form.payment_account_id}
                  onChange={(value) => updateField("payment_account_id", value)}
                  placeholder="決済口座を選択"
                  options={paymentOptions}
                  onOptionsChange={setPaymentOptions}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">獲得ポイント</label>
                <input
                  type="number"
                  min={0}
                  className="field-base"
                  value={form.earned_points}
                  onChange={(event) => updateField("earned_points", Number(event.target.value || 0))}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">シリアル番号</label>
                <input
                  type="text"
                  className="field-base"
                  value={form.serial_number}
                  onChange={(event) => updateField("serial_number", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">注文番号</label>
                <input
                  type="text"
                  className="field-base"
                  value={form.order_number}
                  onChange={(event) => updateField("order_number", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card-base space-y-4">
            <div>
              <h2 className="text-lg font-semibold">売却・利益</h2>
              <p className="mt-1 text-sm text-textSecondary">売却情報と付随コストを入力します。</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="label-base">売却先</label>
                <MasterSelect
                  table="buyers"
                  value={form.buyer_id}
                  onChange={(value) => updateField("buyer_id", value)}
                  placeholder="売却先を選択"
                  options={buyerOptions}
                  onOptionsChange={setBuyerOptions}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">売却価格</label>
                <PriceInput value={form.sale_price} onChange={(value) => updateField("sale_price", value)} />
              </div>
              <div className="space-y-2">
                <label className="label-base">振込予定日</label>
                <input
                  type="date"
                  className="field-base"
                  value={form.transfer_date}
                  onChange={(event) => updateField("transfer_date", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">売却日</label>
                <input
                  type="date"
                  className="field-base"
                  value={form.sold_date}
                  onChange={(event) => updateField("sold_date", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="label-base">送料</label>
                <PriceInput value={form.shipping_fee} onChange={(value) => updateField("shipping_fee", value)} />
              </div>
              <div className="space-y-2">
                <label className="label-base">手数料</label>
                <PriceInput value={form.commission} onChange={(value) => updateField("commission", value)} />
              </div>
              <div className="space-y-2">
                <label className="label-base">その他経費</label>
                <PriceInput
                  value={form.other_expenses}
                  onChange={(value) => updateField("other_expenses", value)}
                />
              </div>
            </div>
          </section>

          <section className="card-base space-y-4">
            <div>
              <h2 className="text-lg font-semibold">メモ</h2>
              <p className="mt-1 text-sm text-textSecondary">取引上の補足を残せます。</p>
            </div>
            <textarea
              rows={5}
              className="field-base resize-none"
              value={form.memo}
              onChange={(event) => updateField("memo", event.target.value)}
            />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card-base space-y-4">
            <div>
              <p className="text-sm text-textSecondary">選択中の商品</p>
              <h2 className="mt-2 text-xl font-semibold">{selectedProduct}</h2>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-bgTertiary/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary">仕入れ価格</span>
                <span>{formatCurrency(form.purchase_price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary">売却価格</span>
                <span>{formatCurrency(form.sale_price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textSecondary">獲得ポイント</span>
                <span>{form.earned_points.toLocaleString("ja-JP")} pt</span>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-sm text-textSecondary">純利益</p>
                <p className="mt-2 text-3xl font-semibold text-accent">{formatCurrency(netProfit)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-bgSecondary p-3">
                  <p className="text-xs text-textSecondary">利益率</p>
                  <p className="mt-1 text-lg font-semibold">{formatPercent(profitRate)}</p>
                </div>
                <div className="rounded-lg bg-bgSecondary p-3">
                  <p className="text-xs text-textSecondary">原価率</p>
                  <p className="mt-1 text-lg font-semibold">{formatPercent(costRate)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card-base space-y-3">
            <button
              type="submit"
              className="button-primary w-full"
              onClick={() => setSubmitMode("default")}
              disabled={isPending}
            >
              {mode === "create" ? "作成" : "保存"}
            </button>
            {mode === "create" ? (
              <button
                type="submit"
                className="button-secondary w-full"
                onClick={() => setSubmitMode("continue")}
                disabled={isPending}
              >
                保存して続けて作成
              </button>
            ) : null}
            <Link href="/orders" className="button-secondary block w-full text-center">
              キャンセル
            </Link>
          </section>
        </aside>
      </div>
    </form>
  );
}
