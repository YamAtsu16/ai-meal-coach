import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "./components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI食事管理アプリ",
  description: "AIがあなたの健康的な食生活をサポートします",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Navigation />
        <div className="md:pt-16 pb-16 md:pb-0">
          {children}
        </div>
      </body>
    </html>
  );
}
