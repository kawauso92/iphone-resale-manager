"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteProduct, duplicateProduct, updateProduct } from "@/app/products/actions";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { Product, ProductCondition, ProductFormState } from "@/types";

type ProductMasterClientProps = {
  products: Product[];
};

const conditions: ProductCondition[] = ["未開封", "開封済み", "傷あり", "ジャンク"];

export function ProductMasterClient({ products }: ProductMasterClientProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "capacity" | "color" | "condition">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<ProductFormState | null>(null);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products
      .filter((product) => (showDeleted ? true : !product.deleted_at))
      .filter((product) => {
        if (!keyword) return true;
        return [product.name, product.capacity, product.color, product.condition]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      })
      .sort((left, right) => {
        const a = String(left[sortKey] ?? "");
        const b = String(right[sortKey] ?? "");
        return sortDirection === "asc"
          ? a.localeCompare(b, "ja")
          : b.localeCompare(a, "ja");
      });
  }, [products, search, showDeleted, sortDirection, sortKey]);

  const handleSort = (key: "name" | "capacity" | "color" | "condition") => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleSave = () => {
    if (!editing?.id) return;

    startTransition(async () => {
      try {
        await updateProduct(editing.id!, editing);
        toast.success("商品マスターを更新しました。");
        setEditing(null);
      } catch (error) {
        console.error("[product-master:update]", error);
        toast.error(error instanceof Error ? error.message : "更新に失敗しました。");
      }
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        await duplicateProduct(id);
        toast.success("商品マスターを複製しました。");
      } catch (error) {
        console.error("[product-master:duplicate]", error);
        toast.error(error instanceof Error ? error.message : "複製に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("この商品を削除済みにしますか？")) return;

    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast.success("商品マスターを削除しました。");
        if (editing?.id === id) {
          setEditing(null);
        }
      } catch (error) {
        console.error("[product-master:delete]", error);
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">商品マスター</h1>
          <p className="mt-1 text-sm text-textSecondary">モデル・容量・カラー・状態を管理します。</p>
        </div>
        <Link href="/products/new" className="button-primary">
          新規追加
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="card-base space-y-4">
          <div className="space-y-2">
            <label className="label-base">検索</label>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="field-base"
              placeholder="商品名 / 容量 / カラー / 状態"
            />
          </div>
          <label className="flex items-center gap-3 rounded-lg border border-border bg-bgTertiary/50 px-4 py-3">
            <input
              type="checkbox"
              checked={showDeleted}
              onChange={(event) => setShowDeleted(event.target.checked)}
              className="h-4 w-4 rounded border-border bg-bgPrimary"
            />
            <span className="text-sm text-textPrimary">削除済みを含む</span>
          </label>

          {editing ? (
            <div className="space-y-3 rounded-xl border border-border bg-bgTertiary/50 p-4">
              <div>
                <p className="text-sm font-semibold">編集中</p>
                <p className="mt-1 text-xs text-textSecondary">{editing.name}</p>
              </div>
              <input
                type="text"
                value={editing.name}
                onChange={(event) => setEditing((current) => (current ? { ...current, name: event.target.value } : current))}
                className="field-base"
                placeholder="商品名"
              />
              <input
                type="text"
                value={editing.capacity}
                onChange={(event) =>
                  setEditing((current) => (current ? { ...current, capacity: event.target.value } : current))
                }
                className="field-base"
                placeholder="容量"
              />
              <input
                type="text"
                value={editing.color}
                onChange={(event) =>
                  setEditing((current) => (current ? { ...current, color: event.target.value } : current))
                }
                className="field-base"
                placeholder="カラー"
              />
              <select
                value={editing.condition}
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, condition: event.target.value as ProductCondition } : current,
                  )
                }
                className="field-base"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button type="button" className="button-primary flex-1" onClick={handleSave} disabled={isPending}>
                  保存
                </button>
                <button type="button" className="button-secondary flex-1" onClick={() => setEditing(null)}>
                  閉じる
                </button>
              </div>
            </div>
          ) : null}
        </aside>

        <section className="space-y-4">
          {filteredProducts.length === 0 ? (
            <EmptyState
              title="商品マスターがありません"
              description="検索条件を見直すか、新規追加から商品を登録してください。"
              actionHref="/products/new"
              actionLabel="商品を追加"
            />
          ) : (
            <DataTable>
              <table className="min-w-full whitespace-nowrap text-sm">
                <thead className="border-b border-border bg-bgTertiary/60 text-left text-textSecondary">
                  <tr>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("name")}>
                        商品名
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("capacity")}>
                        容量
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("color")}>
                        カラー
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("condition")}>
                        状態
                      </button>
                    </th>
                    <th className="px-4 py-3">登録日</th>
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border/70 hover:bg-bgTertiary">
                      <td className="px-4 py-3">
                        <div className="font-medium">{product.name}</div>
                        {product.deleted_at ? (
                          <div className="text-xs text-danger">削除済み: {formatDate(product.deleted_at)}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-textSecondary">{product.capacity || " - "}</td>
                      <td className="px-4 py-3 text-textSecondary">{product.color || " - "}</td>
                      <td className="px-4 py-3">{product.condition || " - "}</td>
                      <td className="px-4 py-3 text-textSecondary">{formatDate(product.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="button-secondary px-3 py-1.5 text-xs"
                            onClick={() =>
                              setEditing({
                                id: product.id,
                                name: product.name,
                                capacity: product.capacity ?? "",
                                color: product.color ?? "",
                                condition: (product.condition as ProductCondition) ?? "未開封",
                              })
                            }
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            className="button-secondary px-3 py-1.5 text-xs"
                            onClick={() => handleDuplicate(product.id)}
                            disabled={isPending}
                          >
                            複製
                          </button>
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
                  ))}
                </tbody>
              </table>
            </DataTable>
          )}
        </section>
      </div>
    </div>
  );
}
