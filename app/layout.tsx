import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/component/Layout";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Настольный теннис на ЕБ",
  description:
    "Ежегодный летний турнир по настольному теннису. Европейский берег 2024",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Analytics></Analytics>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
