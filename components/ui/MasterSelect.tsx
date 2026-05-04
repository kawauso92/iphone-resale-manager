"use client";

import { Plus, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { createInlineMaster } from "@/app/orders/actions";
import { MasterOption, MasterTable } from "@/types";

type MasterSelectProps = {
  table: MasterTable;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: MasterOption[];
  onOptionsChange: (options: MasterOption[]) => void;
};

export function MasterSelect({
  table,
  value,
  onChange,
  placeholder,
  options,
  onOptionsChange,
}: MasterSelectProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeOptions = useMemo(() => {
    return options.filter((option) => option.is_active ?? true);
  }, [options]);

  const handleCreate = () => {
    startTransition(async () => {
      try {
        const created = await createInlineMaster(table, newName);
        const nextOptions = [...options, created].sort((left, right) => left.name.localeCompare(right.name, "ja"));

        onOptionsChange(nextOptions);
        onChange(created.id);
        setNewName("");
        setIsAdding(false);
        toast.success("選択肢を追加しました。");
      } catch (error) {
        console.error("[master-select:create]", error);
        toast.error(error instanceof Error ? error.message : "追加に失敗しました。");
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <select className="field-base" value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">{placeholder}</option>
          {activeOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="button-secondary inline-flex items-center justify-center px-3"
          onClick={() => setIsAdding((current) => !current)}
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      {isAdding ? (
        <div className="rounded-lg border border-dashed border-border bg-bgTertiary/50 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="新しい名称"
              className="field-base"
            />
            <button
              type="button"
              className="button-primary whitespace-nowrap"
              onClick={handleCreate}
              disabled={isPending}
            >
              保存
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
