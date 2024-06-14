import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Next.js - Swiper Demo",
  description: "Next.jsを使ったSwiperのデモ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="js">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}