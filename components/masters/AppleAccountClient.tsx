"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  deleteAppleAccount,
  duplicateAppleAccount,
  updateAppleAccount,
} from "@/app/apple-accounts/actions";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/format";
import { AppleAccount, AppleAccountFormState } from "@/types";

type AppleAccountClientProps = {
  items: AppleAccount[];
};

export function AppleAccountClient({ items }: AppleAccountClientProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState<AppleAccountFormState | null>(null);

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items
      .filter((item) => (showDeleted ? true : !item.deleted_at))
      .filter((item) => {
        if (!keyword) return true;
        return [item.email, item.memo].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword));
      })
      .sort((left, right) => left.email.localeCompare(right.email, "ja"));
  }, [items, search, showDeleted]);

  const handleSave = () => {
    if (!editing?.id) return;
    const editingId = editing.id;

    startTransition(async () => {
      try {
        await updateAppleAccount(editingId, editing);
        toast.success("Appleアカウントを更新しました。");
        setEditing(null);
      } catch (error) {
        console.error("[apple-account:update]", error);
        toast.error(error instanceof Error ? error.message : "更新に失敗しました。");
      }
    });
  };

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      try {
        await duplicateAppleAccount(id);
        toast.success("Appleアカウントを複製しました。");
      } catch (error) {
        console.error("[apple-account:duplicate]", error);
        toast.error(error instanceof Error ? error.message : "複製に失敗しました。");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("このAppleアカウントを削除済みにしますか？")) return;

    startTransition(async () => {
      try {
        await deleteAppleAccount(id);
        toast.success("Appleアカウントを削除しました。");
        if (editing?.id === id) {
          setEditing(null);
        }
      } catch (error) {
        console.error("[apple-account:delete]", error);
        toast.error(error instanceof Error ? error.message : "削除に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Appleアカウント</h1>
          <p className="mt-1 text-sm text-textSecondary">メールアドレス単位でAppleアカウントを管理します。</p>
        </div>
        <Link href="/apple-accounts/new" className="button-primary">
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
              placeholder="メールアドレス / メモ"
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
                <p className="mt-1 text-xs text-textSecondary">{editing.email}</p>
              </div>
              <input
                type="email"
                value={editing.email}
                onChange={(event) =>
                  setEditing((current) => (current ? { ...current, email: event.target.value } : current))
                }
                className="field-base"
                placeholder="メールアドレス"
              />
              <textarea
                rows={4}
                value={editing.memo}
                onChange={(event) =>
                  setEditing((current) => (current ? { ...current, memo: event.target.value } : current))
                }
                className="field-base resize-none"
                placeholder="メモ"
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
              title="Appleアカウントがありません"
              description="新規追加からAppleアカウントを登録してください。"
              actionHref="/apple-accounts/new"
              actionLabel="新規追加"
            />
          ) : (
            <DataTable>
              <table className="min-w-full whitespace-nowrap text-sm">
                <thead className="border-b border-border bg-bgTertiary/60 text-left text-textSecondary">
                  <tr>
                    <th className="px-4 py-3">メールアドレス</th>
                    <th className="px-4 py-3">メモ</th>
                    <th className="px-4 py-3">有効</th>
                    <th className="px-4 py-3">登録日</th>
                    <th className="px-4 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-border/70 hover:bg-bgTertiary">
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.email}</div>
                        {item.deleted_at ? (
                          <div className="text-xs text-danger">削除済み: {formatDate(item.deleted_at)}</div>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-textSecondary">{item.memo || " - "}</td>
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
                                email: item.email,
                                memo: item.memo ?? "",
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
