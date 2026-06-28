import type { Metadata } from "next";
import Link from "next/link";
import createDeps from "@/service/create-deps";
import { CURRENT_TOURNAMENT_ID } from "@/app/const";

const { tournamentService } = createDeps();

export const metadata: Metadata = {
  title: "Все турниры — Теннис. Евроберег",
  description:
    "Архив сезонов любительского турнира по настольному теннису на Европейском берегу: 2023, 2024, 2025 и текущий сезон.",
};

const TournamentsPage = async () => {
  const tournaments = await tournamentService.getTournaments();

  return (
    <div className="poster-scope bg-poster-paper text-poster-ink">
      <div className="container py-32 tablet:py-48">
        <header className="mb-32 border-b-[3px] border-poster-ink pb-16">
          <div className="text-[13px] font-bold uppercase tracking-[0.2em] text-poster-clay">
            Архив сезонов
          </div>
          <h1 className="mt-8 text-[40px] font-black uppercase leading-none tablet:text-[64px]">
            Все турниры
          </h1>
        </header>

        <ul className="grid list-none grid-cols-1 gap-16 p-0 tablet:grid-cols-2">
          {tournaments.map((tournament) => {
            const isCurrent = tournament.id === CURRENT_TOURNAMENT_ID;
            return (
              <li key={tournament.id}>
                <Link
                  href={`/tournament/${tournament.id}`}
                  className="group flex items-center justify-between gap-16 border-[3px] border-poster-ink bg-poster-cream px-20 py-20 no-underline transition-colors hover:bg-poster-ink hover:text-poster-cream"
                >
                  <div>
                    <div className="text-[22px] font-black uppercase leading-tight tablet:text-[26px]">
                      {tournament.title}
                    </div>
                    <div className="mt-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-poster-clay group-hover:text-poster-cream">
                      {tournament.playersCount} участников
                      {isCurrent ? " · идёт сейчас" : ""}
                    </div>
                  </div>
                  <span className="shrink-0 text-[28px] font-black">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TournamentsPage;

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
