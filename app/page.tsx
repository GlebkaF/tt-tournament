import { Metadata } from "next";
import Link from "next/link";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import createDeps from "@/service/create-deps";
import "./landing-affiche.css";

const TELEGRAM_URL = "https://t.me/+nsoeCj4lNi81Zjg6";

const { prisma } = createDeps();
const ru = (n: number) => n.toLocaleString("ru-RU");

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M21.9 4.3 18.7 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.4 12.7l-4.8-1.5c-1-.3-1-1 .2-1.5L20.6 2.9c.9-.3 1.6.2 1.3 1.4z" />
  </svg>
);

export default async function Home() {
  const tournamentLink = `/tournament/${CURRENT_TOURNAMENT_ID}`;

  // Игроки и матчи — реальные счётчики из БД (за всё время).
  const [playersCount, matchesCount] = await Promise.all([
    prisma.user.count(),
    prisma.match.count(),
  ]);
  // В БД учтены не все ранние турниры — раньше статистику не вели,
  // поэтому турниры и год основания держим явными значениями.
  const tournamentsCount = 9;
  const foundingYear = 2023;

  return (
    <div className="affiche-root">
      <header className="poster">
        <div className="poster-in">
          <div className="poster-left">
            <div className="tagline">Летний сезон · Европейский берег · 2026</div>
            <div className="giant">
              <span className="stroke kicker">НАСТОЛЬНЫЙ</span>
              <br />
              ТЕННИС
              <br />
              <span className="o">У{" "}ВОДЫ</span>
            </div>
            <p className="sub">
              Любительский турнир по настольному теннису на набережной
              Европейского берега. Три лиги, групповая стадия и свои финалы под
              открытым небом.
            </p>
            <div className="ticket-row">
              <a
                href={TELEGRAM_URL}
                className="play"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TelegramIcon />
                Заявиться на сезон
              </a>
              <Link href={tournamentLink} className="stub">
                Таблица сезона →
              </Link>
            </div>
          </div>
          <div className="poster-right">
            <img
              src="/image/landing/winners-2025.jpg"
              alt="Победители турнира 2025"
            />
            <div className="stamp">
              <small>Финалы 2025</small>
              <b>Чемпионы</b>
            </div>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          <span>
            Золотая лига <b>★</b> Серебряная лига <b>★</b> Бронзовая лига{" "}
            <b>★</b> Групповая стадия <b>★</b> Плей-офф <b>★</b> Финалы у воды{" "}
            <b>★</b>&nbsp;
          </span>
          <span>
            Золотая лига <b>★</b> Серебряная лига <b>★</b> Бронзовая лига{" "}
            <b>★</b> Групповая стадия <b>★</b> Плей-офф <b>★</b> Финалы у воды{" "}
            <b>★</b>&nbsp;
          </span>
        </div>
      </div>

      <div className="scoreboard" id="board">
        <div className="sc">
          <div className="n">{ru(playersCount)}</div>
          <div className="l">Игроков всего</div>
        </div>
        <div className="sc">
          <div className="n">{ru(matchesCount)}</div>
          <div className="l">Матчей сыграно</div>
        </div>
        <Link href="/tournaments" className="sc">
          <div className="n">{ru(tournamentsCount)}</div>
          <div className="l">Турниров</div>
        </Link>
        <div className="sc">
          <div className="n">{foundingYear}</div>
          <div className="l">Играем с</div>
        </div>
      </div>

      <section className="block" id="leagues">
        <div className="wrap">
          <div className="sec-head">
            <h2>
              Три лиги —<br />
              один турнир
            </h2>
            <p>
              Делимся по силе, чтобы каждый матч был ровным и злым. Растёшь в
              рейтинге — растёшь в дивизионе.
            </p>
          </div>
          <div className="leagues">
            <div className="league">
              <div className="no">№ I</div>
              <h3>Золотая</h3>
              <p>Сильнейшие ракетки набережной. Подача, вращение, характер.</p>
              <span className="chip">Дивизион силы</span>
            </div>
            <div className="league">
              <div className="no">№ II</div>
              <h3>Серебряная</h3>
              <p>Самая плотная таблица сезона. Решает каждое очко.</p>
              <span className="chip">Средний уровень</span>
            </div>
            <div className="league">
              <div className="no">№ III</div>
              <h3>Бронзовая</h3>
              <p>Старт для новичков. Приходи — соперников подберём по силе.</p>
              <span className="chip">Старт новичка</span>
            </div>
          </div>
        </div>
      </section>

      <section className="final">
        <div className="wrap final-in">
          <h2>Бери ракетку</h2>
          <p>
            Расписание, пары и результаты — в Telegram-чате. Заходи играть или
            помогать с организацией сезона.
          </p>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
            Присоединиться к сезону →
          </a>
        </div>
      </section>

      <footer className="wrap site-footer">
        <span>© 2026 Теннис. Евроберег</span>
        <span>Affiche du tournoi · набережная</span>
      </footer>
    </div>
  );
}

const title = "Теннис. Евроберег";
const description =
  "Любительский турнир по настольному теннису на набережной Европейского берега. Три лиги, групповая стадия и финалы под открытым небом.";
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
