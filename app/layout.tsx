import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/component/Layout";
import { WebAnalitics } from "@/component/WebAnalitics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Настольный теннис на ЕБ",
  description:
    "Ежегодный летний турнир по настольному теннису. Европейский берег 2024",
  verification: {
    google: "668a84ae7e0f39be",
    yandex: "bb5ce6944d1e3408",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Layout>{children}</Layout>
        <Suspense>
          <WebAnalitics></WebAnalitics>
        </Suspense>
      </body>
    </html>
  );
}
