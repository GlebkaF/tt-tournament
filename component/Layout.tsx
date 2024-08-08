import Link from "next/link";
import { ReactNode } from "react";
import logoFull from "@/images/logo-v3-light-bg.png";
import logoMin from "@/images/logo.svg";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#ECF1F8] text-black p-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="h-12 flex items-center">
              <Link href="/" className="text-lg">
                <Image
                  src={logoFull}
                  alt="логотип"
                  className="object-cover w-auto h-12 mr-2 hidden lg:block"
                />
              </Link>
            </div>
            <div className="h-12 flex items-center">
              <Link href="/matches" className="text-lg">
                Матчи
              </Link>
            </div>
            <div className="h-12 flex items-center">
              <Link href="/standings" className="text-lg">
                Таблица
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow px-5">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
