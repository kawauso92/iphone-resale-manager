export type OrderStatus = "発注済み" | "入荷済み" | "売却済み" | "キャンセル" | "島流し";

export type ProductCondition = "未開封" | "開封済み" | "傷あり" | "ジャンク";

export type BaseEntity = {
  id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export type Product = BaseEntity & {
  name: string;
  capacity?: string | null;
  color?: string | null;
  condition?: string | null;
};

export type Supplier = BaseEntity & {
  name: string;
  is_active: boolean;
};

export type Buyer = BaseEntity & {
  name: string;
  is_active: boolean;
};

export type PaymentAccount = BaseEntity & {
  name: string;
  is_active: boolean;
};

export type Order = BaseEntity & {
  product_id?: string | null;
  status: OrderStatus;
  order_date?: string | null;
  purchase_price: number;
  supplier_id?: string | null;
  delivery_date?: string | null;
  payment_account_id?: string | null;
  earned_points: number;
  serial_number?: string | null;
  order_number?: string | null;
  buyer_id?: string | null;
  sale_price: number;
  transfer_date?: string | null;
  shipping_fee: number;
  commission: number;
  other_expenses: number;
  sold_date?: string | null;
  memo?: string | null;
  products?: Product | null;
  suppliers?: Supplier | null;
  buyers?: Buyer | null;
  payment_accounts?: PaymentAccount | null;
};

export type MasterTable = "products" | "suppliers" | "buyers" | "payment_accounts";

export type MasterOption = {
  id: string;
  name: string;
  is_active?: boolean;
};

export type OrderFormValues = {
  product_id: string;
  status: OrderStatus;
  order_date: string;
  purchase_price: number;
  supplier_id: string;
  delivery_date: string;
  payment_account_id: string;
  earned_points: number;
  serial_number: string;
  order_number: string;
  buyer_id: string;
  sale_price: number;
  transfer_date: string;
  shipping_fee: number;
  commission: number;
  other_expenses: number;
  sold_date: string;
  memo: string;
};

export type MasterFormState = {
  id?: string;
  name: string;
  is_active: boolean;
};

export type ProductFormState = {
  id?: string;
  name: string;
  capacity: string;
  color: string;
  condition: ProductCondition;
};

export type DashboardProfitPoint = {
  date: string;
  profit: number;
};

export type OrdersColumnKey =
  | "product"
  | "status"
  | "order_date"
  | "purchase_price"
  | "supplier"
  | "delivery_date"
  | "payment_account"
  | "earned_points"
  | "serial_number"
  | "order_number"
  | "buyer"
  | "sale_price"
  | "transfer_date"
  | "shipping_fee"
  | "commission"
  | "other_expenses"
  | "sold_date"
  | "memo";

export type ReportMetricKey =
  | "sales"
  | "profit"
  | "points"
  | "expenses"
  | "rotation"
  | "product"
  | "supplier"
  | "buyer"
  | "payment";
