import { Metadata } from "next";
import poster from "./poster.png";
import winners from "./winners.jpg";
import Image from "next/image";

const title = "Случайные пары 2024 — Теннис. Евроберег";
const description =
  "Результаты второго парного турнира 'Случайные пары 2024', прошедшего в Новосибирске, на микрорайоне Европейский Берег 20 июля 2024 года.";
const url = "https://ebtt.ru/post/random-pairs-2024";

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
        url: winners.src,
        width: winners.width,
        height: winners.height,
        alt: "Победители турнира",
      },
    ],
  },
  twitter: {
    title,
    description,
    images: [],
  },
  robots: "index, follow",
  alternates: {
    canonical: url,
  },
};

const RandomPairs2024 = () => {
  return (
    <div className="container pb-32 pt-24">
      <h1 className="heading-l mb-16">
        Второй парный турнир по настольному теннису
      </h1>
      <div className="flex mb-4 justify-between">
        <p className="text-gray-500">Глеб Фокин</p>
        <p className="text-gray-500">20.07.2024</p>
      </div>

      <section className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Общие сведения</h2>
        <p>
          20 июля 2024 года в Новосибирске, на микрорайоне Европейский Берег
          состоялся второй парный турнир &laquo;Случайные пары 2024&raquo;.
          <br />
          Участие приняли 16 спортсменов, которые сформировали 8 пар. Турнир
          стартовал в 10:30 и завершился в 13:30.
          <br />
          Участники столкнулись со множеством захватывающих и напряженных
          моментов, демонстрируя свои навыки и мастерство на высшем уровне.
        </p>
      </section>
      <section className="mb-8">
        <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600">
          Турнир показал, насколько многострастен и захватывающ настольный
          теннис, объединяя более профессиональных участников и новичков.
        </blockquote>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Групповой этап</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold">Группа А</h3>
            <ul className="list-disc list-inside">
              <li>
                1-е место:{" "}
                <a href="/players/7" className="text-blue-500 no-underline">
                  Глеб Фокин
                </a>{" "}
                +{" "}
                <a href="/players/20" className="text-blue-500 no-underline">
                  Дмитрий Гондюхин
                </a>
              </li>
              <li>
                2-е место:{" "}
                <a href="/players/35" className="text-blue-500 no-underline">
                  Вадим Боженов
                </a>{" "}
                +{" "}
                <a href="/players/23" className="text-blue-500 no-underline">
                  Антон Катренко
                </a>
              </li>
              <li>
                3-е место:{" "}
                <a href="/players/27" className="text-blue-500 no-underline">
                  Наталья Рыжкова
                </a>{" "}
                +{" "}
                <a href="/players/2" className="text-blue-500 no-underline">
                  Виктория Емельянова
                </a>
              </li>
              <li>
                4-е место:{" "}
                <a href="/players/5" className="text-blue-500 no-underline">
                  Дмитрий Куртеков
                </a>{" "}
                + Игорь Соловьев
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Группа Б</h3>
            <ul className="list-disc list-inside">
              <li>
                1-е место:{" "}
                <a href="/players/4" className="text-blue-500 no-underline">
                  Наталья Зайцева
                </a>{" "}
                + Алексей Егоров
              </li>
              <li>
                2-е место: Марина Воробьева +{" "}
                <a href="/players/18" className="text-blue-500 no-underline">
                  Николай Соловьев
                </a>
              </li>
              <li>
                3-е место: Виктор Иванов +{" "}
                <a href="/players/24" className="text-blue-500 no-underline">
                  Кирилл Козюрин
                </a>
              </li>
              <li>
                4-е место:{" "}
                <a href="/players/8" className="text-blue-500 no-underline">
                  Евгений Шкретов
                </a>{" "}
                + Абулиев Алихан
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Полуфиналы</h2>
        <p>
          В первом полуфинале Глеб Фокин и Дмитрий Гондюхин сразились с Мариной
          Воробьевой и Николаем Соловьевым. В напряженном поединке победу
          одержали Марина и Николай со счётом <strong>0:3</strong>.
        </p>
        <p>
          Во втором полуфинале Вадим Баженов и Антон Катренко встретились с
          Натальей Зайцевой и Алексеем Егоровым. Игра выдалась на редкость
          ожесточенной, и победу одержали Наталья и Алексей – со счётом{" "}
          <strong>2:3</strong>.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Финал</h2>
        <p>
          В финале Наталья Зайцева и Алексей Егоров встретились с Мариной
          Воробьевой и Николаем Соловьевым. Демонстрируя уверенную игру, Наталья
          и Алексей одержали победу со счётом <strong>3:0</strong> и завоевали
          золотые медали турнира.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Матч за третье место</h2>
        <p>
          В матче за третье место Глеб Фокин и Дмитрий Гондюхин сразились с
          Вадимом Баженовым и Антоном Катренко. В захватывающей игре Глеб и
          Дмитрий одержали победу со счётом <strong>3:2</strong>, обеспечив себе
          почётное третье место.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Конкурс плакатов</h2>
        <p>
          Виктория Емельянова продемонстрировала свои творческие способности и
          победила в конкурсе на лучший плакат. Её работа порадовала всех своим
          креативом и яркостью, став символом этого турнира.
        </p>
        <div className="flex justify-center mt-4">
          <Image src={poster} alt="Победитель конкурса постеров"></Image>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Примечательные моменты</h2>
        <p>
          К сожалению, не все участники справились с эмоциональным давлением
          турнира: двое игроков сошли с дистанции, не доиграв групповые игры.
        </p>
        <p>
          Для Натальи Зайцевой победа в этом турнире стала четвёртым золотом в
          карьере.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold">Итоги турнира</h2>
        <div>
          <div>🥇 Наталья Зайцева и Алексей Егоров</div>
          <div>🥈 Марина Воробьева и Николай Соловьев</div>
          <div>🥉 Глеб Фокин и Дмитрий Гондюхин</div>
        </div>
      </section>
      <div className="flex justify-center mt-4">
        <Image src={winners} alt="Победители турнира"></Image>
      </div>
    </div>
  );
};

export default RandomPairs2024;
