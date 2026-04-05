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
