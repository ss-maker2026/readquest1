import type { Metadata } from "next";
import { DotGothic16 } from "next/font/google";
import "./globals.css";

const dotGothic16 = DotGothic16({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-dot-gothic-16",
  display: "swap",
});

export const metadata: Metadata = {
  title: "読書クエスト",
  description: "読書を記録しながら、可愛いキャラクターを育てる読書ログアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${dotGothic16.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
