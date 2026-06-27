"use client";
import { Standings, StandingsItem } from "@/app/interface";
import Link from "next/link";
import { Fragment, useState } from "react";

/** Сыгранные (с результатом) и оставшиеся соперники игрока. */
function getOpponents(standings: Standings, item: StandingsItem) {
  const playedIds = new Set<number>();
  const played = item.matches.map((m) => {
    const oppId =
      m.player1Id === item.playerId ? m.player2Id : m.player1Id;
    playedIds.add(oppId);
    const isP1 = m.player1Id === item.playerId;
    const result =
      m.result === "DRAW"
        ? "Draw"
        : (m.result === "PLAYER1_WIN" && isP1) ||
          (m.result === "PLAYER2_WIN" && !isP1)
        ? "Win"
        : "Lose";
    const opp = standings.find((s) => s.playerId === oppId);
    return { id: oppId, name: opp?.player ?? "—", result };
  });
  const remaining = standings
    .filter((s) => s.playerId !== item.playerId && !playedIds.has(s.playerId))
    .map((s) => ({ id: s.playerId, name: s.player }));
  return { played, remaining };
}

/** Победы/поражения/ничьи игрока по его сыгранным матчам. */
function getRecord(item: StandingsItem) {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (const m of item.matches) {
    const isP1 = m.player1Id === item.playerId;
    if (m.result === "DRAW") {
      draws += 1;
    } else if (
      (m.result === "PLAYER1_WIN" && isP1) ||
      (m.result === "PLAYER2_WIN" && !isP1)
    ) {
      wins += 1;
    } else {
      losses += 1;
    }
  }
  return { wins, losses, draws };
}

const LEAGUE_LABEL: Record<string, string> = {
  "🥇": "Золотая",
  "🥈": "Серебряная",
  "🥉": "Бронзовая",
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="caption-s font-semibold uppercase tracking-[0.18em] text-poster-clay-deep">
    {children}
  </p>
);

