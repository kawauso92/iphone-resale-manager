"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createAppleAccount } from "@/app/apple-accounts/actions";
import { AppleAccountFormState } from "@/types";

const defaultState: AppleAccountFormState = {
  email: "",
  memo: "",
  is_active: true,
};

export function AppleAccountCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<AppleAccountFormState>(defaultState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createAppleAccount(form);
        toast.success("Appleアカウントを追加しました。");
        router.push("/apple-accounts");
        router.refresh();
      } catch (error) {
        console.error("[apple-account-create-form]", error);
        toast.error(error instanceof Error ? error.message : "作成に失敗しました。");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-base max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Appleアカウントを追加</h1>
        <p className="mt-1 text-sm text-textSecondary">注文時に使用するAppleアカウントを管理します。</p>
      </div>
      <div className="space-y-2">
        <label className="label-base">メールアドレス</label>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="field-base"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="label-base">メモ</label>
        <textarea
          rows={4}
          value={form.memo}
          onChange={(event) => setForm((current) => ({ ...current, memo: event.target.value }))}
          className="field-base resize-none"
        />
      </div>
      <label className="flex items-center gap-3 rounded-lg border border-border bg-bgTertiary/50 px-4 py-3">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
          className="h-4 w-4 rounded border-border bg-bgPrimary"
        />
        <span className="text-sm text-textPrimary">有効にする</span>
      </label>
      <div className="flex gap-3">
        <button type="submit" className="button-primary" disabled={isPending}>
          作成
        </button>
        <Link href="/apple-accounts" className="button-secondary">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
