import clsx from "clsx";

import { OrderStatus } from "@/types";

const statusClassMap: Record<OrderStatus, string> = {
  発注済み: "bg-slate-600 text-white",
  入荷済み: "bg-blue-600 text-white",
  売却済み: "bg-success text-white",
  キャンセル: "bg-danger text-white",
  島流し: "bg-orange-500 text-white",
};

type BadgeProps = {
  status: OrderStatus;
};

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        statusClassMap[status],
      )}
    >
      {status}
    </span>
  );
}
