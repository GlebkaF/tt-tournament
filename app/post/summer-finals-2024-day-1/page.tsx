import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import openingPhoto from "./opening-v2.jpg";
import glebPhoto from "./gleb.jpg";
import bronzeTablePhoto from "./bronze-table.png";
import silverTablePhoto from "./silver-table.png";
import goldTablePhoto from "./gold-table.png";

const title = "Финал летнего турнира 2024. День 1 — Теннис. Евроберег";
const description = "Отчет о первом дне финалов Летнего Турнира 2024 года.";
const url = "https://ebtt.ru/post/summer-finals-2024-day-1";

export const metadata: Metadata = {
  metadataBase: new URL("https://ebtt.ru/"),
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    images: [
      {
        url: openingPhoto.src,
        width: openingPhoto.width,
        height: openingPhoto.height,
        alt: "Фото открытия",
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [
      {
        url: openingPhoto.src,
        width: openingPhoto.width,
        height: openingPhoto.height,
        alt: "Фото открытия",
      },
    ],
  },
  robots: "index, follow",
  alternates: {
    canonical: url,
  },
};

const SummerFinals2024 = () => {
  return (
    <div className="main-container">
      <h1 className="page-title mb-4">Финал летнего турнира 2024. День 1</h1>
      <div className="flex mb-4 justify-between">
        <p className="text-gray-500">Глеб Фокин</p>
        <p className="text-gray-500">17-08-2024</p>
      </div>
      <section className="mb-8">
        <p className="mb-2">
          17 августа 2024 года прошел групповой этап финалов Летнего Турнира
          2024.
        </p>
        <p className="mb-2">
          По результатам{" "}
          <Link
            target="_blank"
            className="font-semibold text-blue-500 hover:underline"
            href="/tournament/1"
          >
            группового этапа
          </Link>{" "}
          мы сформировали три лиги:
        </p>
        <ul className="list-disc ml-8 mb-2">
          <li>Золотую - с 1 по 8 место</li>
          <li>Серебряную - с 9 по 16 место</li>
          <li>Бронзовую - с 17 по 24 место</li>
        </ul>
        <p className="mb-2">
          <Link
            target="_blank"
            className="font-semibold text-blue-500 hover:underline"
            href="/players/16"
          >
            Максим Ефименко
          </Link>{" "}
          по итогам группы занял 16 место, но не смог поучаствовать в финалах
          Серебряной лиги, поэтому на его 8 место в Серебряной лиге мы
          организовали Wild Card соревнование. Поучаствовать в Wild Card мы
          позвали лучших 4 игроков из Бронзовой лиги. Из-за общего сдвига
          турнирной таблицы на 1 позицию вверх, мы также организовали Wild Card
          в Бронзовой лиге.
        </p>
        <p className="mb-2">
          В групповом этапе финала мы разделили всех участников каждой лиги на
          две подгруппы по четыре человека. Каждая подгруппа играла матчи каждый
          с каждым за выход в полуфинал.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Регламент</h2>
        <ul className="list-disc ml-8 mb-2">
          <li>Правила ITTF</li>
          <li>Играем до трех побед</li>
          <li>Пауза между партиями — 1 минута</li>
          <li>Во время матча можно взять тайм-аут на 1 минуту</li>
          <li>Первая разминка — 7 минут, повторные разминки — 3 минуты</li>
          <li>Судейство — средне-строгое</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Wild Card</h2>
        <p className="mb-2">
          Разыгрывать Wild Card начали в половину десятого утра, но игры
          несколько раз откладывали из-за дождя. В итоге четыре матча играли
          почти два часа.
        </p>
        <p className="mb-2">
          К участию в Wild Card за 8 место в Серебряной лиге заявились только
          двое участников из возможных, результаты:
        </p>
        <ul className="list-disc ml-8 mb-2">
          <li>
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/30"
            >
              Тамбовцева
            </Link>{" "}
            <strong>3</strong> — 2{" "}
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/9"
            >
              Назимов
            </Link>
          </li>
        </ul>
        <p className="mb-2">
          За 8 место в Серебряной лиге сражались все четверо, играли на
          выбывание, результаты:
        </p>
        <ul className="list-disc ml-8 mb-2">
          <li>
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/23"
            >
              Катренко
            </Link>{" "}
            <strong>3</strong> — 0{" "}
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/29"
            >
              Соболев
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/24"
            >
              Козюрин
            </Link>{" "}
            <strong>3</strong> — 0{" "}
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/27"
            >
              Рыжкова
            </Link>
          </li>
          <li>
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/23"
            >
              Катренко
            </Link>{" "}
            <strong>3</strong> — 0{" "}
            <Link
              target="_blank"
              className="font-semibold text-blue-500 hover:underline"
              href="/players/24"
            >
              Козюрин
            </Link>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Церемония открытия</h2>
        <p className="mb-2">
          После того как определился состав участников всех трех лиг, прошла
          церемония открытия финалов. Женя Шкретов и Наталья Зайцева сказали
          речь, мы сфотографировались и начали играть.
        </p>
        <Image src={openingPhoto} alt="Фото открытия" className="mb-4" />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Бронзовая лига</h2>
        <p className="mb-2">
          В группе А была дикая заруба, в результате которой трое игроков вышли
          с равным количеством очков. Итоговые места считали по правилам{" "}
          <Link
            target="_blank"
            className="font-semibold text-blue-500 hover:underline"
            href="http://www.rustt.ru/b/fils/0/2021-table-tennis-rules.pdf"
          >
            ITTF, страница 59
          </Link>
          . По соотношению побед/поражений в полуфинал вышли Костя Назимов и
          Виталий Хомич.
        </p>
        <p className="mb-2">
          В группе Б ситуация была более спокойная. Максим Егоров и Никита
          Рабчевский не смогли набрать свои очки, и в финал вышли Дима Гондюхин
          и Коля Соловьев.
        </p>
        <p className="mb-2">
          Игры Бронзовой лиги мы играли два с половиной часа, в процессе все
          время было пасмурно, иногда шел небольшой дождь.
        </p>
        <h3 className="text-xl font-semibold mb-4">Результаты</h3>
        <ul className="list-disc ml-8 mb-2">
          <li>Группа А</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/9"
              >
                Назимов
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/26"
              >
                Хомич
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/15"
              >
                Рогозин
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/23"
              >
                Катренко
              </Link>
              , 0 очков
            </li>
          </ul>
          <li>Группа Б</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/18"
              >
                Соловьев
              </Link>
              , 3 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/20"
              >
                Гондюхин
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/19"
              >
                Егоров
              </Link>
              , 0 очков
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/21"
              >
                Рабчевский
              </Link>
              , 0 очков
            </li>
          </ul>
        </ul>
        <Image
          src={bronzeTablePhoto}
          alt="Таблица Бронзовой лиги"
          className="mb-4"
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Серебряная лига</h2>
        <p className="mb-2">
          Серебряная лига по составу участников получилась очень однородной —
          уровень всех игроков был практически одинаковый и казался самой
          непредсказуемой. На деле игры прошли относительно спокойно. В группе А
          Илья Исаев и Артем Шаламов уверенно забрали свои победы и вышли в
          полуфинал. В группе Б накал страстей был чуть выше, и в финальной игре
          &ldquo;Боженов - Ачкасов&rdquo; за второе место в группе со счетом 3-2
          победил Вадим Боженов.
        </p>
        <p className="mb-2">
          Группы Серебряной лиги играли два часа пятнадцать минут; в процессе
          светило солнышко, был небольшой ветер.
        </p>
        <h3 className="text-xl font-semibold mb-4">Результаты</h3>
        <ul className="list-disc ml-8 mb-2">
          <li>Группа А</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/28"
              >
                Исаев
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/6"
              >
                Шаламов
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/17"
              >
                Герасимов
              </Link>
              , 1 очко
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/30"
              >
                Тамбовцева
              </Link>
              , 0 очков
            </li>
          </ul>
          <li>Группа Б</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/13"
              >
                Ролдугин
              </Link>
              , 3 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/35"
              >
                Боженов
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/14"
              >
                Ачкасов
              </Link>
              , 1 очко
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/10"
              >
                Шестернин
              </Link>
              , 0 очков
            </li>
          </ul>
        </ul>
        <Image
          src={silverTablePhoto}
          alt="Таблица Серебряной лиги"
          className="mb-4"
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Золотая лига</h2>
        <p className="mb-2">
          В группе А Золотой лиги, как и в Бронзовой, три участника набрали по 2
          очка, и итоговые места распределялись исходя из соотношения побед и
          поражений в сыгранных между собой партиях. В результате в полуфинал
          прошли Женя Шкретов и Наталья Зайцева. Примечательной была последняя
          игра в группе между Фокиным и Зайцевой: для Наташи это фактически была
          игра за второе место в группе, а для Глеба — битва за респект 😎.
        </p>
        <p className="mb-2">
          В группе Б Роман Аникин уверенно забрал все свои игры и вышел с
          первого места. Самая напряженная игра для Ромы была с Викой: он
          выигрывал 2:0, но третью победу смог забрать только в пятой партии.
          Емельянова и Тимочкин играли матч за 2 место, в итоге победу забрала
          Вика.
        </p>
        <p className="mb-2">
          Разминка Золотой лиги началась с резкого, порывистого ветра. Участники
          обсуждали перенос игр, но все-таки решили играть как есть. Во время
          игр ветер утих, и игры прошли более-менее нормально.
        </p>
        <p className="mb-2">
          Группы Золотой лиги играли два часа двадцать минут.
        </p>

        <h3 className="text-xl font-semibold mb-4">Результаты</h3>
        <ul className="list-disc ml-8 mb-2">
          <li>Группа А</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/8"
              >
                Шкретов
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/4"
              >
                Зайцева
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/1"
              >
                Михалевич
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/7"
              >
                Фокин
              </Link>
              , 0 очков
            </li>
          </ul>
          <li>Группа Б</li>
          <ul className="list-decimal ml-8 mb-2">
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/11"
              >
                Аникин
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/2"
              >
                Емельянова
              </Link>
              , 2 очка
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/3"
              >
                Тимочкин
              </Link>
              , 1 очко
            </li>
            <li>
              <Link
                target="_blank"
                className="font-semibold text-blue-500 hover:underline"
                href="/players/5"
              >
                Куртеков
              </Link>
              , 0 очков
            </li>
          </ul>
        </ul>
        <Image
          src={goldTablePhoto}
          alt="Таблица Золотой лиги"
          className="mb-4"
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Итого</h2>
        <p className="mb-2">
          Этот день задумывался организаторами как праздник тенниса, и так оно и
          получилось.
        </p>
        <p className="mb-2">Завтра этот праздник продолжится 🎉</p>
        <Image
          src={glebPhoto}
          alt="Глеб"
          className="mb-4 h-[600px] object-cover"
        />
      </section>
    </div>
  );
};

export default SummerFinals2024;
