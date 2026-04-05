import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  accent?: boolean;
};

export function StatCard({ label, value, helper, icon, accent = false }: StatCardProps) {
  return (
    <div className="card-base relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-textSecondary">{label}</p>
          <p className={`mt-3 text-2xl font-semibold ${accent ? "text-accent" : "text-textPrimary"}`}>
            {value}
          </p>
          {helper ? <p className="mt-2 text-sm text-textSecondary">{helper}</p> : null}
        </div>
        {icon ? <div className="rounded-xl bg-bgTertiary p-3 text-accent">{icon}</div> : null}
      </div>
    </div>
  );
}
