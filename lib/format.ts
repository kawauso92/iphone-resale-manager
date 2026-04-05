export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("ja-JP").format(value || 0);
}

export function formatPercent(value: number | null, digits = 1) {
  if (value === null || Number.isNaN(value)) return " - ";
  return `${value.toFixed(digits)}%`;
}

export function formatDate(value?: string | null) {
  if (!value) return " - ";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function toDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
