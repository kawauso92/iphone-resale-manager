"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteOrder, duplicateOrder } from "@/app/orders/actions";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_ORDER_COLUMNS, OPTIONAL_ORDER_COLUMNS, ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import { Order, OrdersColumnKey, Product } from "@/types";

type OrdersPageClientProps = {
  orders: Order[];
  products: Product[];
};

type SortDirection = "asc" | "desc";

const columnLabels: Record<OrdersColumnKey, string> = {
  product: "商品",
  status: "ステータス",
  order_date: "注文日",
  purchase_price: "仕入れ価格",
  supplier: "仕入れ先",
  delivery_date: "配送予定",
  payment_account: "使用口座",
  earned_points: "獲得ポイント",
  serial_number: "シリアル番号",
  order_number: "注文番号",
  buyer: "売却先",
  sale_price: "売却価格",
  transfer_date: "振込予定",
  shipping_fee: "送料",
  commission: "手数料",
  other_expenses: "その他経費",
  sold_date: "売却日",
  memo: "メモ",
};

function describeProduct(order: Order) {
  if (!order.products) return " - ";
  return [order.products.name, order.products.capacity, order.products.color, order.products.condition]
    .filter(Boolean)
    .join(" / ");
}

function getSortValue(order: Order, key: OrdersColumnKey): string | number {
  switch (key) {
    case "product":
      return describeProduct(order);
    case "status":
      return order.status;
    case "order_date":
      return order.order_date ?? "";
    case "purchase_price":
      return order.purchase_price;
    case "supplier":
      return order.suppliers?.name ?? "";
    case "delivery_date":
      return order.delivery_date ?? "";
    case "payment_account":
      return order.payment_accounts?.name ?? "";
    case "earned_points":
      return order.earned_points;
    case "serial_number":
      return order.serial_number ?? "";
    case "order_number":
      return order.order_number ?? "";
    case "buyer":
      return order.buyers?.name ?? "";
    case "sale_price":
      return order.sale_price;
    case "transfer_date":
      return order.transfer_date ?? "";
    case "shipping_fee":
      return order.shipping_fee;
    case "commission":
      return order.commission;
    case "other_expenses":
      return order.other_expenses;
    case "sold_date":
      return order.sold_date ?? "";
    case "memo":
      return order.memo ?? "";
    default:
      return "";
  }
}

