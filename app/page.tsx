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
import {
  calcManagedProductProfit,
  calcNetProfit,
  calcProfitRate,
} from "@/lib/calculations";
import { STORE_SUPPLIER_NAMES } from "@/lib/constants";
import { getManagedProducts, getOrders } from "@/lib/data";
import { formatCurrency, formatPercent, toDateInputValue } from "@/lib/format";

export const dynamic = "force-dynamic";

function formatBoundary(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isBetween(value: string | null | undefined, start: string, end: string) {
  return !!value && value >= start && value <= end;
}

function getManagedSoldReferenceDate(product: {
  sold_date?: string | null;
  purchase_date: string;
}) {
  return product.sold_date || product.purchase_date;
}

export default async function DashboardPage() {
  const [orders, managedProducts] = await Promise.all([getOrders(), getManagedProducts()]);
  const today = toDateInputValue();
  const now = new Date(`${today}T00:00:00`);
  const currentYear = now.getFullYear();
  const monthStart = formatBoundary(new Date(currentYear, now.getMonth(), 1));
  const monthEnd = formatBoundary(new Date(currentYear, now.getMonth() + 1, 0));
  const yearStart = formatBoundary(new Date(currentYear, 0, 1));
  const yearEnd = formatBoundary(new Date(currentYear, 11, 31));

  const monthlySoldOrders = orders.filter(
    (order) =>
      order.status === "売却済み" &&
      isBetween(order.order_date, monthStart, monthEnd),
  );
  const yearlySoldOrders = orders.filter(
    (order) =>
      order.status === "売却済み" &&
      isBetween(order.order_date, yearStart, yearEnd),
  );

  const monthlySoldManagedProducts = managedProducts.filter(
    (product) =>
      product.status === "sold" &&
      isBetween(getManagedSoldReferenceDate(product), monthStart, monthEnd),
  );
  const yearlySoldManagedProducts = managedProducts.filter(
    (product) =>
      product.status === "sold" &&
      isBetween(getManagedSoldReferenceDate(product), yearStart, yearEnd),
  );

  const monthlySales =
    monthlySoldOrders.reduce((sum, order) => sum + order.sale_price, 0) +
    monthlySoldManagedProducts.reduce((sum, product) => sum + (product.sell_price ?? product.sell_expected_price ?? 0), 0);
  const monthlyProfit =
    monthlySoldOrders.reduce((sum, order) => sum + calcNetProfit(order), 0) +
    monthlySoldManagedProducts.reduce((sum, product) => sum + calcManagedProductProfit(product), 0);
  const monthlyProfitRate = calcProfitRate(monthlyProfit, monthlySales);

  const yearlySales =
    yearlySoldOrders.reduce((sum, order) => sum + order.sale_price, 0) +
    yearlySoldManagedProducts.reduce((sum, product) => sum + (product.sell_price ?? product.sell_expected_price ?? 0), 0);
  const yearlyProfit =
    yearlySoldOrders.reduce((sum, order) => sum + calcNetProfit(order), 0) +
    yearlySoldManagedProducts.reduce((sum, product) => sum + calcManagedProductProfit(product), 0);
  const yearlyProfitRate = calcProfitRate(yearlyProfit, yearlySales);

  const inventoryOrders = orders.filter((order) => order.status === "入荷済み");
  const inventoryManagedProducts = managedProducts.filter((product) => product.status === "arrived");
  const inventoryCount = inventoryOrders.length + inventoryManagedProducts.length;
  const inventoryValue =
    inventoryOrders.reduce((sum, order) => sum + order.purchase_price, 0) +
    inventoryManagedProducts.reduce((sum, product) => sum + product.purchase_price, 0);

  const confirmedPoints =
    monthlySoldOrders.reduce((sum, order) => sum + order.earned_points, 0) +
    monthlySoldManagedProducts.reduce((sum, product) => sum + (product.points ?? 0), 0);

  const expectedPoints =
    orders
      .filter((order) => order.status === "発注済み" || order.status === "入荷済み")
      .reduce((sum, order) => sum + order.earned_points, 0) +
    managedProducts
      .filter((product) => product.status === "ordered" || product.status === "arrived")
      .reduce((sum, product) => sum + (product.points ?? 0), 0);

  const yearlyPoints =
    yearlySoldOrders.reduce((sum, order) => sum + order.earned_points, 0) +
    yearlySoldManagedProducts.reduce((sum, product) => sum + (product.points ?? 0), 0);

  const todayDeliveries = orders.filter((order) => order.delivery_date === today);
  const exiledOrders = orders.filter((order) => order.status === "島流し");
  const exiledValue = exiledOrders.reduce((sum, order) => sum + order.purchase_price, 0);

  const arrivals = [...orders]
    .filter((order) => !!order.delivery_date && order.delivery_date >= today)
    .sort((left, right) => (left.delivery_date ?? "").localeCompare(right.delivery_date ?? ""));

  const storePickups = [...orders]
    .filter(
      (order) => order.status === "発注済み" && STORE_SUPPLIER_NAMES.includes(order.suppliers?.name ?? ""),
    )
    .sort((left, right) => (left.delivery_date ?? "").localeCompare(right.delivery_date ?? ""));

  const transfers = [...orders]
    .filter((order) => order.status === "売却済み" && !!order.transfer_date && order.transfer_date > today)
    .sort((left, right) => (left.transfer_date ?? "").localeCompare(right.transfer_date ?? ""));

  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
  const profitByDate = new Map<string, number>();

  monthlySoldOrders.forEach((order) => {
    const key = order.order_date!;
    profitByDate.set(key, (profitByDate.get(key) ?? 0) + calcNetProfit(order));
  });

  monthlySoldManagedProducts.forEach((product) => {
    const key = getManagedSoldReferenceDate(product);
    profitByDate.set(key, (profitByDate.get(key) ?? 0) + calcManagedProductProfit(product));
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
        <p className="mt-2 text-sm text-textSecondary">
          iPhone管理と汎用商品管理を横断して、主要KPIと直近予定を確認できます。
        </p>
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
          helper={`${inventoryCount} 件`}
          icon={<Boxes className="h-5 w-5" />}
        />
        <StatCard
          label="今月の確定ポイント"
          value={`${confirmedPoints.toLocaleString("ja-JP")} pt`}
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          label="見込みポイント"
          value={`${expectedPoints.toLocaleString("ja-JP")} pt`}
          helper="発注済み / 入荷済み"
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

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">{`年間実績（${currentYear}年）`}</h2>
          <p className="mt-1 text-sm text-textSecondary">今年の売上、純利益、利益率、獲得ポイントを集計しています。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="年間売上" value={formatCurrency(yearlySales)} icon={<Wallet className="h-5 w-5" />} />
          <StatCard
            label="年間純利益"
            value={formatCurrency(yearlyProfit)}
            helper={`${yearStart} 〜 ${yearEnd}`}
            accent
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label="年間利益率"
            value={formatPercent(yearlyProfitRate)}
            helper="純利益 / 売上"
            icon={<PackageCheck className="h-5 w-5" />}
          />
          <StatCard
            label="年間獲得ポイント"
            value={`${yearlyPoints.toLocaleString("ja-JP")} pt`}
            icon={<Coins className="h-5 w-5" />}
          />
        </div>
      </section>

      <DashboardQueues arrivals={arrivals} storePickups={storePickups} transfers={transfers} />

      <section className="card-base">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">今月の純利益推移</h2>
          <p className="mt-1 text-sm text-textSecondary">日別の純利益を折れ線グラフで表示します。</p>
        </div>
        <ProfitLineChart data={profitChart} />
      </section>
    </div>
  );
}
