"use client";

import Link from "next/link";
import { ReactNode } from "react";
import logoFull from "@/images/logo-v3-light-bg.png";
import Image from "next/image";
import { CURRENT_TOURNAMENT_ID, CURRENT_TOURNAMENT_NAME } from "@/app/const";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const link = `/tournament/${CURRENT_TOURNAMENT_ID}`;

  return (
    <div className="poster-scope flex min-h-screen flex-col bg-poster-paper">
      <header className="sticky top-0 z-20 border-b-[3px] border-poster-ink bg-poster-paper text-poster-ink">
        <nav className="container flex h-80 items-center justify-between gap-16">
          <Link href="/" className="flex shrink-0 items-center no-underline">
            <Image
              src={logoFull}
              alt="логотип"
              className="mr-2 h-48 w-auto object-cover"
            />
          </Link>
          <div className="flex flex-1 items-center gap-16 tablet:gap-24 desktop:gap-24">
            <Link
              href={link}
              className="text-[15px] font-bold uppercase tracking-[0.02em] text-poster-ink no-underline hover:text-poster-clay"
            >
              {CURRENT_TOURNAMENT_NAME}
            </Link>
          </div>
          <Link
            href="https://t.me/+nsoeCj4lNi81Zjg6"
            target="_blank"
            className="hidden shrink-0 border-2 border-poster-ink bg-poster-ink px-12 py-4 caption-s font-semibold uppercase tracking-[0.1em] text-poster-cream no-underline transition-colors hover:bg-poster-clay tablet:block desktop:block"
          >
            Хочу с вами!
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