/** Карточка пьедестала (топ-3 группы). */
const PodiumCard = ({
  item,
  medal,
  highlight,
}: {
  item: StandingsItem;
  medal: string;
  highlight?: boolean;
}) => {
  const { wins, losses } = getRecord(item);
  return (
    <Link
      href={`/players/${item.playerId}`}
      className={`group flex flex-1 flex-col justify-between border-2 border-poster-ink p-16 no-underline transition-[box-shadow] hover:shadow-[5px_5px_0_0_#1c1712] ${
        highlight ? "bg-poster-clay text-poster-cream" : "bg-poster-cream text-poster-ink"
      } ${highlight ? "desktop:-mt-8 desktop:pb-24" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[40px] leading-none">{medal}</span>
        <span
          className={`caption-xs uppercase tracking-[0.1em] ${
            highlight ? "text-poster-cream/80" : "text-poster-muted"
          }`}
        >
          {LEAGUE_LABEL[item.league] ?? "Группа"}
        </span>
      </div>
      <div
        className={`mt-12 font-black uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(20px,2.4vw,30px)] ${
          highlight ? "text-poster-cream" : "text-poster-ink"
        }`}
      >
        {item.player}
      </div>
      <div className="mt-8 flex items-end justify-between">
        <span
          className={`font-black text-[clamp(28px,4vw,44px)] leading-none ${
            highlight ? "text-poster-cream" : "text-poster-clay"
          }`}
        >
          {item.totalPoints}
          <span
            className={`ml-4 caption-s font-normal ${
              highlight ? "text-poster-cream/80" : "text-poster-muted"
            }`}
          >
            очк
          </span>
        </span>
        <span
          className={`caption-s ${
            highlight ? "text-poster-cream/80" : "text-poster-muted"
          }`}
        >
          {wins}–{losses} · {item.gamesPlayed} игр
        </span>
      </div>
    </Link>
  );
};

const StandingsTable = ({
  standings,
  title,
}: {
  standings: Standings;
  title: string;
}) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const hasResults = standings.some((s) => s.gamesPlayed > 0);
  const leaders = hasResults ? standings.slice(0, 3) : [];
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="poster-scope min-h-screen bg-poster-paper text-poster-ink">
      <div className="container pb-60 pt-24">
        {/* Шапка */}
        <header className="border-b-2 border-poster-ink pb-16">
          <Eyebrow>Турнирная таблица · группа</Eyebrow>
          <h1 className="mt-8 font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(34px,6vw,64px)]">
            {title}
          </h1>
        </header>

        {/* Инфо-полоса формата */}
        <div className="mt-16 flex flex-col gap-8 border-2 border-poster-ink bg-poster-cream p-16 tablet:flex-row tablet:items-center tablet:justify-between desktop:flex-row desktop:items-center desktop:justify-between">
          <p className="text-m">
            Каждый играет со всеми · в каждой встрече две партии · очки:
            победа 3, ничья 2, поражение 1
          </p>
          <Link
            href="/rules"
            className="shrink-0 whitespace-nowrap border-2 border-poster-ink bg-poster-ink px-12 py-4 caption-s font-semibold uppercase tracking-[0.1em] text-poster-cream no-underline transition-colors hover:bg-poster-clay"
          >
            Правила турнира →
          </Link>
        </div>

        {/* Пьедестал */}
        {leaders.length === 3 && (
          <section className="mt-32">
            <Eyebrow>Лидеры группы</Eyebrow>
            <div className="mt-12 flex flex-col gap-12 tablet:flex-row desktop:flex-row">
              <PodiumCard item={leaders[1]} medal={medals[1]} />
              <PodiumCard item={leaders[0]} medal={medals[0]} highlight />
              <PodiumCard item={leaders[2]} medal={medals[2]} />
            </div>
          </section>
        )}

        {!hasResults && (
          <div className="mt-32 border-2 border-dashed border-poster-muted bg-poster-cream p-24 text-center">
            <p className="font-black uppercase tracking-[-0.01em] text-[clamp(20px,3vw,28px)]">
              Сезон только начался
            </p>
            <p className="mt-8 text-m text-poster-muted">
              Сыграйте первые матчи — таблица, лидеры и лиги появятся здесь.
            </p>
          </div>
        )}

        {/* Таблица */}
        <section className="mt-32">
          <Eyebrow>Полная таблица</Eyebrow>
          <div className="mt-12 overflow-x-auto border-2 border-poster-ink bg-poster-cream">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-poster-ink text-poster-cream">
                  <th className="px-12 py-8 text-left caption-s font-semibold uppercase tracking-[0.1em]">
                    №
                  </th>
                  <th className="px-12 py-8 text-left caption-s font-semibold uppercase tracking-[0.1em]">
                    Игрок
                  </th>
                  <th className="hidden px-12 py-8 text-left caption-s font-semibold uppercase tracking-[0.1em] tablet:table-cell desktop:table-cell">
                    Лига
                  </th>
                  <th className="hidden px-12 py-8 text-center caption-s font-semibold uppercase tracking-[0.1em] tablet:table-cell desktop:table-cell">
                    В–П
                  </th>
                  <th className="px-12 py-8 text-center caption-s font-semibold uppercase tracking-[0.1em]">
                    Очки
                  </th>
                  <th className="px-12 py-8 text-center caption-s font-semibold uppercase tracking-[0.1em]">
                    Игры
                  </th>
                  <th className="w-40 px-12 py-8 text-center caption-s font-semibold uppercase tracking-[0.1em]">
                    {/* шеврон */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((item) => {
                  const { wins, losses } = getRecord(item);
                  const showLeague = item.gamesPlayed > 0 && item.league;
                  const isOpen = expanded === item.playerId;
                  const { played, remaining } = isOpen
                    ? getOpponents(standings, item)
                    : { played: [], remaining: [] };
                  return (
                    <Fragment key={item.playerId}>
                      <tr
                        onClick={(e) => {
                          // Клик по ссылке (имя/чип) — не раскрываем, даём перейти
                          if ((e.target as HTMLElement).closest("a")) return;
                          setExpanded(isOpen ? null : item.playerId);
                        }}
                        className={`cursor-pointer border-t border-poster-ink/15 transition-colors hover:bg-poster-paper ${
                          isOpen ? "bg-poster-paper" : ""
                        }`}
                      >
                        <td className="px-12 py-8 text-left tabular-nums text-poster-muted">
                          {String(item.position).padStart(2, "0")}
                        </td>
                        <td className="px-12 py-8">
                          <Link
                            href={`/players/${item.playerId}`}
                            className="font-bold uppercase tracking-[-0.01em] text-poster-ink no-underline hover:text-poster-clay"
                          >
                            {item.player}
                          </Link>
                        </td>
                        <td className="hidden px-12 py-8 tablet:table-cell desktop:table-cell">
                          {showLeague ? (
                            <span className="inline-flex items-center gap-4 border border-poster-ink px-8 py-2 caption-xs uppercase tracking-[0.08em]">
                              <span>{item.league}</span>
                              {LEAGUE_LABEL[item.league]}
                            </span>
                          ) : (
                            <span className="text-poster-muted">—</span>
                          )}
                        </td>
                        <td className="hidden px-12 py-8 text-center tabular-nums tablet:table-cell desktop:table-cell">
                          <span className="text-poster-court">{wins}</span>
                          <span className="text-poster-muted">–</span>
                          <span className="text-poster-clay-deep">{losses}</span>
                        </td>
                        <td className="px-12 py-8 text-center font-black tabular-nums text-poster-clay">
                          {item.totalPoints}
                        </td>
                        <td className="px-12 py-8 text-center tabular-nums text-poster-muted">
                          {item.gamesPlayed}
                        </td>
                        <td className="px-12 py-8 text-center text-poster-muted">
                          <span
                            className={`inline-block transition-transform ${
                              isOpen ? "rotate-180 text-poster-clay" : ""
                            }`}
                          >
                            ▾
                          </span>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-poster-paper">
                          <td colSpan={7} className="px-12 pb-16 pt-4">
                            <div className="flex flex-col gap-16 border-2 border-poster-ink bg-poster-cream p-16 desktop:flex-row">
                              {/* Осталось сыграть — главный кейс */}
                              <div className="flex-1">
                                <div className="caption-xs uppercase tracking-[0.12em] text-poster-clay-deep">
                                  Осталось сыграть · {remaining.length}
                                </div>
                                {remaining.length > 0 ? (
                                  <div className="mt-8 flex flex-wrap gap-8">
                                    {remaining.map((o) => (
                                      <Link
                                        key={o.id}
                                        href={`/players/${o.id}`}
                                        className="border border-poster-ink bg-poster-paper px-8 py-2 caption-xs uppercase tracking-[0.06em] text-poster-ink no-underline transition-colors hover:bg-poster-clay hover:text-poster-cream"
                                      >
                                        {o.name}
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="mt-8 text-m text-poster-muted">
                                    Все встречи сыграны 🎉
                                  </p>
                                )}
                              </div>

                              {/* Сыгранные */}
                              <div className="flex-1">
                                <div className="caption-xs uppercase tracking-[0.12em] text-poster-muted">
                                  Сыграно · {played.length}
                                </div>
                                {played.length > 0 ? (
                                  <ul className="mt-8 space-y-2">
                                    {played.map((m, i) => (
                                      <li
                                        key={i}
                                        className="flex items-center justify-between gap-8"
                                      >
                                        <Link
                                          href={`/players/${m.id}`}
                                          className="caption-m text-poster-ink no-underline hover:text-poster-clay"
                                        >
                                          {m.name}
                                        </Link>
                                        <span
                                          className={`caption-xs font-semibold uppercase tracking-[0.06em] ${
                                            m.result === "Win"
                                              ? "text-poster-court"
                                              : m.result === "Lose"
                                              ? "text-poster-clay-deep"
                                              : "text-poster-muted"
                                          }`}
                                        >
                                          {m.result === "Win"
                                            ? "Победа"
                                            : m.result === "Lose"
                                            ? "Поражение"
                                            : "Ничья"}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-8 text-m text-poster-muted">
                                    Ещё не играл
                                  </p>
                                )}
                                <Link
                                  href={`/players/${item.playerId}`}
                                  className="mt-12 inline-block border-2 border-poster-ink bg-poster-ink px-12 py-4 caption-xs font-semibold uppercase tracking-[0.1em] text-poster-cream no-underline transition-colors hover:bg-poster-clay"
                                >
                                  Профиль игрока →
                                </Link>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StandingsTable;
