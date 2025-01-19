import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "ginga-ui/style.css";
import "ginga-ui/variables.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gesture Presenter",
  description: "ジェスチャーを用いたスライド操作アプリケーション",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}