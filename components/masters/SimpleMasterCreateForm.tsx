"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createBuyer } from "@/app/buyers/actions";
import { createPaymentAccount } from "@/app/payment-accounts/actions";
import { createProductCategory } from "@/app/product-categories/actions";
import { createSupplier } from "@/app/suppliers/actions";
import { MasterFormState } from "@/types";

type SimpleMasterCreateFormProps = {
  type: "suppliers" | "buyers" | "payment-accounts" | "product-categories";
  title: string;
};

const defaultState: MasterFormState = {
  name: "",
  is_active: true,
};

function routeFor(type: SimpleMasterCreateFormProps["type"]) {
  switch (type) {
    case "payment-accounts":
      return "/payment-accounts";
    case "product-categories":
      return "/product-categories";
    default:
      return `/${type}`;
  }
}

export function SimpleMasterCreateForm({ type, title }: SimpleMasterCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<MasterFormState>(defaultState);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        if (type === "suppliers") {
          await createSupplier(form);
        } else if (type === "buyers") {
          await createBuyer(form);
        } else if (type === "payment-accounts") {
          await createPaymentAccount(form);
        } else {
          await createProductCategory(form);
        }

        toast.success(`${title}を追加しました。`);
        router.push(routeFor(type));
        router.refresh();
      } catch (error) {
        console.error("[simple-master-create-form]", error);
        toast.error(error instanceof Error ? error.message : "保存に失敗しました。");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-base max-w-xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}を追加</h1>
        <p className="mt-1 text-sm text-textSecondary">名称と有効フラグを設定します。</p>
      </div>
      <div className="space-y-2">
        <label className="label-base">名称</label>
        <input
          type="text"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="field-base"
          required
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
          保存
        </button>
        <Link href={routeFor(type)} className="button-secondary">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
