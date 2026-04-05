import { OrdersColumnKey, OrderStatus, ReportMetricKey } from "@/types";

export const APP_NAME = "りんごの管理";

export const ORDER_STATUSES: OrderStatus[] = [
  "発注済み",
  "入荷済み",
  "売却済み",
  "キャンセル",
  "島流し",
];

export const DEFAULT_ORDER_COLUMNS: OrdersColumnKey[] = [
  "product",
  "status",
  "order_date",
  "purchase_price",
  "supplier",
  "delivery_date",
  "payment_account",
  "buyer",
  "sale_price",
  "transfer_date",
  "sold_date",
];

export const OPTIONAL_ORDER_COLUMNS: OrdersColumnKey[] = [
  "earned_points",
  "shipping_fee",
  "commission",
  "other_expenses",
  "serial_number",
  "order_number",
  "memo",
];

export const STORE_SUPPLIER_NAMES = [
  "アップルストア心斎橋",
  "アップルストア梅田",
  "アップルストア銀座",
];

export const REPORT_METRICS: { key: ReportMetricKey; label: string }[] = [
  { key: "sales", label: "売上総額" },
  { key: "profit", label: "利益・利益率" },
  { key: "points", label: "獲得ポイント" },
  { key: "expenses", label: "経費詳細" },
  { key: "rotation", label: "平均回転日数" },
  { key: "product", label: "商品別" },
  { key: "supplier", label: "仕入れ先別" },
  { key: "buyer", label: "売却先別" },
  { key: "payment", label: "決済口座別" },
];
