import type { Metadata } from "next";
import Link from "next/link";
import {
  CURRENT_TOURNAMENT_ID,
  CURRENT_TOURNAMENT_NAME,
} from "@/app/const";

export const metadata: Metadata = {
  title: `Правила — ${CURRENT_TOURNAMENT_NAME}`,
  description:
    "Как устроен летний турнир по настольному теннису: формат, расписание, подсчёт очков, лиги и финалы.",
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-12">
    <h2 className="heading-m mb-4">{title}</h2>
    <div className="space-y-2 text-l text-gray-700">{children}</div>
  </section>
);

export default function RulesPage() {
  return (
    <div className="container pb-32 pt-24 max-w-3xl">
      <h1 className="heading-l mb-4">Правила турнира</h1>
      <p className="text-l text-gray-700 mb-16">
        {CURRENT_TOURNAMENT_NAME}. Дружеский турнир по настольному теннису —
        играем в своё удовольствие, без жёстких рамок. Ниже — как всё устроено.
      </p>

      <Section title="Формат">
        <p>
          Турнир идёт по системе «каждый с каждым»: задача каждого участника —
          отыграть личные встречи со всеми остальными игроками турнира.
        </p>
        <p>
          Каждая встреча играется до 2 побед из 3 партий. Ничьих не бывает — в
          матче всегда есть победитель.
        </p>
      </Section>

      <Section title="Как и когда играем">
        <p>
          Жёсткого расписания нет. Ориентир — сыграть примерно 2 игры в неделю,
          но это не обязательно: подбираете удобное время и играете.
        </p>
        <p>
          Чаще всего собираемся поиграть толпой в определённые дни (как правило,
          в выходные) — такие сборы мы анонсируем в{" "}
          <Link
            href="https://t.me/+nsoeCj4lNi81Zjg6"
            className="text-primary-base underline"
            target="_blank"
          >
            телеграм-канале
          </Link>
          .
        </p>
        <p>
          Если в общий день прийти не получается — участники могут списаться
          лично и сыграть свои матчи когда удобно.
        </p>
        <p>
          Результаты каждой игры (кто выиграл, кто проиграл) отправляем в группу
          — мы заносим их в{" "}
          <Link
            href={`/tournament/${CURRENT_TOURNAMENT_ID}`}
            className="text-primary-base underline"
          >
            турнирную таблицу
          </Link>
          , которая открыта для всех. Там же видно, с кем вы уже сыграли, а с кем
          ещё предстоит.
        </p>
      </Section>

      <Section title="Очки и таблица">
        <p>За победу в матче начисляется 3 очка, за поражение — 1 очко.</p>
        <p>
          Места в таблице распределяются по сумме набранных очков за сыгранные
          встречи.
        </p>
      </Section>

      <Section title="Лиги и финалы">
        <p>
          Ближе к финалам, исходя из положения в турнирной таблице, участники
          распределяются по лигам: «Золотая», «Серебряная» и «Бронзовая».
        </p>
        <p>
          Если наберётся меньше 18 участников — лиги будет две: «Золотая» и
          «Серебряная».
        </p>
        <p>
          В каждой лиге пройдут финалы, где разыграются призы за 1–3 места.
          Финалы лиг запланированы на 29–30 августа.
        </p>
      </Section>

      <Section title="Важно">
        <p>
          Поражения по ходу турнира — это нормально. Они не означают, что вы
          выбываете: всё решит финал. Главное — играть и получать удовольствие.
        </p>
      </Section>

      <Link
        href={`/tournament/${CURRENT_TOURNAMENT_ID}`}
        className="text-l text-primary-base underline"
      >
        ← К турнирной таблице
      </Link>
    </div>
  );
}
