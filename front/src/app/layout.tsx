import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "ginga-ui/style.css";
import "ginga-ui/variables.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ボクプレ",
  description: "SecHack365'24 グループ4A: 僕のプレゼンテーション家庭教師",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}