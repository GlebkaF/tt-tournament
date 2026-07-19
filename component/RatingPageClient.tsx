"use client";

import { CURRENT_TOURNAMENT_ID } from "@/app/const";
import type { PlayerRating } from "@/utils/rating";
import { useRatingFeatureFlag } from "@/utils/ratingFeature";
import { groupRatingPlayers } from "@/utils/ratingLeaderboard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export interface RatingPagePlayer {
  id: number;
  firstName: string;
  lastName: string;
  active: boolean;
  rating: PlayerRating;
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="caption-s font-semibold uppercase tracking-[0.18em] text-poster-clay-deep">
    {children}
  </p>
);

function RatingSection({
  title,
  description,
  players,
  ranks,
}: {
  title: string;
  description: string;
  players: RatingPagePlayer[];
  ranks: Map<number, number>;
}) {
  if (players.length === 0) return null;

  return (
    <section className="mt-32">
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-4 max-w-2xl text-m text-poster-muted">{description}</p>
      <div className="mt-12 overflow-hidden border-2 border-poster-ink bg-poster-cream">
        {players.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.id}`}
            className="grid grid-cols-[40px_1fr_auto] items-center gap-12 border-t border-poster-ink/15 px-12 py-10 text-poster-ink no-underline first:border-t-0 hover:bg-poster-paper hover:text-poster-ink"
          >
            <span className="caption-s tabular-nums text-poster-muted">
              {player.rating.isCalibrating
                ? "—"
                : String(ranks.get(player.id) ?? "—").padStart(2, "0")}
            </span>
            <span>
              <strong className="block uppercase tracking-[-0.01em]">
                {player.lastName} {player.firstName}
              </strong>
              <span className="caption-xs uppercase tracking-[0.08em] text-poster-muted">
                {player.rating.isCalibrating
                  ? `Калибровка · примерно ${player.rating.estimatedGamesToCalibration} игр`
                  : `${player.rating.matchesPlayed} матчей в рейтинге`}
              </span>
            </span>
            <strong className="text-[24px] font-black tabular-nums text-poster-court">
              {player.rating.rating}
              {player.rating.isCalibrating ? "*" : ""}
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function RatingPageClient({
  players,
}: {
  players: RatingPagePlayer[];
}) {
  const router = useRouter();
  const { enabled, ready } = useRatingFeatureFlag();

  useEffect(() => {
    if (ready && !enabled) {
      router.replace(`/tournament/${CURRENT_TOURNAMENT_ID}`);
    }
  }, [enabled, ready, router]);

  const groups = useMemo(() => groupRatingPlayers(players), [players]);

  if (!ready || !enabled) {
    return (
      <div className="container py-32 text-poster-muted">
        Загрузка рейтинга…
      </div>
    );
  }

  return (
    <div className="poster-scope min-h-screen bg-poster-paper text-poster-ink">
      <div className="container pb-60 pt-24">
        <header className="border-b-2 border-poster-ink pb-16">
          <Eyebrow>Эксперимент · Glicko-2</Eyebrow>
          <h1 className="mt-8 font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(38px,7vw,72px)]">
            Рейтинг силы
          </h1>
          <p className="mt-12 max-w-3xl text-l text-poster-muted">
            Сквозная оценка по всем турнирным матчам. Число не влияет на
            официальную таблицу, лиги или выход в финал.
          </p>
        </header>

        <RatingSection
          title={`Текущий сезон · ${groups.active.length}`}
          description="Откалиброванные участники текущего турнира."
          players={groups.active}
          ranks={groups.ranks}
        />
        <RatingSection
          title={`Калибровка · ${groups.calibrating.length}`}
          description="Рейтинг уже меняется, но системе пока нужно больше результатов."
          players={groups.calibrating}
          ranks={groups.ranks}
        />
        <RatingSection
          title={`Неактивные · ${groups.inactive.length}`}
          description="Игроки прошлых сезонов, которые не входят в текущий состав."
          players={groups.inactive}
          ranks={groups.ranks}
        />
      </div>
    </div>
  );
}
