import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="card-base flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
      <p className="text-lg font-semibold text-textPrimary">{title}</p>
      <p className="max-w-md text-sm text-textSecondary">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="button-primary mt-2 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
