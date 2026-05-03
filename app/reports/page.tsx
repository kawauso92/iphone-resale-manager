import Link from "next/link";

import { BreakdownBarChart } from "@/components/ui/BreakdownBarChart";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfitLineChart } from "@/components/ui/ProfitLineChart";
import { StatCard } from "@/components/ui/StatCard";
import { calcNetProfit, calcProfitRate } from "@/lib/calculations";
import { REPORT_METRICS } from "@/lib/constants";
import { getOrdersByRange } from "@/lib/data";
import { formatCurrency, formatPercent, toDateInputValue } from "@/lib/format";
import { Order, ReportMetricKey } from "@/types";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatBoundary(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getArrayParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function describeProduct(order: Order) {
  return [order.products?.name, order.products?.capacity, order.products?.color].filter(Boolean).join(" / ");
}

function buildDailyProfitData(orders: Order[], startDate: string, endDate: string) {
  const profitMap = new Map<string, number>();

  orders.forEach((order) => {
    const key = order.order_date ?? "";
    profitMap.set(key, (profitMap.get(key) ?? 0) + calcNetProfit(order));
  });

  const data: Array<{ date: string; profit: number }> = [];
  const cursor = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (cursor <= end) {
    const current = formatBoundary(cursor);
    data.push({
      date: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
      profit: profitMap.get(current) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return data;
}

function buildBreakdown(orders: Order[], getLabel: (order: Order) => string) {
  const map = new Map<string, { label: string; count: number; sales: number; profit: number }>();

  orders.forEach((order) => {
    const label = getLabel(order) || "未設定";
    const current = map.get(label) ?? { label, count: 0, sales: 0, profit: 0 };
    current.count += 1;
    current.sales += order.sale_price;
    current.profit += calcNetProfit(order);
    map.set(label, current);
  });

  return Array.from(map.values()).sort((left, right) => right.profit - left.profit);
}

function buildAppleAccountBreakdown(orders: Order[]) {
  const map = new Map<string, { label: string; count: number; exiled: number; profit: number }>();

  orders.forEach((order) => {
    const label = order.apple_accounts?.email ?? "未設定";
    const current = map.get(label) ?? { label, count: 0, exiled: 0, profit: 0 };
    current.count += 1;
    if (order.status === "島流し") {
      current.exiled += 1;
    }
    if (order.status === "売却済み") {
      current.profit += calcNetProfit(order);
    }
    map.set(label, current);
  });

  return Array.from(map.values()).sort((left, right) => right.profit - left.profit);
}

function BreakdownSection({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; count: number; sales: number; profit: number }>;
}) {
  return (
    <section className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-textSecondary">利益ベースで並べ替えて表示します。</p>
      </div>

      <BreakdownBarChart data={rows.map((row) => ({ label: row.label, value: row.profit }))} />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-bgTertiary/60 text-left text-textSecondary">
            <tr>
              <th className="px-4 py-3">項目</th>
              <th className="px-4 py-3">件数</th>
              <th className="px-4 py-3">売上</th>
              <th className="px-4 py-3">純利益</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border/70 hover:bg-bgTertiary">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                <td className="px-4 py-3">{row.count}</td>
                <td className="px-4 py-3">{formatCurrency(row.sales)}</td>
                <td className="px-4 py-3 text-accent">{formatCurrency(row.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AppleAccountSection({
  rows,
}: {
  rows: Array<{ label: string; count: number; exiled: number; profit: number }>;
}) {
  return (
    <section className="card-base space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Appleアカウント別集計</h2>
        <p className="mt-1 text-sm text-textSecondary">
          注文数、島流し台数、純利益をアカウントごとに表示します。
        </p>
      </div>

      <BreakdownBarChart data={rows.map((row) => ({ label: row.label, value: row.profit }))} />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead className="bg-bgTertiary/60 text-left text-textSecondary">
            <tr>
              <th className="px-4 py-3">Appleアカウント</th>
              <th className="px-4 py-3">注文数</th>
              <th className="px-4 py-3">島流し台数</th>
              <th className="px-4 py-3">純利益</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border/70 hover:bg-bgTertiary">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                <td className="px-4 py-3">{row.count}</td>
                <td className="px-4 py-3">{row.exiled}</td>
                <td className="px-4 py-3 text-accent">{formatCurrency(row.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = (await searchParams) ?? {};
  const today = toDateInputValue();
  const todayDate = new Date(`${today}T00:00:00`);
  const defaultStart = formatBoundary(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
  const defaultEnd = formatBoundary(new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0));

  const startDate = getParam(params, "startDate") || defaultStart;
  const endDate = getParam(params, "endDate") || defaultEnd;
  const selectedMetrics = getArrayParam(params, "metrics") as ReportMetricKey[];
  const shouldRun = getParam(params, "run") === "1";

  const allOrders = shouldRun ? await getOrdersByRange(startDate, endDate) : [];
  const soldOrders = allOrders.filter((order) => order.status === "売却済み");
  const metricsSet = new Set<ReportMetricKey>(
    selectedMetrics.length === 0 ? REPORT_METRICS.map((metric) => metric.key) : selectedMetrics,
  );

  const totalSales = soldOrders.reduce((sum, order) => sum + order.sale_price, 0);
  const totalProfit = soldOrders.reduce((sum, order) => sum + calcNetProfit(order), 0);
  const totalPoints = allOrders.reduce((sum, order) => sum + order.earned_points, 0);
  const totalShipping = soldOrders.reduce((sum, order) => sum + order.shipping_fee, 0);
  const totalCommission = soldOrders.reduce((sum, order) => sum + order.commission, 0);
  const totalOtherExpenses = soldOrders.reduce((sum, order) => sum + order.other_expenses, 0);
  const profitRate = calcProfitRate(totalProfit, totalSales);

  const rotationSource = soldOrders.filter((order) => order.order_date && order.sold_date);
  const averageRotation =
    rotationSource.length > 0
      ? rotationSource.reduce((sum, order) => {
          const start = new Date(`${order.order_date}T00:00:00`).getTime();
          const end = new Date(`${order.sold_date}T00:00:00`).getTime();
          return sum + Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
        }, 0) / rotationSource.length
      : 0;

  const profitTrend = buildDailyProfitData(soldOrders, startDate, endDate);
  const byProduct = buildBreakdown(soldOrders, (order) => describeProduct(order));
  const bySupplier = buildBreakdown(soldOrders, (order) => order.suppliers?.name ?? "未設定");
  const byBuyer = buildBreakdown(soldOrders, (order) => order.buyers?.name ?? "未設定");
  const byPayment = buildBreakdown(soldOrders, (order) => order.payment_accounts?.name ?? "未設定");
  const byAppleAccount = buildAppleAccountBreakdown(allOrders);

  const clearLink = `/reports?run=1&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">月次収支レポート</h1>
        <p className="mt-1 text-sm text-textSecondary">
          注文日ベースで期間を指定し、利益や内訳を確認できます。
        </p>
      </div>

      <form className="card-base space-y-6" action="/reports">
        <input type="hidden" name="run" value="1" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="label-base">開始日（注文日基準）</label>
            <input type="date" name="startDate" defaultValue={startDate} className="field-base" required />
          </div>
          <div className="space-y-2">
            <label className="label-base">終了日（注文日基準）</label>
            <input type="date" name="endDate" defaultValue={endDate} className="field-base" required />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-bgTertiary/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold">集計項目</p>
            <Link href={clearLink} className="text-sm text-accent transition hover:text-accentHover">
              すべて解除
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {REPORT_METRICS.map((metric) => (
              <label
                key={metric.key}
                className="flex items-center gap-3 rounded-lg border border-border bg-bgSecondary px-4 py-3"
              >
                <input
                  type="checkbox"
                  name="metrics"
                  value={metric.key}
                  defaultChecked={metricsSet.has(metric.key)}
                  className="h-4 w-4 rounded border-border bg-bgPrimary"
                />
                <span className="text-sm text-textPrimary">{metric.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="button-primary">
          集計実行
        </button>
      </form>

      {!shouldRun ? (
        <EmptyState
          title="レポートを実行してください"
          description="期間と集計項目を選び、集計実行ボタンで結果を表示します。"
        />
      ) : allOrders.length === 0 ? (
        <EmptyState
          title="対象データがありません"
          description="指定期間の注文が見つかりませんでした。"
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricsSet.has("sales") ? <StatCard label="売上総額" value={formatCurrency(totalSales)} /> : null}
            {metricsSet.has("profit") ? (
              <StatCard
                label="純利益"
                value={formatCurrency(totalProfit)}
                helper={`利益率 ${formatPercent(profitRate)}`}
                accent
              />
            ) : null}
            {metricsSet.has("points") ? (
              <StatCard label="獲得ポイント" value={`${totalPoints.toLocaleString("ja-JP")} pt`} />
            ) : null}
            {metricsSet.has("rotation") ? (
              <StatCard label="平均回転日数" value={`${averageRotation.toFixed(1)}日`} />
            ) : null}
          </div>

          {metricsSet.has("profit") ? (
            <section className="card-base">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">日別純利益</h2>
                <p className="mt-1 text-sm text-textSecondary">集計期間内の純利益推移です。</p>
              </div>
              <ProfitLineChart data={profitTrend} />
            </section>
          ) : null}

          {metricsSet.has("expenses") ? (
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard label="送料合計" value={formatCurrency(totalShipping)} />
              <StatCard label="手数料合計" value={formatCurrency(totalCommission)} />
              <StatCard label="その他経費合計" value={formatCurrency(totalOtherExpenses)} />
            </section>
          ) : null}

          {metricsSet.has("product") ? <BreakdownSection title="商品別集計" rows={byProduct} /> : null}
          {metricsSet.has("supplier") ? <BreakdownSection title="仕入れ先別集計" rows={bySupplier} /> : null}
          {metricsSet.has("buyer") ? <BreakdownSection title="売却先別集計" rows={byBuyer} /> : null}
          {metricsSet.has("payment") ? <BreakdownSection title="決済口座別集計" rows={byPayment} /> : null}
          {metricsSet.has("appleAccount") ? <AppleAccountSection rows={byAppleAccount} /> : null}
        </div>
      )}
    </div>
  );
}