export function OrdersPageClient({ orders, products }: OrdersPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [productFilter, setProductFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<OrdersColumnKey>("order_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [visibleColumns, setVisibleColumns] = useState<OrdersColumnKey[]>([
    ...DEFAULT_ORDER_COLUMNS,
    ...OPTIONAL_ORDER_COLUMNS.filter((key) => !["serial_number", "order_number", "memo"].includes(key)),
  ]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => (includeDeleted ? true : !order.deleted_at))
      .filter((order) => (statusFilter === "all" ? true : order.status === statusFilter))
      .filter((order) => (productFilter === "all" ? true : order.product_id === productFilter))
      .filter((order) => (dateFrom ? (order.order_date ?? "") >= dateFrom : true))
      .filter((order) => (dateTo ? (order.order_date ?? "") <= dateTo : true))
      .sort((left, right) => {
        const a = getSortValue(left, sortKey);
        const b = getSortValue(right, sortKey);

        if (typeof a === "number" && typeof b === "number") {
          return sortDirection === "asc" ? a - b : b - a;
        }

        return sortDirection === "asc"
          ? String(a).localeCompare(String(b), "ja")
          : String(b).localeCompare(String(a), "ja");
      });
  }, [dateFrom, dateTo, includeDeleted, orders, productFilter, sortDirection, sortKey, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [includeDeleted, statusFilter, productFilter, dateFrom, dateTo, pageSize, sortKey, sortDirection]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleColumn = (column: OrdersColumnKey) => {
    setVisibleColumns((current) =>
      current.includes(column) ? current.filter((item) => item !== column) : [...current, column],
    );
  };

  const handleSort = (column: OrdersColumnKey) => {
    if (sortKey === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column);
    setSortDirection("asc");
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        await duplicateOrder(id);
        toast.success("注文を複製しました。");
      } catch (error) {
        console.error("[orders:duplicate]", error);
        toast.error(error instanceof Error ? error.message : "複製に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("この注文を削除済みにしますか？")) return;

    startTransition(async () => {
      try {
        await deleteOrder(id);
        toast.success("注文を削除しました。");
      } catch (error) {
        console.error("[orders:delete]", error);
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      }
    });
  };

  const renderCell = (order: Order, column: OrdersColumnKey) => {
    switch (column) {
      case "product":
        return (
          <div>
            <div className="font-medium">{describeProduct(order)}</div>
            {order.deleted_at ? <div className="text-xs text-danger">削除済み</div> : null}
          </div>
        );
      case "status":
        return <Badge status={order.status} />;
      case "order_date":
        return formatDate(order.order_date);
      case "purchase_price":
        return formatCurrency(order.purchase_price);
      case "supplier":
        return order.suppliers?.name ?? " - ";
      case "delivery_date":
        return formatDate(order.delivery_date);
      case "payment_account":
        return order.payment_accounts?.name ?? " - ";
      case "earned_points":
        return `${order.earned_points.toLocaleString("ja-JP")} pt`;
      case "serial_number":
        return order.serial_number ?? " - ";
      case "order_number":
        return order.order_number ?? " - ";
      case "buyer":
        return order.buyers?.name ?? " - ";
      case "sale_price":
        return formatCurrency(order.sale_price);
      case "transfer_date":
        return formatDate(order.transfer_date);
      case "shipping_fee":
        return formatCurrency(order.shipping_fee);
      case "commission":
        return formatCurrency(order.commission);
      case "other_expenses":
        return formatCurrency(order.other_expenses);
      case "sold_date":
        return formatDate(order.sold_date);
      case "memo":
        return <span className="inline-block max-w-[240px] truncate align-middle">{order.memo || " - "}</span>;
      default:
        return " - ";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">iPhone管理</h1>
          <p className="mt-1 text-sm text-textSecondary">
            発注から売却までの注文を一覧で管理します。表示件数: {filteredOrders.length}件
          </p>
        </div>
        <Link href="/orders/new" className="button-primary">
          新規作成
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="card-base space-y-5">
          <div className="space-y-2">
            <label className="label-base">削除済みレコード</label>
            <select
              className="field-base"
              value={includeDeleted ? "include" : "exclude"}
              onChange={(event) => setIncludeDeleted(event.target.value === "include")}
            >
              <option value="exclude">除く</option>
              <option value="include">含む</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-base">Status</label>
            <select
              className="field-base"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">全件</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="label-base">Model id</label>
            <select className="field-base" value={productFilter} onChange={(event) => setProductFilter(event.target.value)}>
              <option value="all">全件</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {[product.name, product.capacity, product.color].filter(Boolean).join(" / ")}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="space-y-2">
              <label className="label-base">いつから</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="field-base" />
            </div>
            <div className="space-y-2">
              <label className="label-base">いつまで</label>
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="field-base" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bgTertiary/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">カラム表示</p>
              <span className="text-xs text-textSecondary">{visibleColumns.length}列</span>
            </div>
            <div className="mt-3 grid gap-2">
              {([...DEFAULT_ORDER_COLUMNS, ...OPTIONAL_ORDER_COLUMNS] as OrdersColumnKey[]).map((column) => (
                <label key={column} className="flex items-center gap-3 text-sm text-textPrimary">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column)}
                    onChange={() => toggleColumn(column)}
                    className="h-4 w-4 rounded border-border bg-bgPrimary"
                  />
                  {columnLabels[column]}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="card-base flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-textSecondary">
              並び順: {columnLabels[sortKey]} / {sortDirection === "asc" ? "昇順" : "降順"}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-textSecondary">件数</label>
              <select
                className="field-base w-28"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}件
                  </option>
                ))}
              </select>
            </div>
          </div>

          {paginatedOrders.length === 0 ? (
            <EmptyState
              title="該当する注文がありません"
              description="フィルタ条件を見直すか、新しい注文を作成してください。"
              actionHref="/orders/new"
              actionLabel="注文を追加"
            />
          ) : (
            <>
              <DataTable>
                <table className="min-w-max whitespace-nowrap text-sm">
                  <thead className="border-b border-border bg-bgTertiary/60 text-left text-textSecondary">
                    <tr>
                      {visibleColumns.map((column) => (
                        <th key={column} className="px-4 py-3">
                          <button type="button" onClick={() => handleSort(column)}>
                            {columnLabels[column]}
                          </button>
                        </th>
                      ))}
                      <th className="px-4 py-3">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/70 hover:bg-bgTertiary">
                        {visibleColumns.map((column) => (
                          <td key={column} className="px-4 py-3 align-middle">
                            {renderCell(order, column)}
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="button-secondary px-3 py-1.5 text-xs"
                              onClick={() => handleDuplicate(order.id)}
                              disabled={isPending}
                            >
                              複製
                            </button>
                            <Link href={`/orders/${order.id}/edit`} className="button-secondary px-3 py-1.5 text-xs">
                              編集
                            </Link>
                            {!order.deleted_at ? (
                              <button
                                type="button"
                                className="rounded-lg border border-danger/50 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10"
                                onClick={() => handleDelete(order.id)}
                                disabled={isPending}
                              >
                                削除
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTable>

              <div className="card-base flex items-center justify-between gap-4 text-sm">
                <span className="text-textSecondary">
                  {currentPage} / {totalPages} ページ
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                    disabled={currentPage === 1}
                  >
                    前へ
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                    disabled={currentPage === totalPages}
                  >
                    次へ
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
