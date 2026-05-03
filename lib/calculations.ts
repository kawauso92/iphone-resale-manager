import { ManagedProduct, ManagedProductDecision } from "@/types";

export function calcNetProfit(order: {
  sale_price: number;
  purchase_price: number;
  shipping_fee: number;
  commission: number;
  other_expenses: number;
}) {
  return (
    order.sale_price -
    order.purchase_price -
    order.shipping_fee -
    order.commission -
    order.other_expenses
  );
}

export function calcProfitRate(netProfit: number, salePrice: number) {
  if (!salePrice) return null;
  return (netProfit / salePrice) * 100;
}

export function calcCostRate(purchasePrice: number, salePrice: number) {
  if (!salePrice) return null;
  return (purchasePrice / salePrice) * 100;
}

export function calcManagedProductProfit(product: Pick<
  ManagedProduct,
  "sell_price" | "sell_expected_price" | "purchase_price" | "shipping_cost" | "fee" | "points"
>) {
  return (
    (product.sell_price ?? product.sell_expected_price ?? 0) -
    product.purchase_price -
    (product.shipping_cost ?? 0) -
    (product.fee ?? 0) +
    (product.points ?? 0)
  );
}

export function calcManagedProductProfitRate(profit: number, purchasePrice: number) {
  if (!purchasePrice) return null;
  return profit / purchasePrice;
}

export function calcManagedProductDaysHeld(
  purchaseDate?: string | null,
  soldDate?: string | null,
  today = new Date(),
) {
  if (!purchaseDate) return null;

  const start = new Date(`${purchaseDate}T00:00:00`);
  const end = soldDate ? new Date(`${soldDate}T00:00:00`) : today;
  const diff = end.getTime() - start.getTime();

  if (Number.isNaN(diff)) {
    return null;
  }

  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function getManagedProductDecision(profitRate: number | null): ManagedProductDecision {
  if (profitRate !== null && profitRate >= 0.1) {
    return "buy";
  }

  if (profitRate !== null && profitRate >= 0.05) {
    return "hold";
  }

  return "skip";
}
