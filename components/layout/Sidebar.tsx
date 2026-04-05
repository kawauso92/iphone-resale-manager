import Link from "next/link";
import { BarChart3, CreditCard, Home, Package2, ShoppingBag, Store, Users } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const primaryLinks = [
  { href: "/", label: "トップ", icon: Home },
  { href: "/orders", label: "商品管理", icon: Package2 },
];

const masterLinks = [
  { href: "/products", label: "商品マスター", icon: ShoppingBag },
  { href: "/suppliers", label: "仕入れ先", icon: Store },
  { href: "/buyers", label: "販売先", icon: Users },
  { href: "/payment-accounts", label: "口座・カード", icon: CreditCard },
];

export function Sidebar() {
  return (
    <aside className="glass-panel sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-border px-5 py-6">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-accent/15 via-bgSecondary to-bgSecondary p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-textSecondary">Inventory desk</p>
        <h1 className="mt-2 text-2xl font-semibold text-textPrimary">{APP_NAME}</h1>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          {primaryLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-textPrimary transition hover:bg-bgTertiary"
            >
              <Icon className="h-4 w-4 text-accent" />
              {label}
            </Link>
          ))}
        </div>

        <div className="border-t border-border pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-textSecondary">
            マスター設定
          </p>
          <div className="space-y-2">
            {masterLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-textPrimary transition hover:bg-bgTertiary"
              >
                <Icon className="h-4 w-4 text-accent" />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <Link
            href="/reports"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-textPrimary transition hover:bg-bgTertiary"
          >
            <BarChart3 className="h-4 w-4 text-accent" />
            収支レポート
          </Link>
        </div>
      </nav>
    </aside>
  );
}
