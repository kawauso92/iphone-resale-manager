"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createManagedProduct, updateManagedProduct } from "@/app/products/actions";
import { MasterSelect } from "@/components/ui/MasterSelect";
import {
  calcManagedProductDaysHeld,
  calcManagedProductProfit,
  calcManagedProductProfitRate,
  getManagedProductDecision,
} from "@/lib/calculations";
import { MANAGED_PRODUCT_STATUSES } from "@/lib/constants";
import { formatCurrency, formatPercent, toDateInputValue } from "@/lib/format";
import {
  Buyer,
  ManagedProduct,
  ManagedProductFormValues,
  MasterOption,
  ProductCategory,
  Supplier,
} from "@/types";

type ManagedProductFormProps = {
  mode: "create" | "edit";
  product?: ManagedProduct;
  suppliers: Supplier[];
  buyers: Buyer[];
  categories: ProductCategory[];
};

function toNullableNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function createInitialValues(product?: ManagedProduct): ManagedProductFormValues {
  return {
    name: product?.name ?? "",
    category: product?.category ?? "",
    purchase_date: product?.purchase_date ?? toDateInputValue(),
    purchase_source: product?.purchase_source ?? "",
    purchase_price: product?.purchase_price ?? 0,
    sell_source: product?.sell_source ?? "",
    sell_expected_price: product?.sell_expected_price ?? 0,
    sell_price: product?.sell_price ?? null,
    points: product?.points ?? null,
    shipping_cost: product?.shipping_cost ?? null,
    fee: product?.fee ?? null,
    memo: product?.memo ?? "",
    status: product?.status ?? "ordered",
    sold_date: product?.sold_date ?? "",
  };
}

function MoneyField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="label-base">{label}</label>
      <div className="flex items-center rounded-lg border border-border bg-bgTertiary">
        <span className="px-3 text-textSecondary">¥</span>
        <input
          type="number"
          min={0}
          required={required}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(event) => onChange(toNullableNumber(event.target.value))}
          className="flex-1 bg-transparent py-2 pr-3 text-textPrimary outline-none placeholder:text-textSecondary/60"
        />
      </div>
    </div>
  );
}

function toOptions(items: Array<{ id: string; name: string; is_active: boolean }>): MasterOption[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    is_active: item.is_active,
  }));
}

