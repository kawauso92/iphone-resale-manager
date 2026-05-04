"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteBuyer, duplicateBuyer, updateBuyer } from "@/app/buyers/actions";
import {
  deletePaymentAccount,
  duplicatePaymentAccount,
  updatePaymentAccount,
} from "@/app/payment-accounts/actions";
import {
  deleteProductCategory,
  duplicateProductCategory,
  updateProductCategory,
} from "@/app/product-categories/actions";
import { deleteSupplier, duplicateSupplier, updateSupplier } from "@/app/suppliers/actions";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { Buyer, MasterFormState, PaymentAccount, ProductCategory, Supplier } from "@/types";

type ResourceType = "suppliers" | "buyers" | "payment-accounts" | "product-categories";
type Item = Supplier | Buyer | PaymentAccount | ProductCategory;

type SimpleMasterClientProps = {
  type: ResourceType;
  title: string;
  items: Item[];
};

function routeFor(type: ResourceType) {
  switch (type) {
    case "payment-accounts":
      return "/payment-accounts";
    case "product-categories":
      return "/product-categories";
    default:
      return `/${type}`;
  }
}

export function SimpleMasterClient({ type, title, items }: SimpleMasterClientProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [sortKey, setSortKey] = useState<"name" | "is_active">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<MasterFormState | null>(null);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items
      .filter((item) => (showDeleted ? true : !item.deleted_at))
      .filter((item) => (keyword ? item.name.toLowerCase().includes(keyword) : true))
      .sort((left, right) => {
        if (sortKey === "is_active") {
          return sortDirection === "asc"
            ? Number(right.is_active) - Number(left.is_active)
            : Number(left.is_active) - Number(right.is_active);
        }

        return sortDirection === "asc"
          ? left.name.localeCompare(right.name, "ja")
          : right.name.localeCompare(left.name, "ja");
      });
  }, [items, search, showDeleted, sortDirection, sortKey]);

  const handleSort = (key: "name" | "is_active") => {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  };

  const handleSave = () => {
    if (!editing?.id) return;
    const editingId = editing.id;

    startTransition(async () => {
      try {
        if (type === "suppliers") {
          await updateSupplier(editingId, editing);
        } else if (type === "buyers") {
          await updateBuyer(editingId, editing);
        } else if (type === "payment-accounts") {
          await updatePaymentAccount(editingId, editing);
        } else {
          await updateProductCategory(editingId, editing);
        }

        toast.success(`${title}を更新しました。`);
        setEditing(null);
      } catch (error) {
        console.error("[simple-master:update]", error);
        toast.error(error instanceof Error ? error.message : "更新に失敗しました。");
      }
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        if (type === "suppliers") {
          await duplicateSupplier(id);
        } else if (type === "buyers") {
          await duplicateBuyer(id);
        } else if (type === "payment-accounts") {
          await duplicatePaymentAccount(id);
        } else {
          await duplicateProductCategory(id);
        }

        toast.success(`${title}を複製しました。`);
      } catch (error) {
        console.error("[simple-master:duplicate]", error);
        toast.error(error instanceof Error ? error.message : "複製に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(`この${title}を削除済みにしますか？`)) return;

    startTransition(async () => {
      try {
        if (type === "suppliers") {
          await deleteSupplier(id);
        } else if (type === "buyers") {
          await deleteBuyer(id);
        } else if (type === "payment-accounts") {
          await deletePaymentAccount(id);
        } else {
          await deleteProductCategory(id);
        }

        toast.success(`${title}を削除しました。`);
        if (editing?.id === id) {
          setEditing(null);
        }
      } catch (error) {
        console.error("[simple-master:delete]", error);
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-textSecondary">名称と有効フラグを管理します。</p>
        </div>
        <Link href={`${routeFor(type)}/new`} className="button-primary">
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
              placeholder="名称で検索"
            />
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

          {editing ? (
            <div className="space-y-3 rounded-xl border border-border bg-bgTertiary/50 p-4">
              <div>
                <p className="text-sm font-semibold">編集中</p>
                <p className="mt-1 text-xs text-textSecondary">{editing.name}</p>
              </div>
              <input
                type="text"
                value={editing.name}
                onChange={(event) =>
                  setEditing((current) => (current ? { ...current, name: event.target.value } : current))
                }
                className="field-base"
                placeholder="名称"
              />
              <label className="flex items-center gap-3 rounded-lg border border-border bg-bgSecondary px-4 py-3">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(event) =>
                    setEditing((current) =>
                      current ? { ...current, is_active: event.target.checked } : current,
                    )
                  }
                  className="h-4 w-4 rounded border-border bg-bgPrimary"
                />
                <span className="text-sm text-textPrimary">有効にする</span>
              </label>
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
          {filteredItems.length === 0 ? (
            <EmptyState
              title={`${title}がありません`}
              description="検索条件を見直すか、新規追加から登録してください。"
              actionHref={`${routeFor(type)}/new`}
              actionLabel="新規追加"
            />
          ) : (
            <DataTable>
              <table className="min-w-full whitespace-nowrap text-sm">
                <thead className="border-b border-border bg-bgTertiary/60 text-left text-textSecondary">
                  <tr>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("name")}>
                        名称
                      </button>
                    </th>
                    <th className="px-4 py-3">
                      <button type="button" onClick={() => handleSort("is_active")}>
                        有効
                      </button>
                    </th>
                    <th className="px-4 py-3">作成日</th>
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 hover:bg-bgTertiary">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.name}</div>
                        {item.deleted_at ? (
                          <div className="text-xs text-danger">削除済み: {formatDate(item.deleted_at)}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{item.is_active ? "✅" : " - "}</td>
                      <td className="px-4 py-3 text-textSecondary">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="button-secondary px-3 py-1.5 text-xs"
                            onClick={() =>
                              setEditing({
                                id: item.id,
                                name: item.name,
                                is_active: item.is_active,
                              })
                            }
                          >
                            編集
                          </button>
                          <button
                            type="button"
                            className="button-secondary px-3 py-1.5 text-xs"
                            onClick={() => handleDuplicate(item.id)}
                            disabled={isPending}
                          >
                            複製
                          </button>
                          {!item.deleted_at ? (
                            <button
                              type="button"
                              className="rounded-lg border border-danger/50 px-3 py-1.5 text-xs text-danger transition hover:bg-danger/10"
                              onClick={() => handleDelete(item.id)}
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
