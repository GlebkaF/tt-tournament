import { Metadata } from "next";
import Link from "next/link";
import thisisus from "@/images/thisisus.jpg";
import banner from "@/images/banner.png";
import Image from "next/image";

const date = new Date().getTime();
const endDate = 1722166190637 + 1000 * 60 * 60 * 24 * 21;
const showBanner = false; // date < endDate;

export default function Home() {
  return (
    <div className="main-container">
      {showBanner ? (
        <div className="hidden sm:block">
          <Link href="/post/summer-finals-announcement-2024">
            <Image
              src={banner}
              alt="Заглушка для фотографии"
              className="object-cover mb-4 w-full"
            />
          </Link>
        </div>
      ) : null}
      <div className="block lg:flex lg:space-x-12">
        {/* Column for Text Content */}
        <div className="flex-1">
          <div className="space-y-4">
            <h1 className="page-title mb-4">
              Настольный теннис. Европейский берег
            </h1>
            <Image
              src={thisisus}
              alt="Заглушка для фотографии"
              className="object-cover mb-4 w-full"
            />
            <p className="text-gray-600">
              Мы — сообщество любителей настольного тенниса в ЖК «Европейский
              Берег». Наш основатель, Женя Шкретов, прекрасно владеет игрой и с
              удовольствием помогает новичкам освоиться и повысить свой уровень.
            </p>
            <p className="text-gray-600">
              Сообщество существует уже три года. В этом году мы проводим третий
              ежегодный летний турнир, участие в котором принимают 42 человека.
              В прошлые годы турнир собирал по 32 и 20 участников.
            </p>
            <p className="text-gray-600">
              Наши мероприятия разнообразны: от длительных летних турниров до
              однодневных соревнований. Летний турнир включает групповую стадию,
              которая длится 10 недель, а в конце лета мы играем финалы в трех
              лигах: «Золотая», «Серебряная» и «Бронзовая». Однодневные турниры
              бывают одиночные и парные.
            </p>
            <p className="text-gray-600">
              Мы ценим свою независимость, но поддерживаем хорошие отношения с
              «ТОС Европейский берег», местными депутатами, управляющей
              компанией и другими спортивными сообществами ЕБ. Победители
              турниров получают грамоты, медали и иногда призы от местных
              заведений.
            </p>
            <p className="text-gray-600">
              Наша сила — в дружелюбной и поддерживающей атмосфере. Мы не только
              играем в теннис, но и регулярно собираемся на различные
              мероприятия и встречи, что помогает укреплять нашу общность. Зимой
              мы не прекращаем играть, находя столы в залах.
            </p>
            <p className="mt-2 text-gray-600">
              Хотите играть с нами? Присоединяйтесь в&nbsp;
              <Link
                href="https://t.me/+nsoeCj4lNi81Zjg6"
                className="text-xl font-semibold text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Напишите в Telegram"
              >
                Telegram
              </Link>
              .
            </p>
          </div>
        </div>
        {/* Column for News Section */}
        <div className="w-full lg:w-1/3 mt-8 lg:mt-0">
          <h2 className="text-2xl font-bold mb-4">Новости</h2>
          <div className="mb-4">
            <div>
              <Link
                href="/post/summer-finals-announcement-2024"
                className="text-xl font-semibold text-blue-500 hover:underline"
                aria-label="Анонс финалов летнего турнира 2024"
              >
                Анонс финалов летнего турнира 2024
              </Link>
              <p className=" text-gray-600">Финалы пройдут 17 и 18 августа</p>
            </div>
          </div>
          <div className="mb-4">
            <div>
              <Link
                href="/post/random-pairs-2024"
                className="text-xl font-semibold text-blue-500 hover:underline"
                aria-label="Результаты второго парного турнира Случайные пары 2024"
              >
                Случайные пары 2024
              </Link>
              <p className=" text-gray-600">
                Результаты второго парного турнира &ldquo;Случайные пары
                2024&rdquo;, который прошел 20 июля 2024 года.
              </p>
            </div>
          </div>
        </div>
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
