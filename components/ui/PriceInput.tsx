"use client";

type PriceInputProps = {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
};

export function PriceInput({ value, onChange, placeholder, min = 0 }: PriceInputProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-bgTertiary">
      <span className="px-3 text-textSecondary">¥</span>
      <input
        type="number"
        min={min}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(Number(event.target.value || 0))}
        className="flex-1 bg-transparent py-2 pr-3 text-textPrimary outline-none placeholder:text-textSecondary/60"
      />
    </div>
  );
}
