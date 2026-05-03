import clsx from "clsx";

import {
  MANAGED_PRODUCT_DECISION_LABELS,
  MANAGED_PRODUCT_STATUS_LABELS,
} from "@/lib/constants";
import { ManagedProductDecision, ManagedProductStatus } from "@/types";

const statusClassMap: Record<ManagedProductStatus, string> = {
  ordered: "bg-slate-600 text-white",
  arrived: "bg-blue-600 text-white",
  sold: "bg-success text-white",
  canceled: "bg-danger text-white",
};

const decisionClassMap: Record<ManagedProductDecision, string> = {
  buy: "bg-success/15 text-success border-success/30",
  hold: "bg-accent/15 text-accent border-accent/30",
  skip: "bg-danger/15 text-danger border-danger/30",
};

export function ManagedProductStatusBadge({ status }: { status: ManagedProductStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        statusClassMap[status],
      )}
    >
      {MANAGED_PRODUCT_STATUS_LABELS[status]}
    </span>
  );
}

export function ManagedProductDecisionBadge({ decision }: { decision: ManagedProductDecision }) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        decisionClassMap[decision],
      )}
    >
      {MANAGED_PRODUCT_DECISION_LABELS[decision]}
    </span>
  );
}
