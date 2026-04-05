import {
  ArrowDownToLine,
  Boxes,
  Coins,
  PackageCheck,
  Plane,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DashboardQueues } from "@/components/orders/DashboardQueues";
import { ProfitLineChart } from "@/components/ui/ProfitLineChart";
import { StatCard } from "@/components/ui/StatCard";
import { calcNetProfit, calcProfitRate } from "@/lib/calculations";
import { STORE_SUPPLIER_NAMES } from "@/lib/constants";
import { getOrders } from "@/lib/data";
import { formatCurrency, formatPercent, toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatMonthBoundary(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const orders = await getOrders();
  const today = toDateInputValue();
  const now = new Date(`${today}T00:00:00`);
  const monthStart = formatMonthBoundary(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = formatMonthBoundary(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const monthlySoldOrders = orders.filter(
    (order) =>
      order.status === "売却済み" &&
      !!order.order_date &&
      order.order_date >= monthStart &&
      order.order_date <= monthEnd,
  );

  const monthlyOrders = orders.filter(
    (order) => !!order.order_date && order.order_date >= monthStart && order.order_date <= monthEnd,
  );

  const monthlySales = monthlySoldOrders.reduce((sum, order) => sum + order.sale_price, 0);
  const monthlyProfit = monthlySoldOrders.reduce((sum, order) => sum + calcNetProfit(order), 0);
  const inventoryOrders = orders.filter((order) => !["売却済み", "キャンセル"].includes(order.status));
  const inventoryValue = inventoryOrders.reduce((sum, order) => sum + order.purchase_price, 0);
  const monthlyPoints = monthlyOrders.reduce((sum, order) => sum + order.earned_points, 0);
  const todayDeliveries = orders.filter((order) => order.delivery_date === today);
  const exiledOrders = orders.filter((order) => order.status === "島流し");
  const exiledValue = exiledOrders.reduce((sum, order) => sum + order.purchase_price, 0);
  const monthlyProfitRate = calcProfitRate(monthlyProfit, monthlySales);

  const arrivals = [...orders]
    .filter((order) => !!order.delivery_date && order.delivery_date >= today)
    .sort((left, right) => (left.delivery_date ?? "").localeCompare(right.delivery_date ?? ""));

  const storePickups = [...orders]
    .filter(
      (order) =>
        order.status === "発注済み" && STORE_SUPPLIER_NAMES.includes(order.suppliers?.name ?? ""),
    )
    .sort((left, right) => (left.delivery_date ?? "").localeCompare(right.delivery_date ?? ""));

  const transfers = [...orders]
    .filter(
      (order) =>
        order.status === "売却済み" && !!order.transfer_date && order.transfer_date > today,
    )
    .sort((left, right) => (left.transfer_date ?? "").localeCompare(right.transfer_date ?? ""));

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const profitByDate = new Map<string, number>();

  monthlySoldOrders.forEach((order) => {
    const key = order.order_date!;
    profitByDate.set(key, (profitByDate.get(key) ?? 0) + calcNetProfit(order));
  });

  const profitChart = Array.from({ length: daysInMonth }, (_, index) => {
    const day = String(index + 1).padStart(2, "0");
    const date = `${monthStart.slice(0, 8)}${day}`;
    return {
      date: `${index + 1}日`,
      profit: profitByDate.get(date) ?? 0,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-textSecondary">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold">トップ</h1>
        <p className="mt-2 text-sm text-textSecondary">月次KPIと今後の予定をまとめて確認できます。</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="今月の売上" value={formatCurrency(monthlySales)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard
          label="今月の純利益"
          value={formatCurrency(monthlyProfit)}
          helper={`利益率 ${formatPercent(monthlyProfitRate)}`}
          accent
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="現在庫資産 / 在庫数"
          value={formatCurrency(inventoryValue)}
          helper={`${inventoryOrders.length} 件`}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          label="今月の獲得ポイント"
          value={`${monthlyPoints.toLocaleString("ja-JP")} pt`}
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          label="本日到着予定"
          value={`${todayDeliveries.length} 件`}
          helper={today}
          icon={<ArrowDownToLine className="h-5 w-5" />}
        />
        <StatCard
          label="島流し"
          value={`${exiledOrders.length} 件`}
          helper={formatCurrency(exiledValue)}
          icon={<Plane className="h-5 w-5" />}
        />
        <StatCard
          label="今月の利益率"
          value={formatPercent(monthlyProfitRate)}
          helper={`${monthStart} 〜 ${monthEnd}`}
          icon={<PackageCheck className="h-5 w-5" />}
        />
      </section>

      <DashboardQueues arrivals={arrivals} storePickups={storePickups} transfers={transfers} />

      <section className="card-base">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">今月の純利益推移</h2>
          <p className="mt-1 text-sm text-textSecondary">日別の純利益を折れ線で表示します。</p>
        </div>
        <ProfitLineChart data={profitChart} />
      </section>
    </div>
  );
}
