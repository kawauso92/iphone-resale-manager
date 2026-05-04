"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteManagedProduct, duplicateManagedProduct } from "@/app/products/actions";
import {
  calcManagedProductDaysHeld,
  calcManagedProductProfit,
  calcManagedProductProfitRate,
  getManagedProductDecision,
} from "@/lib/calculations";
import { MANAGED_PRODUCT_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { Buyer, ManagedProduct, ProductCategory, Supplier } from "@/types";
import { DataTable } from "../ui/DataTable";
import { EmptyState } from "../ui/EmptyState";
import { ManagedProductDecisionBadge, ManagedProductStatusBadge } from "./ManagedProductBadge";

type ManagedProductsClientProps = {
  products: ManagedProduct[];
  suppliers: Supplier[];
  buyers: Buyer[];
  categories: ProductCategory[];
};

type SortKey =
  | "name"
  | "category"
  | "purchase_price"
  | "sell_expected_price"
  | "sell_price"
  | "profit"
  | "profit_rate"
  | "days_held"
  | "status";

type SortDirection = "asc" | "desc";

function resolveLabel(value: string | null | undefined, items: Array<{ id: string; name: string }>, fallback = " - ") {
  if (!value) return fallback;
  return items.find((item) => item.id === value)?.name ?? value;
}

export function ManagedProductsClient({
  products,
  suppliers,
  buyers,
  categories,
}: ManagedProductsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [purchaseSourceFilter, setPurchaseSourceFilter] = useState("all");
  const [sellSourceFilter, setSellSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ManagedProduct["status"] | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("purchase_price");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const categoryOptions = useMemo(() => categories.map(({ id, name }) => ({ id, name })), [categories]);
  const supplierOptions = useMemo(() => suppliers.map(({ id, name }) => ({ id, name })), [suppliers]);
  const buyerOptions = useMemo(() => buyers.map(({ id, name }) => ({ id, name })), [buyers]);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products
      .filter((product) => (showDeleted ? true : !product.deleted_at))
      .filter((product) => (keyword ? product.name.toLowerCase().includes(keyword) : true))
      .filter((product) =>
        categoryFilter === "all" ? true : resolveLabel(product.category, categoryOptions, "iPhone") === categoryFilter,
      )
      .filter((product) =>
        purchaseSourceFilter === "all"
          ? true
          : resolveLabel(product.purchase_source, supplierOptions) === purchaseSourceFilter,
      )
      .filter((product) =>
        sellSourceFilter === "all" ? true : resolveLabel(product.sell_source, buyerOptions) === sellSourceFilter,
      )
      .filter((product) => (statusFilter === "all" ? true : product.status === statusFilter))
      .filter((product) => (dateFrom ? product.purchase_date >= dateFrom : true))
      .filter((product) => (dateTo ? product.purchase_date <= dateTo : true))
      .sort((left, right) => {
        const leftProfit = calcManagedProductProfit(left);
        const rightProfit = calcManagedProductProfit(right);
        const leftRate = calcManagedProductProfitRate(leftProfit, left.purchase_price) ?? -Infinity;
        const rightRate = calcManagedProductProfitRate(rightProfit, right.purchase_price) ?? -Infinity;
        const leftDays = calcManagedProductDaysHeld(left.purchase_date, left.sold_date) ?? -1;
        const rightDays = calcManagedProductDaysHeld(right.purchase_date, right.sold_date) ?? -1;

        const compareValue = (() => {
          switch (sortKey) {
            case "name":
              return left.name.localeCompare(right.name, "ja");
            case "category":
              return resolveLabel(left.category, categoryOptions, "iPhone").localeCompare(
                resolveLabel(right.category, categoryOptions, "iPhone"),
                "ja",
              );
            case "purchase_price":
              return left.purchase_price - right.purchase_price;
            case "sell_expected_price":
              return left.sell_expected_price - right.sell_expected_price;
            case "sell_price":
              return (left.sell_price ?? -1) - (right.sell_price ?? -1);
            case "profit":
              return leftProfit - rightProfit;
            case "profit_rate":
              return leftRate - rightRate;
            case "days_held":
              return leftDays - rightDays;
            case "status":
              return left.status.localeCompare(right.status, "ja");
            default:
              return 0;
          }
        })();

        return sortDirection === "asc" ? compareValue : compareValue * -1;
      });
  }, [
    products,
    showDeleted,
    search,
    categoryFilter,
    purchaseSourceFilter,
    sellSourceFilter,
    statusFilter,
    dateFrom,
    dateTo,
    sortKey,
    sortDirection,
    categoryOptions,
    supplierOptions,
    buyerOptions,
  ]);

  const categoryNames = useMemo(
    () =>
      Array.from(new Set(products.map((product) => resolveLabel(product.category, categoryOptions, "iPhone")))).sort(
        (a, b) => a.localeCompare(b, "ja"),
      ),
    [products, categoryOptions],
  );

  const purchaseSourceNames = useMemo(
    () =>
      Array.from(new Set(products.map((product) => resolveLabel(product.purchase_source, supplierOptions))))
        .filter((value) => value !== " - ")
        .sort((a, b) => a.localeCompare(b, "ja")),
    [products, supplierOptions],
  );

  const sellSourceNames = useMemo(
    () =>
      Array.from(new Set(products.map((product) => resolveLabel(product.sell_source, buyerOptions))))
        .filter((value) => value !== " - ")
        .sort((a, b) => a.localeCompare(b, "ja")),
    [products, buyerOptions],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "name" || key === "category" || key === "status" ? "asc" : "desc");
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        await duplicateManagedProduct(id);
        toast.success("汎用商品を複製しました。");
      } catch (error) {
        console.error("[managed-products:duplicate]", error);
        toast.error(error instanceof Error ? error.message : "複製に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("この商品を削除済みにしますか？")) return;

    startTransition(async () => {
      try {
        await deleteManagedProduct(id);
        toast.success("汎用商品を削除しました。");
      } catch (error) {
        console.error("[managed-products:delete]", error);
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">汎用商品管理</h1>
          <p className="mt-1 text-sm text-textSecondary">
            iPhoneとは分離して、他ジャンルの商品を仕入れから売却まで管理します。
          </p>
        </div>
        <Link href="/products/new" className="button-primary">
          新規追加
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="card-base space-y-4">
          <div className="space-y-2">
            <label className="label-base">商品名</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field-base"
              placeholder="部分一致で検索"
            />
          </div>
          <div className="space-y-2">
            <label className="label-base">カテゴリ</label>
            <select className="field-base" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">すべて</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-base">仕入先</label>
            <select
              className="field-base"
              value={purchaseSourceFilter}
              onChange={(event) => setPurchaseSourceFilter(event.target.value)}
            >
              <option value="all">すべて</option>
              {purchaseSourceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-base">売却先</label>
            <select className="field-base" value={sellSourceFilter} onChange={(event) => setSellSourceFilter(event.target.value)}>
              <option value="all">すべて</option>
              {sellSourceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-base">ステータス</label>
            <select className="field-base" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="all">すべて</option>
              {MANAGED_PRODUCT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="label-base">仕入日: から</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="field-base" />
            </div>
            <div className="space-y-2">
              <label className="label-base">仕入日: まで</label>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="field-base" />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border bg-bgTertiary/50 px-4 py-3">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(event) => setShowDeleted(event.target.checked)}
              className="h-4 w-4 rounded border-border bg-bgPrimary"
            />
            <span className="text-sm text-textPrimary">削除済みを含める</span>
          </label>
        </aside>

        <section className="space-y-4">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="汎用商品がありません"
              description="フィルタ条件を見直すか、新規追加から商品を登録してください。"
              actionHref="/products/new"
              actionLabel="商品を追加"
            />
          ) : (
            <DataTable>
              <table className="min-w-max whitespace-nowrap text-sm">
                <thead className="border-b border-border bg-bgTertiary/60 text-left text-textSecondary">
                  <tr>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("name")}>
                        商品名
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("category")}>
                        カテゴリ
                      </button>
                    </th>
                    <th className="px-4 py-3">仕入先</th>
                    <th className="px-4 py-3">売却先</th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("purchase_price")}>
                        仕入価格
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("sell_expected_price")}>
                        売却予定価格
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("sell_price")}>
                        実売価格
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("profit")}>
                        利益
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("profit_rate")}>
                        利益率
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("days_held")}>
                        保有日数
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("status")}>
                        ステータス
                      </button>
                    </th>
                    <th className="px-4 py-3">判定</th>
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const profit = calcManagedProductProfit(product);
                    const profitRate = calcManagedProductProfitRate(profit, product.purchase_price);
                    const daysHeld = calcManagedProductDaysHeld(product.purchase_date, product.sold_date);
                    const decision = getManagedProductDecision(profitRate);

                    return (
                      <tr key={product.id} className="border-b border-border/70 hover:bg-bgTertiary">
                        <td className="px-4 py-3">
                          <div className="font-medium">{product.name}</div>
                          <div className="mt-1 text-xs text-textSecondary">仕入日: {formatDate(product.purchase_date)}</div>
                          {product.deleted_at ? <div className="text-xs text-danger">削除済み</div> : null}
                        </td>
                        <td className="px-4 py-3">{resolveLabel(product.category, categoryOptions, "iPhone")}</td>
                        <td className="px-4 py-3">{resolveLabel(product.purchase_source, supplierOptions)}</td>
                        <td className="px-4 py-3">{resolveLabel(product.sell_source, buyerOptions)}</td>
                        <td className="px-4 py-3">{formatCurrency(product.purchase_price)}</td>
                        <td className="px-4 py-3">{formatCurrency(product.sell_expected_price)}</td>
                        <td className="px-4 py-3">{product.sell_price ? formatCurrency(product.sell_price) : " - "}</td>
                        <td className="px-4 py-3 font-medium text-accent">{formatCurrency(profit)}</td>
                        <td className="px-4 py-3">{formatPercent(profitRate !== null ? profitRate * 100 : null)}</td>
                        <td className="px-4 py-3">{daysHeld === null ? " - " : `${daysHeld}日`}</td>
                        <td className="px-4 py-3">
                          <ManagedProductStatusBadge status={product.status} />
                        </td>
                        <td className="px-4 py-3">
                          <ManagedProductDecisionBadge decision={decision} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="button-secondary px-3 py-1.5 text-xs"
                              onClick={() => handleDuplicate(product.id)}
                              disabled={isPending}
                            >
                              複製
                            </button>
                            <Link href={`/products/${product.id}/edit`} className="button-secondary px-3 py-1.5 text-xs">
                              編集
                            </Link>
                            {!product.deleted_at ? (
                              <button
                                type="button"
                                className="rounded-lg border border-danger/50 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10"
                                onClick={() => handleDelete(product.id)}
                                disabled={isPending}
                              >
                                削除
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DataTable>
          )}
        </section>
      </div>
    </div>
  );
}
