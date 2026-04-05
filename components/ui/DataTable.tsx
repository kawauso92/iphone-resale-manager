import { ReactNode } from "react";

type DataTableProps = {
  children: ReactNode;
};

export function DataTable({ children }: DataTableProps) {
  return (
    <div className="table-scroll overflow-x-auto rounded-xl border border-border bg-bgSecondary">
      {children}
    </div>
  );
}
