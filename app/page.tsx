import { Metadata } from "next";
import Link from "next/link";
import logo from "./logo.svg";
import Image from "next/image";
export default function Home() {
  return (
    <div className="container mx-auto py-5">
      <h1 className="text-3xl font-bold mb-4">
        <Image
          src={logo}
          alt="Логотип"
          width={70}
          height={70}
          className="inline-block"
        />
        Настольной теннис. Европейский берег
      </h1>

      <div className="mb-8">
        <p className="mt-2 text-gray-600">
          Хотите играть с нами? Присоединяйтесь в&nbsp;
          <Link
            href="https://t.me/+nsoeCj4lNi81Zjg6"
            className="text-xl font-semibold text-blue-500 hover:underline"
            target="_blank" // чтобы открывать ссылку в новом окне
            rel="noopener noreferrer" // для безопасности
            aria-label="Напишите в Telegram"
          >
            Telegram
          </Link>
          .
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Новости</h2>

      <div className="space-y-8">
        <div>
          <Link
            href="/post/random-pairs-2024"
            className="text-xl font-semibold text-blue-500 hover:underline"
            aria-label="Результаты второго парного турнира Случайные пары 2024"
          >
            Случайные пары 2024
          </Link>
          <p className="mt-2 text-gray-600">
            Результаты второго парного турнира &ldquo;Случайные пары
            2024&rdquo;, который прошел 20 июля 2024 года.
          </p>
        </div>
        {/* Вы можете добавлять больше новостей здесь */}
      </div>
    </div>
  );
}

const title = "Настольный теннис. Европейский Берег";
const description =
  "Играем в настольный теннис на набережной Европейского Берега. Ежегодный летний турнир, ситуационные турниры.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://ebtt.com",
    type: "website",
  },
};
