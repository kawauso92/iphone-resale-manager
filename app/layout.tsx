import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

import "@/app/globals.css";

import { Sidebar } from "@/components/layout/Sidebar";
import { ToasterProvider } from "@/components/providers/ToasterProvider";

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "りんごの管理",
  description: "iPhone転売と汎用商品の仕入れから売却までを一元管理するダッシュボードです。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={notoSansJp.className}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 bg-bgPrimary p-6">{children}</main>
        </div>
        <ToasterProvider />
      </body>
    </html>
  );
}
