import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/component/Layout";
import { WebAnalitics } from "@/component/WebAnalitics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Теннис. Евроберег",
  description:
    "Ежегодный летний турнир по настольному теннису. Европейский берег 2025",
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
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>

      <body className={inter.className}>
        <Layout>{children}</Layout>
        <Suspense>
          <WebAnalitics></WebAnalitics>
        </Suspense>
      </body>
    </html>
  );
}
