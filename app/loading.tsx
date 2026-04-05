export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full border border-border bg-bgSecondary px-5 py-3 text-sm text-textSecondary">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
        データを読み込み中です
      </div>
    </div>
  );
}
