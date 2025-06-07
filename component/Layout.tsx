import Link from "next/link";
import { ReactNode } from "react";
import logoFull from "@/images/logo-v3-light-bg.png";
import logoMin from "@/images/logo.svg";
import Image from "next/image";
import { CURRENT_TOURNAMENT_ID, CURRENT_TOURNAMENT_NAME } from "@/app/const";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const link = `/tournament/${CURRENT_TOURNAMENT_ID}`;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-brand-light text-black p-4">
        <nav className="container flex justify-between items-center h-80">
          <div className="flex w-full justify-between desktop:justify-center">
            <div className="h-48 flex items-center mr-48">
              <Link href="/">
                <Image
                  src={logoFull}
                  alt="логотип"
                  className="object-cover w-auto h-48 mr-2"
                />
              </Link>
            </div>
            <div className="h-48 flex-1 items-center space-x-20 flex">
              <Link href={link} className="text-l text-primary-base">
                {CURRENT_TOURNAMENT_NAME}
              </Link>
            </div>
            <div className="h-48 flex items-center space-x-20 hidden tablet:flex desktop:flex">
              <Link
                href="https://t.me/+nsoeCj4lNi81Zjg6"
                className="heading-xs text-primary-base"
                target="_blank"
              >
                Хочу с вами!
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
};

export default Layout;