export function ManagedProductForm({
  mode,
  product,
  suppliers,
  buyers,
  categories,
}: ManagedProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ManagedProductFormValues>(() => createInitialValues(product));
  const [supplierOptions, setSupplierOptions] = useState<MasterOption[]>(() => toOptions(suppliers));
  const [buyerOptions, setBuyerOptions] = useState<MasterOption[]>(() => toOptions(buyers));
  const [categoryOptions, setCategoryOptions] = useState<MasterOption[]>(() => toOptions(categories));

  const updateField = <K extends keyof ManagedProductFormValues>(key: K, value: ManagedProductFormValues[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const profit = useMemo(
    () =>
      calcManagedProductProfit({
        sell_price: form.sell_price,
        sell_expected_price: form.sell_expected_price,
        purchase_price: form.purchase_price,
        shipping_cost: form.shipping_cost,
        fee: form.fee,
        points: form.points,
      }),
    [form],
  );

  const profitRate = useMemo(
    () => calcManagedProductProfitRate(profit, form.purchase_price),
    [form.purchase_price, profit],
  );

  const daysHeld = useMemo(
    () => calcManagedProductDaysHeld(form.purchase_date, form.sold_date || null),
    [form.purchase_date, form.sold_date],
  );

  const decision = useMemo(() => getManagedProductDecision(profitRate), [profitRate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createManagedProduct(form);
          toast.success("汎用商品を追加しました。");
        } else if (product?.id) {
          await updateManagedProduct(product.id, form);
          toast.success("汎用商品を更新しました。");
        }

        router.push("/products");
        router.refresh();
      } catch (error) {
        console.error("[managed-product-form]", error);
        toast.error(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card-base space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{mode === "create" ? "汎用商品を追加" : "汎用商品を編集"}</h1>
          <p className="mt-1 text-sm text-textSecondary">iPhone以外の商品を、仕入れから売却まで個別に管理します。</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">基本情報</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="label-base">商品名</label>
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="field-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label-base">カテゴリ</label>
              <MasterSelect
                table="product_categories"
                value={form.category}
                onChange={(value) => updateField("category", value)}
                placeholder="カテゴリを選択"
                options={categoryOptions}
                onOptionsChange={setCategoryOptions}
              />
            </div>
            <div className="space-y-2">
              <label className="label-base">ステータス</label>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value as ManagedProductFormValues["status"])}
                className="field-base"
              >
                {MANAGED_PRODUCT_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">仕入れ情報</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="label-base">仕入日</label>
              <input
                type="date"
                value={form.purchase_date}
                onChange={(event) => updateField("purchase_date", event.target.value)}
                className="field-base"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="label-base">仕入先</label>
              <MasterSelect
                table="suppliers"
                value={form.purchase_source}
                onChange={(value) => updateField("purchase_source", value)}
                placeholder="仕入先を選択"
                options={supplierOptions}
                onOptionsChange={setSupplierOptions}
              />
            </div>
            <MoneyField
              label="仕入価格"
              value={form.purchase_price}
              onChange={(value) => updateField("purchase_price", value ?? 0)}
              required
            />
            <div className="space-y-2">
              <label className="label-base">ポイント</label>
              <input
                type="number"
                min={0}
                value={form.points ?? ""}
                onChange={(event) => updateField("points", toNullableNumber(event.target.value))}
                className="field-base"
                placeholder="0"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">売却情報</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="label-base">売却先</label>
              <MasterSelect
                table="buyers"
                value={form.sell_source}
                onChange={(value) => updateField("sell_source", value)}
                placeholder="売却先を選択"
                options={buyerOptions}
                onOptionsChange={setBuyerOptions}
              />
            </div>
            <div className="space-y-2">
              <label className="label-base">売却日</label>
              <input
                type="date"
                value={form.sold_date}
                onChange={(event) => updateField("sold_date", event.target.value)}
                className="field-base"
              />
            </div>
            <MoneyField
              label="売却予定価格"
              value={form.sell_expected_price}
              onChange={(value) => updateField("sell_expected_price", value ?? 0)}
            />
            <MoneyField
              label="実売価格"
              value={form.sell_price}
              onChange={(value) => updateField("sell_price", value)}
            />
            <MoneyField
              label="送料"
              value={form.shipping_cost}
              onChange={(value) => updateField("shipping_cost", value)}
            />
            <MoneyField label="手数料" value={form.fee} onChange={(value) => updateField("fee", value)} />
          </div>
        </section>

        <section className="space-y-2">
          <label className="label-base">メモ</label>
          <textarea
            value={form.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            className="field-base min-h-28"
            placeholder="補足があれば入力"
          />
        </section>

        <div className="flex gap-3">
          <button type="submit" className="button-primary" disabled={isPending}>
            {mode === "create" ? "作成" : "保存"}
          </button>
          <Link href="/products" className="button-secondary">
            キャンセル
          </Link>
        </div>
      </div>

      <aside className="card-base h-fit space-y-4">
        <div>
          <h2 className="text-lg font-semibold">自動計算</h2>
          <p className="mt-1 text-sm text-textSecondary">入力内容に応じて、利益と判定をリアルタイムで更新します。</p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-textSecondary">純利益</p>
            <p className="mt-1 text-2xl font-semibold text-accent">{formatCurrency(profit)}</p>
          </div>
          <div>
            <p className="text-sm text-textSecondary">利益率</p>
            <p className="mt-1 text-lg font-semibold">{formatPercent(profitRate !== null ? profitRate * 100 : null)}</p>
          </div>
          <div>
            <p className="text-sm text-textSecondary">保有日数</p>
            <p className="mt-1 text-lg font-semibold">{daysHeld === null ? " - " : `${daysHeld}日`}</p>
          </div>
          <div>
            <p className="text-sm text-textSecondary">判定</p>
            <p className="mt-1 text-lg font-semibold uppercase">{decision}</p>
          </div>
        </div>
      </aside>
    </form>
  );
}
