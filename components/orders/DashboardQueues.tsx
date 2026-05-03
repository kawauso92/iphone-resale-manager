"use client";

import { useState } from "react";

import { formatCurrency, formatDate } from "@/lib/format";
import { Order } from "@/types";

type DashboardQueuesProps = {
  arrivals: Order[];
  storePickups: Order[];
  transfers: Order[];
};

function describeProduct(order: Order) {
  return [order.products?.name, order.products?.capacity, order.products?.color].filter(Boolean).join(" / ");
}

function QueueList({
  title,
  description,
  items,
  limit,
  type,
}: {
  title: string;
  description: string;
  items: Order[];
  limit: number;
  type: "arrival" | "pickup" | "transfer";
}) {
  return (
    <section className="card-base space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-textSecondary">{description}</p>
        </div>
        <span className="rounded-full bg-bgTertiary px-3 py-1 text-xs text-textSecondary">
          {Math.min(items.length, limit)} / {items.length}件
        </span>
      </div>

      <div className="space-y-3">
        {items.slice(0, limit).map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-bgTertiary/40 px-4 py-3"
          >
            <div>
              <p className="font-medium">{describeProduct(order) || " - "}</p>
              <p className="mt-1 text-sm text-textSecondary">
                {type === "transfer"
                  ? order.buyers?.name ?? "販売先未設定"
                  : order.suppliers?.name ?? "仕入れ先未設定"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-textSecondary">
                {type === "transfer" ? formatDate(order.transfer_date) : formatDate(order.delivery_date)}
              </p>
              <p className="mt-1 text-sm font-medium">
                {type === "transfer" ? formatCurrency(order.sale_price) : formatCurrency(order.purchase_price)}
              </p>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-textSecondary">該当データはありません。</p> : null}
      </div>
    </section>
  );
}

export function DashboardQueues({ arrivals, storePickups, transfers }: DashboardQueuesProps) {
  const [limit, setLimit] = useState(10);

  return (
    <div className="space-y-4">
      <div className="card-base flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">予定リスト</h2>
          <p className="mt-1 text-sm text-textSecondary">各セクションの表示件数を切り替えられます。</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-textSecondary">表示件数</label>
          <select className="field-base w-28" value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
            {[10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size}件
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <QueueList
          title="到着予定の商品"
          description="delivery_date が本日以降の注文"
          items={arrivals}
          limit={limit}
          type="arrival"
        />
        <QueueList
          title="店舗受取予定の商品"
          description="店舗系の仕入れ先かつ未入荷の注文"
          items={storePickups}
          limit={limit}
          type="pickup"
        />
        <QueueList
          title="振り込み予定"
          description="transfer_date が未来の売却済み注文"
          items={transfers}
          limit={limit}
          type="transfer"
        />
      </div>
    </div>
  );
}
