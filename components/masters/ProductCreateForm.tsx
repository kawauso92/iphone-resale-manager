"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { createProduct } from "@/app/products/actions";
import { ProductCondition, ProductFormState } from "@/types";

const defaultState: ProductFormState = {
  name: "",
  capacity: "",
  color: "",
  condition: "未開封",
};

const conditions: ProductCondition[] = ["未開封", "開封済み", "傷あり", "ジャンク"];

export function ProductCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<ProductFormState>(defaultState);

  const updateField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        await createProduct(form);
        toast.success("商品マスターを追加しました。");
        router.push("/products");
        router.refresh();
      } catch (error) {
        console.error("[product-create-form]", error);
        toast.error(error instanceof Error ? error.message : "作成に失敗しました。");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card-base max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">商品マスターを追加</h1>
        <p className="mt-1 text-sm text-textSecondary">モデル名、容量、カラー、状態を登録します。</p>
      </div>
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
          <label className="label-base">容量</label>
          <input
            type="text"
            value={form.capacity}
            onChange={(event) => updateField("capacity", event.target.value)}
            className="field-base"
          />
        </div>
        <div className="space-y-2">
          <label className="label-base">カラー</label>
          <input
            type="text"
            value={form.color}
            onChange={(event) => updateField("color", event.target.value)}
            className="field-base"
          />
        </div>
        <div className="space-y-2">
          <label className="label-base">状態</label>
          <select
            value={form.condition}
            onChange={(event) => updateField("condition", event.target.value as ProductCondition)}
            className="field-base"
          >
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="button-primary" disabled={isPending}>
          作成
        </button>
        <Link href="/products" className="button-secondary">
          キャンセル
        </Link>
      </div>
    </form>
  );
}
