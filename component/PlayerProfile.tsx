"use client";
import { CURRENT_TOURNAMENT_NAME } from "@/app/const";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import Image from "next/image";
import Link from "next/link";

interface MatchDetail {
  opponent: {
    name: string;
    id: number;
  };
  result: string;
}

interface PlayerProfileProps {
  player: {
    id: number;
    name: string;
    gamesPlayed: number;
    image: string;
    facts: { title: string; description: string }[];
  };
  matchDays: {
    date: string;
    matches: MatchDetail[];
  }[];
  pending: { id: number; name: string }[];
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="caption-s font-semibold uppercase tracking-[0.18em] text-poster-clay-deep">
    {children}
  </p>
);

const calculateStatistics = (matches: MatchDetail[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let tbd = 0;
  for (const m of matches) {
    if (m.result === "PLAYER1_WIN") wins += 1;
    else if (m.result === "PLAYER2_WIN") losses += 1;
    else if (m.result === "DRAW") draws += 1;
    else if (m.result === "TBD") tbd += 1;
  }
  const score = wins * 3 + draws * 2 + losses * 1;
  return { wins, draws, losses, tbd, score };
};

const StatTile = ({
  value,
  label,
  accent,
}: {
  value: number | string;
  label: string;
  accent?: "clay" | "court" | "ink";
}) => {
  const color =
    accent === "clay"
      ? "text-poster-clay"
      : accent === "court"
      ? "text-poster-court"
      : "text-poster-ink";
  return (
    <div className="flex-1 border-2 border-poster-ink bg-poster-cream px-12 py-12 text-center">
      <div className={`font-black leading-none text-[clamp(26px,4vw,40px)] ${color}`}>
        {value}
      </div>
      <div className="mt-4 caption-xs uppercase tracking-[0.1em] text-poster-muted">
        {label}
      </div>
    </div>
  );
};

const RESULT_META: Record<
  string,
  { label: string; chip: string; mark: string }
> = {
  PLAYER1_WIN: {
    label: "Победа",
    chip: "border-poster-court text-poster-court",
    mark: "▲",
  },
  PLAYER2_WIN: {
    label: "Поражение",
    chip: "border-poster-clay text-poster-clay-deep",
    mark: "▼",
  },
  DRAW: {
    label: "Ничья",
    chip: "border-poster-muted text-poster-muted",
    mark: "—",
  },
  TBD: {
    label: "Не сыграно",
    chip: "border-poster-muted text-poster-muted border-dashed",
    mark: "·",
  },
};

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  matchDays,
  pending,
}) => {
  const allMatches = matchDays.flatMap((d) => d.matches);
  const { wins, draws, losses, tbd, score } = calculateStatistics(allMatches);
  const played = wins + draws + losses;

  const seg = (n: number) => (played > 0 ? (n / played) * 100 : 0);

  return (
    <div className="poster-scope min-h-screen bg-poster-paper text-poster-ink">
      <div className="container pb-60 pt-24">
        <Link
          href={`/tournament/${CURRENT_TOURNAMENT_ID}`}
          className="caption-s font-semibold uppercase tracking-[0.1em] text-poster-muted no-underline hover:text-poster-clay"
        >
          ← Турнирная таблица
        </Link>

        {/* Герой */}
        <div className="mt-16 flex flex-col gap-24 desktop:flex-row desktop:items-start">
          <div className="w-full shrink-0 border-2 border-poster-ink desktop:w-[340px]">
            <Image
              width={1200}
              height={1600}
              src={player.image}
              alt={player.name}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="w-full">
            <Eyebrow>Профиль игрока</Eyebrow>
            <h1 className="mt-8 font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(34px,5.5vw,60px)]">
              {player.name}
            </h1>

            {/* Плитки статистики */}
            <div className="mt-16 flex flex-wrap gap-8">
              <StatTile value={player.gamesPlayed} label="Игр" />
              <StatTile value={wins} label="Побед" accent="court" />
              <StatTile value={losses} label="Поражений" accent="clay" />
              <StatTile value={score} label="Очков" accent="clay" />
            </div>

            {/* Полоса побед/поражений */}
            {played > 0 && (
              <div className="mt-16">
                <div className="flex h-12 w-full overflow-hidden border-2 border-poster-ink">
                  <div
                    className="h-full bg-poster-court"
                    style={{ width: `${seg(wins)}%` }}
                  />
                  <div
                    className="h-full bg-poster-muted"
                    style={{ width: `${seg(draws)}%` }}
                  />
                  <div
                    className="h-full bg-poster-clay"
                    style={{ width: `${seg(losses)}%` }}
                  />
                </div>
                <div className="mt-8 flex flex-wrap gap-x-16 gap-y-4 caption-xs uppercase tracking-[0.08em] text-poster-muted">
                  <span>
                    <span className="text-poster-court">■</span> Победы {wins}
                  </span>
                  {draws > 0 && (
                    <span>
                      <span className="text-poster-muted">■</span> Ничьи {draws}
                    </span>
                  )}
                  <span>
                    <span className="text-poster-clay">■</span> Поражения{" "}
                    {losses}
                  </span>
                </div>
              </div>
            )}

            {/* Достижения */}
            {player.facts.length > 0 && (
              <div className="mt-24">
                <Eyebrow>Достижения</Eyebrow>
                <div className="mt-12 grid grid-cols-1 gap-8 tablet:grid-cols-2 desktop:grid-cols-2">
                  {player.facts.map((fact, i) => (
                    <div
                      key={i}
                      className="border-2 border-poster-ink bg-poster-cream p-12"
                    >
                      <div className="font-black uppercase tracking-[-0.01em] text-poster-ink">
                        {fact.title}
                      </div>
                      <div className="mt-2 text-m text-poster-muted">
                        {fact.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Матчи */}
        <section className="mt-32">
          <Eyebrow>Матчи · {CURRENT_TOURNAMENT_NAME}</Eyebrow>
          {played === 0 && tbd === 0 ? (
            <div className="mt-12 border-2 border-dashed border-poster-muted bg-poster-cream p-24 text-center text-m text-poster-muted">
              Пока нет сыгранных матчей.
            </div>
          ) : (
            <div className="mt-12 space-y-16">
              {matchDays.map((day) => (
                <div key={day.date}>
                  <div className="mb-4 caption-xs uppercase tracking-[0.12em] text-poster-muted">
                    {day.date}
                  </div>
                  <ul className="border-2 border-poster-ink bg-poster-cream">
                    {day.matches.map((match, i) => {
                      const meta =
                        RESULT_META[match.result] ?? RESULT_META.TBD;
                      return (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-12 border-t border-poster-ink/15 px-12 py-8 first:border-t-0"
                        >
                          <Link
                            href={`/players/${match.opponent.id}`}
                            className="font-bold uppercase tracking-[-0.01em] text-poster-ink no-underline hover:text-poster-clay"
                          >
                            {match.opponent.name}
                          </Link>
                          <span
                            className={`shrink-0 border px-8 py-2 caption-xs font-semibold uppercase tracking-[0.08em] ${meta.chip}`}
                          >
                            {meta.mark} {meta.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Осталось сыграть */}
        {pending.length > 0 && (
          <section className="mt-32">
            <Eyebrow>Осталось сыграть · {pending.length}</Eyebrow>
            <ul className="mt-12 border-2 border-dashed border-poster-muted bg-poster-cream">
              {pending.map((opponent) => (
                <li
                  key={opponent.id}
                  className="flex items-center justify-between gap-12 border-t border-poster-ink/15 px-12 py-8 first:border-t-0"
                >
                  <Link
                    href={`/players/${opponent.id}`}
                    className="font-bold uppercase tracking-[-0.01em] text-poster-ink no-underline hover:text-poster-clay"
                  >
                    {opponent.name}
                  </Link>
                  <span className="shrink-0 border border-dashed border-poster-muted px-8 py-2 caption-xs font-semibold uppercase tracking-[0.08em] text-poster-muted">
                    · Не сыграно
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
