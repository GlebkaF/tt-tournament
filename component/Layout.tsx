import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#2F445E] text-white p-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/" className="text-lg ">
              Главная
            </Link>
            <Link href="/matches" className="text-lg">
              Матчи
            </Link>
            <Link href="/standings" className="text-lg">
              Таблица
            </Link>
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
