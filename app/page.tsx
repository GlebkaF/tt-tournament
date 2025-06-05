import { Metadata } from "next";
import Link from "next/link";
import thisisus from "@/images/thisisus.jpg";

import Image from "next/image";
import createDeps from "@/service/create-deps";

const { postService } = createDeps();

export default async function Home() {
  let posts = await postService.getAllPosts();
  posts = posts.reverse();

  return (
    <div className="container pb-32 pt-24">
      <div className="block desktop:flex desktop:space-x-24">
        {/* Column for Text Content */}
        <div className="flex-1">
          <div className="space-y-4">
            <h1 className="heading-l">Настольный теннис. Европейский берег.</h1>

            <p className="text-gray-600">
              Летний турнир 2025 стартовал третьего июня! Групповая стадия
              продлится 10 недель, а в конце лета состоятся финалы в трех лигах:
              «Золотая», «Серебряная» и «Бронзовая».
            </p>

            <p className="mt-2 text-gray-600">
              Хотите играть с нами? Присоединяйтесь в&nbsp;
              <Link
                href="https://t.me/+nsoeCj4lNi81Zjg6"
                className="heading-xs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Напишите в Telegram"
              >
                Telegram
              </Link>
              .
            </p>
            <br />

            <img
              src="/image/post/summer-finals-2024-day-2/winners.png"
              alt="Победители 2024"
              className="object-fit mb-12 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const title = "Теннис. Евроберег";
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
