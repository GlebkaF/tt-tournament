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
            <h1 className="heading-l mb-16">
              Настольный теннис. Европейский берег
            </h1>
            <Image
              src={thisisus}
              alt="Заглушка для фотографии"
              className="object-cover mb-12 w-full"
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
                className="heading-xs"
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
        <div className="w-full desktop:w-1/3 mt-8">
          <h2 className="heading-m font-bold mb-24">Новости</h2>
          <div className="flex flex-col gap-12">
            {posts.map((post) => {
              return (
                <div key={post.id}>
                  <Link
                    href={`/post/${post.slug}`}
                    className="text-l"
                    aria-label="Финалы летнего турнира 2024. День 1"
                  >
                    {post.title}
                  </Link>
                  <p className="text-secondary-base">{post.description}</p>
                </div>
              );
            })}
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
