import { Metadata } from "next";
import Image from "next/image";
import finalsPhoto from "./finals.png";

const title = "Финалы летнего турнира по настольному теннису 2024";
const description =
  "Приглашаем всех на финалы летнего турнира по настольному теннису Европейского Берега, которые пройдут 17 и 18 августа 2024 года.";
const url = "https://ebtt.ru/post/summer-finals-2024";

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
        url: finalsPhoto.src,
        width: finalsPhoto.width,
        height: finalsPhoto.height,
        alt: "Фото",
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [
      {
        url: finalsPhoto.src,
        width: finalsPhoto.width,
        height: finalsPhoto.height,
        alt: "Фото",
      },
    ],
  },
  robots: "index, follow",
  alternates: {
    canonical: url,
  },
};

const SummerFinalsAnnouncement2024 = () => {
  return (
    <div className="main-container">
      <h1 className="page-title mb-4">
        Финалы летнего турнира по настольному теннису 2024
      </h1>
      <div className="flex mb-4 justify-between">
        <p className="text-gray-500">Глеб Фокин</p>
        <p className="text-gray-500">Август 2024</p>
      </div>
      <Image src={finalsPhoto} alt="Фото" className="mb-4" />

      <section className="mb-4">
        <p className="mb-2">
          Микрорайон Европейский Берег вновь готовится к грандиозному событию —
          финалам летнего турнира по настольному теннису 2024 года. Групповой
          этап почти завершен, и впереди нас ждет кульминация этого спортивного
          праздника.
        </p>
        <p className="mb-2">
          Третий по счету турнир собрал под своим знаменем множество талантливых
          спортсменов, и в этот раз их стремление к победе возросло многократно.
          Оставшиеся 53 игры станут последним шагом перед финальными баталиями,
          которые пройдут 17 и 18 августа, при условии благоприятной погоды.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Финалисты</h2>
        <p className="mb-2">
          На этот раз определились 7 из 8 участников финалов Золотой лиги:
          Алексей Михалевич, Евгений Шкретов, Антон Тимочкин, Наталья Зайцева,
          Дмитрий Куртеков, Роман Аникин. За последнее, 8-е место, развернется
          напряженная борьба между Глебом Фокиным, Артемом Шаламовым и Вадимом
          Боженовым.
        </p>
        <p className="mb-2">
          В этом году борьба в Золотой лиге заметно обострилась: из участников
          прошлого года в Золотой лиге остались только Дмитрий Куртеков, Наталья
          Зайцева и Евгений Шкретов. Остальные лидеры прошлого сезона теперь
          сражаются в Серебряной лиге, что говорит о высоком уровне конкуренции
          и мастерства всех участников.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Формат финалов</h2>
        <p className="mb-2">
          Напомним, что распределение по лигам происходит следующим образом:
          лучшие восемь участников группового этапа входят в Золотую лигу,
          игроки, занявшие места с 9 по 16, — в Серебряную, с 17 по 24 — в
          Бронзовую лигу.
        </p>
        <p className="mb-2">
          Финальная часть турнира проводится в формате двухдневного состязания,
          в котором каждый участник получит возможность проявить себя. Первый
          день отведен для групповых этапов, где игроки разделены на две группы
          по 4 человека. Из каждой группы по два лучших игрока выходят в 1/2
          финала. Второй день будет посвящен финалам и матчу за третье место.
          Остальные участники займут 5-е место в своей лиге.
        </p>
        <p className="mb-2">
          Среди участников Серебряной лиги уже известны имена таких спортсменов
          как Кирилл Ролдугин, Виктор Герасимов, Антон Шестернин и Илья Исаев.
          За возможность попасть в Серебряную лигу продолжат борьбу Анастасия
          Тамбовцева, Константин Назимов и Дмитрий Гондюхин.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Призы и Награды</h2>
        <p className="mb-2">
          Победители турнира будут отмечены медалями и грамотами, но самое
          главное, что ожидает финалистов — это неоценимый респект и признание
          со стороны всех участников и зрителей.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Важно Знать</h2>
        <p className="mb-2">
          Дата проведения финалов — 17 и 18 августа 2024 года. Пожалуйста,
          освободите эти дни для игр. В случае плохой погоды, турниры будут
          перенесены на другие даты.
        </p>
      </section>
    </div>
  );
};

export default SummerFinalsAnnouncement2024;