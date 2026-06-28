"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { MatchResult } from "@/app/interface";
import { Avatar } from "./Avatar";
import { ActiveMatch, DayState, PlayedMatch, PlayerV2, QueuePair } from "./types";
import { buildQueue, pairKey, remainingOpponents } from "./queue";
import {
  getStoredPassword,
  promptPassword,
  recordMatch,
  storePassword,
} from "./api";

interface Props {
  players: PlayerV2[];
  serverMatches: PlayedMatch[];
  tournamentName: string;
  tournamentId: number;
}

/* ---------- утилиты ---------- */

function localDateStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const DEFAULT_DAY: DayState = {
  present: [],
  tableCount: 2,
  active: [],
  seq: 1,
};

/* ---------- основной компонент ---------- */

export default function ScheduleV2({
  players,
  serverMatches,
  tournamentName,
  tournamentId,
}: Props) {
  const storageKey = `tt-schedule-v2:${tournamentId}`;

  const [day, setDay] = useState<DayState>(DEFAULT_DAY);
  const [hydrated, setHydrated] = useState(false);
  /** Матчи, занесённые в этой сессии (на сервере они уже есть, но не перезагружаем страницу). */
  const [localMatches, setLocalMatches] = useState<PlayedMatch[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  /** Выбранные на скамейке игроки для ручного сведения в пару. */
  const [benchPick, setBenchPick] = useState<number[]>([]);

  const playerMap = useMemo(() => {
    const m = new Map<number, PlayerV2>();
    players.forEach((p) => m.set(p.id, p));
    return m;
  }, [players]);

  /* --- гидрация: ссылка (?p=&t=) > localStorage > дефолт --- */
  useEffect(() => {
    const known = new Set(players.map((p) => p.id));
    let next: DayState = { ...DEFAULT_DAY };

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DayState>;
        next = { ...next, ...parsed };
      }
    } catch {
      /* ignore */
    }

    // Шаринг: параметры в ссылке перекрывают локальный выбор —
    // можно скинуть ссылку второму оргу / открыть на другом устройстве.
    const url = new URLSearchParams(window.location.search);
    const p = url.get("p");
    const t = url.get("t");
    if (p !== null) {
      next.present = p
        ? p.split(",").map(Number).filter((n) => Number.isFinite(n))
        : [];
    }
    if (t) {
      const tn = parseInt(t, 10);
      if (Number.isFinite(tn)) next.tableCount = Math.max(1, Math.min(8, tn));
    }

    // Отбрасываем id, которых нет в ростере, и матчи с неизвестными игроками.
    next.present = next.present.filter((id) => known.has(id));
    next.active = (next.active ?? []).filter(
      (a) => known.has(a.player1Id) && known.has(a.player2Id)
    );

    setDay(next);
    setHydrated(true);
  }, [storageKey, players]);

  /* --- сохранение: localStorage + URL (для шаринга ссылки) --- */
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(storageKey, JSON.stringify(day));

    const url = new URLSearchParams(window.location.search);
    if (day.present.length) url.set("p", day.present.join(","));
    else url.delete("p");
    url.set("t", String(day.tableCount));
    const qs = url.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    );
  }, [day, hydrated, storageKey]);

  /* --- тикалка для таймеров (1 раз в сек, только если есть активные столы) --- */
  useEffect(() => {
    if (day.active.length === 0) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [day.active.length]);

  /* --- производные данные --- */
  const todayStr = localDateStr();

  const allMatches = useMemo(
    () => [...serverMatches, ...localMatches],
    [serverMatches, localMatches]
  );

  const playedPairKeys = useMemo(() => {
    const s = new Set<string>();
    allMatches.forEach((m) => s.add(pairKey(m.player1Id, m.player2Id)));
    return s;
  }, [allMatches]);

  const gamesTotal = useMemo(() => {
    const m = new Map<number, number>();
    allMatches.forEach((mt) => {
      m.set(mt.player1Id, (m.get(mt.player1Id) ?? 0) + 1);
      m.set(mt.player2Id, (m.get(mt.player2Id) ?? 0) + 1);
    });
    return m;
  }, [allMatches]);

  const gamesToday = useMemo(() => {
    const m = new Map<number, number>();
    allMatches.forEach((mt) => {
      if (mt.date.slice(0, 10) !== todayStr) return;
      m.set(mt.player1Id, (m.get(mt.player1Id) ?? 0) + 1);
      m.set(mt.player2Id, (m.get(mt.player2Id) ?? 0) + 1);
    });
    return m;
  }, [allMatches, todayStr]);

  const onTable = useMemo(() => {
    const s = new Set<number>();
    day.active.forEach((a) => {
      s.add(a.player1Id);
      s.add(a.player2Id);
    });
    return s;
  }, [day.active]);

  const idleIds = useMemo(
    () => day.present.filter((id) => !onTable.has(id)),
    [day.present, onTable]
  );

  const queue = useMemo(
    () =>
      buildQueue({
        idlePlayerIds: idleIds,
        playedPairKeys,
        gamesTotal,
        gamesToday,
      }),
    [idleIds, playedPairKeys, gamesTotal, gamesToday]
  );

  const freeTables = day.tableCount - day.active.length;

  /* прогресс */
  const presentSet = useMemo(() => new Set(day.present), [day.present]);
  const totalPairsAmongPresent = useMemo(() => {
    const n = day.present.length;
    return (n * (n - 1)) / 2;
  }, [day.present.length]);
  const playedAmongPresent = useMemo(() => {
    let c = 0;
    playedPairKeys.forEach((k) => {
      const [a, b] = k.split("-").map(Number);
      if (presentSet.has(a) && presentSet.has(b)) c++;
    });
    return c;
  }, [playedPairKeys, presentSet]);
  const matchesTodayCount = useMemo(
    () => allMatches.filter((m) => m.date.slice(0, 10) === todayStr).length,
    [allMatches, todayStr]
  );

  /* --- имена/хелперы --- */
  const name = useCallback(
    (id: number) => {
      const p = playerMap.get(id);
      return p ? `${p.firstName} ${p.lastName}` : `#${id}`;
    },
    [playerMap]
  );
  const shortName = useCallback(
    (id: number) => {
      const p = playerMap.get(id);
      if (!p) return `#${id}`;
      return `${p.firstName} ${p.lastName.charAt(0)}.`;
    },
    [playerMap]
  );

  /* --- мутации состояния --- */
  const togglePresent = (id: number) =>
    setDay((d) => ({
      ...d,
      present: d.present.includes(id)
        ? d.present.filter((x) => x !== id)
        : [...d.present, id],
    }));

  const setTableCount = (n: number) =>
    setDay((d) => ({ ...d, tableCount: Math.max(1, Math.min(8, n)) }));

  const shareLink = useCallback(async () => {
    const urlStr = window.location.href;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: tournamentName, url: urlStr });
      } else {
        await navigator.clipboard.writeText(urlStr);
        message.success("Ссылка на табло скопирована");
      }
    } catch {
      /* пользователь отменил шаринг — ничего не делаем */
    }
  }, [tournamentName]);

  const callPair = useCallback(
    (pair: QueuePair) => {
      setDay((d) => {
        if (d.tableCount - d.active.length <= 0) return d;
        // оба ещё свободны?
        const busy = new Set<number>();
        d.active.forEach((a) => {
          busy.add(a.player1Id);
          busy.add(a.player2Id);
        });
        if (busy.has(pair.player1Id) || busy.has(pair.player2Id)) return d;
        const usedTables = new Set(d.active.map((a) => a.tableNo));
        let tableNo = 1;
        while (usedTables.has(tableNo)) tableNo++;
        const match: ActiveMatch = {
          id: `m${d.seq}`,
          tableNo,
          player1Id: pair.player1Id,
          player2Id: pair.player2Id,
          startedAt: Date.now(),
        };
        return { ...d, active: [...d.active, match], seq: d.seq + 1 };
      });
    },
    []
  );

  const callNext = () => {
    let free = freeTables;
    for (const pair of queue) {
      if (free <= 0) break;
      callPair(pair);
      free--;
    }
    if (queue.length === 0) message.info("Очередь пуста — все свободные сыграли друг с другом");
  };

  const returnToQueue = (matchId: string) =>
    setDay((d) => ({ ...d, active: d.active.filter((a) => a.id !== matchId) }));

  const ensurePassword = useCallback((): string | null => {
    let pw = getStoredPassword();
    if (!pw) {
      pw = promptPassword();
      if (!pw) {
        message.error("Нужен пароль организатора, чтобы заносить результаты");
        return null;
      }
    }
    return pw;
  }, []);

  const finishMatch = useCallback(
    async (m: ActiveMatch, result: MatchResult) => {
      const pw = ensurePassword();
      if (!pw) return;

      const hide = message.loading("Сохраняю…", 0);
      const res = await recordMatch({
        player1Id: m.player1Id,
        player2Id: m.player2Id,
        result,
        password: pw,
        date: todayStr,
      });
      hide();

      if (res.ok) {
        storePassword(pw);
        setLocalMatches((prev) => [
          ...prev,
          {
            player1Id: m.player1Id,
            player2Id: m.player2Id,
            result,
            date: todayStr,
          },
        ]);
        setDay((d) => ({ ...d, active: d.active.filter((a) => a.id !== m.id) }));
        const txt =
          result === MatchResult.draw
            ? `Ничья: ${shortName(m.player1Id)} — ${shortName(m.player2Id)}`
            : `Победа: ${shortName(
                result === MatchResult.player1Win ? m.player1Id : m.player2Id
              )}`;
        message.success(txt);
      } else if (res.reason === "auth") {
        message.error("Неверный пароль, попробуйте ещё раз");
      } else if (res.reason === "duplicate") {
        message.warning("Эта пара уже сыграна — стол освобождён");
        setDay((d) => ({ ...d, active: d.active.filter((a) => a.id !== m.id) }));
      } else {
        message.error("Не удалось сохранить результат");
      }
    },
    [ensurePassword, shortName, todayStr]
  );

  /* --- ручное сведение пары со скамейки --- */
  const toggleBenchPick = (id: number) =>
    setBenchPick((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });

  const benchPickPlayed =
    benchPick.length === 2 &&
    playedPairKeys.has(pairKey(benchPick[0], benchPick[1]));

  const confirmBenchPair = () => {
    if (benchPick.length !== 2) return;
    if (benchPickPlayed) {
      message.warning("Эта пара уже играла в турнире");
      return;
    }
    if (freeTables <= 0) {
      message.warning("Нет свободных столов");
      return;
    }
    callPair({ player1Id: benchPick[0], player2Id: benchPick[1] });
    setBenchPick([]);
  };

  /* --- группы скамейки --- */
  const benchActive = idleIds.filter(
    (id) => remainingOpponents(id, day.present, playedPairKeys) > 0
  );
  const benchDone = idleIds.filter(
    (id) => remainingOpponents(id, day.present, playedPairKeys) === 0
  );

  /* сортировка скамейки: меньше сыграли сегодня → выше (их пора звать) */
  const benchSorted = [...benchActive].sort((a, b) => {
    const ta = gamesToday.get(a) ?? 0;
    const tb = gamesToday.get(b) ?? 0;
    if (ta !== tb) return ta - tb;
    return (gamesTotal.get(a) ?? 0) - (gamesTotal.get(b) ?? 0);
  });

  /* пары очереди, которые встанут на столы прямо сейчас vs ждут */
  const callableCount = Math.max(0, freeTables);

  if (!hydrated) {
    return (
      <div className="container py-32 text-poster-muted">Загрузка табло…</div>
    );
  }

  /* ---------- рендер ---------- */
  return (
    <div className="poster-scope min-h-screen bg-poster-paper pb-40 text-poster-ink">
      <div className="container max-w-[1100px] pt-16">
        <Header
          tournamentName={tournamentName}
          present={day.present.length}
          tablesBusy={day.active.length}
          tableCount={day.tableCount}
          matchesToday={matchesTodayCount}
          playedAmongPresent={playedAmongPresent}
          totalPairs={totalPairsAmongPresent}
          onTableCount={setTableCount}
          onOpenPicker={() => setPickerOpen(true)}
          onShare={shareLink}
        />

        {day.present.length < 2 ? (
          <EmptyState onOpenPicker={() => setPickerOpen(true)} />
        ) : (
          <>
            {/* СТОЛЫ */}
            <Section
              title="Столы"
              right={
                <button
                  onClick={callNext}
                  disabled={freeTables <= 0 || queue.length === 0}
                  className="rounded-full bg-poster-clay px-16 py-8 text-[13px] font-bold uppercase tracking-wide text-poster-cream transition disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ▶ Вызвать следующих
                </button>
              }
            >
              <div className="grid grid-cols-1 gap-12 tablet:grid-cols-2 desktop:grid-cols-3">
                {Array.from({ length: day.tableCount }).map((_, i) => {
                  const tableNo = i + 1;
                  const m = day.active.find((a) => a.tableNo === tableNo);
                  // Порядковый номер пустого стола → своя пара из очереди,
                  // чтобы соседние свободные столы предлагали разные пары.
                  const emptyOrdinal = Array.from({ length: i }).filter(
                    (_, j) => !day.active.some((a) => a.tableNo === j + 1)
                  ).length;
                  const suggestion = queue[emptyOrdinal];
                  return m ? (
                    <TableCard
                      key={m.id}
                      match={m}
                      now={now}
                      player1={playerMap.get(m.player1Id)}
                      player2={playerMap.get(m.player2Id)}
                      onWin1={() => finishMatch(m, MatchResult.player1Win)}
                      onWin2={() => finishMatch(m, MatchResult.player2Win)}
                      onDraw={() => finishMatch(m, MatchResult.draw)}
                      onCancel={() => returnToQueue(m.id)}
                    />
                  ) : (
                    <EmptyTable
                      key={`empty-${tableNo}`}
                      tableNo={tableNo}
                      next={suggestion}
                      nextNames={
                        suggestion
                          ? [
                              shortName(suggestion.player1Id),
                              shortName(suggestion.player2Id),
                            ]
                          : null
                      }
                      onCall={() => suggestion && callPair(suggestion)}
                    />
                  );
                })}
              </div>
            </Section>

            {/* ОЧЕРЕДЬ */}
            <Section
              title="Очередь"
              subtitle="Кого звать дальше — сверху самые «заждавшиеся»"
            >
              {queue.length === 0 ? (
                <p className="text-[14px] text-poster-muted">
                  Сейчас свести некого: все свободные уже сыграли друг с другом.
                </p>
              ) : (
                <ol className="flex flex-col gap-8">
                  {queue.map((pair, idx) => (
                    <QueueRow
                      key={pairKey(pair.player1Id, pair.player2Id)}
                      idx={idx}
                      callableNow={idx < callableCount}
                      p1={playerMap.get(pair.player1Id)}
                      p2={playerMap.get(pair.player2Id)}
                      sub1={`${gamesToday.get(pair.player1Id) ?? 0} сег`}
                      sub2={`${gamesToday.get(pair.player2Id) ?? 0} сег`}
                      disabled={freeTables <= 0}
                      onCall={() => callPair(pair)}
                    />
                  ))}
                </ol>
              )}
            </Section>

            {/* СКАМЕЙКА */}
            <Section
              title="Скамейка"
              subtitle="Свободные игроки. Тапни двоих — сведём в пару вручную"
            >
              <div className="flex flex-wrap gap-8">
                {benchSorted.map((id) => (
                  <BenchChip
                    key={id}
                    player={playerMap.get(id)}
                    today={gamesToday.get(id) ?? 0}
                    total={gamesTotal.get(id) ?? 0}
                    remaining={remainingOpponents(id, day.present, playedPairKeys)}
                    selected={benchPick.includes(id)}
                    onClick={() => toggleBenchPick(id)}
                  />
                ))}
                {benchSorted.length === 0 && (
                  <p className="text-[14px] text-poster-muted">
                    Все свободные игроки сейчас за столами 👀
                  </p>
                )}
              </div>

              {benchDone.length > 0 && (
                <div className="mt-16">
                  <p className="mb-8 text-[12px] font-bold uppercase tracking-wide text-poster-muted">
                    Сыграли со всеми присутствующими
                  </p>
                  <div className="flex flex-wrap gap-8">
                    {benchDone.map((id) => (
                      <span
                        key={id}
                        className="flex items-center gap-[6px] rounded-full bg-[#0000000d] px-[10px] py-4 text-[13px] text-poster-muted"
                      >
                        <Avatar
                          src={playerMap.get(id)?.image ?? ""}
                          alt={name(id)}
                          className="h-20 w-20 rounded-full grayscale"
                        />
                        {shortName(id)} · {gamesToday.get(id) ?? 0} сег.
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          </>
        )}
      </div>

      {/* плавающая панель ручной пары */}
      {benchPick.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-poster-ink bg-poster-cream px-16 py-12">
          <div className="container flex max-w-[1100px] items-center justify-between gap-12">
            <div className="text-[14px] font-semibold">
              {benchPick.map(shortName).join("  vs  ")}
              {benchPickPlayed && (
                <span className="ml-8 text-poster-clay">уже играли</span>
              )}
            </div>
            <div className="flex gap-8">
              <button
                onClick={() => setBenchPick([])}
                className="rounded-full px-[14px] py-8 text-[13px] font-bold uppercase text-poster-muted"
              >
                Отмена
              </button>
              <button
                onClick={confirmBenchPair}
                disabled={benchPick.length !== 2 || benchPickPlayed || freeTables <= 0}
                className="rounded-full bg-poster-court px-[18px] py-8 text-[13px] font-bold uppercase tracking-wide text-poster-cream disabled:opacity-30"
              >
                На стол
              </button>
            </div>
          </div>
        </div>
      )}

      {pickerOpen && (
        <PresentPicker
          players={players}
          present={day.present}
          search={search}
          onSearch={setSearch}
          onToggle={togglePresent}
          onSelectAll={() =>
            setDay((d) => ({ ...d, present: players.map((p) => p.id) }))
          }
          onClear={() => setDay((d) => ({ ...d, present: [] }))}
          onClose={() => setPickerOpen(false)}
          gamesToday={gamesToday}
        />
      )}
    </div>
  );
}

/* ============================================================= */
/* Подкомпоненты                                                  */
/* ============================================================= */

function Header(props: {
  tournamentName: string;
  present: number;
  tablesBusy: number;
  tableCount: number;
  matchesToday: number;
  playedAmongPresent: number;
  totalPairs: number;
  onTableCount: (n: number) => void;
  onOpenPicker: () => void;
  onShare: () => void;
}) {
  const pct =
    props.totalPairs > 0
      ? Math.round((props.playedAmongPresent / props.totalPairs) * 100)
      : 0;
  return (
    <header className="mb-20">
      <div className="flex flex-wrap items-end justify-between gap-12">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-poster-clay">
            Табло организатора · v2
          </p>
          <h1 className="heading-m font-black leading-none">{props.tournamentName}</h1>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={props.onShare}
            aria-label="Поделиться ссылкой"
            className="rounded-full border-2 border-poster-ink px-[14px] py-8 text-[13px] font-bold uppercase tracking-wide text-poster-ink"
          >
            🔗 Поделиться
          </button>
          <button
            onClick={props.onOpenPicker}
            className="rounded-full border-2 border-poster-ink bg-poster-ink px-16 py-8 text-[13px] font-bold uppercase tracking-wide text-poster-cream"
          >
            👥 Кто пришёл · {props.present}
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8 tablet:grid-cols-4 desktop:grid-cols-4">
        <Stat label="Сыграно сегодня" value={props.matchesToday} />
        <Stat
          label="Пар закрыто"
          value={`${props.playedAmongPresent}/${props.totalPairs}`}
        />
        <Stat
          label="Столы заняты"
          value={`${props.tablesBusy}/${props.tableCount}`}
        />
        <div className="rounded-xl border-2 border-poster-ink/15 bg-[#ffffff66] px-[14px] py-[10px]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-poster-muted">
            Столов
          </p>
          <div className="mt-4 flex items-center gap-8">
            <button
              onClick={() => props.onTableCount(props.tableCount - 1)}
              className="h-[26px] w-[26px] rounded-full border-2 border-poster-ink text-[16px] font-bold leading-none"
            >
              −
            </button>
            <span className="w-20 text-center text-[18px] font-black">
              {props.tableCount}
            </span>
            <button
              onClick={() => props.onTableCount(props.tableCount + 1)}
              className="h-[26px] w-[26px] rounded-full border-2 border-poster-ink text-[16px] font-bold leading-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {props.totalPairs > 0 && (
        <div className="mt-12">
          <div className="h-8 w-full overflow-hidden rounded-full bg-[#0000001a]">
            <div
              className="h-full rounded-full bg-poster-court transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 text-[12px] text-poster-muted">
            Турнир пройден на {pct}% (среди пришедших сегодня)
          </p>
        </div>
      )}
    </header>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-poster-ink/15 bg-[#ffffff66] px-[14px] py-[10px]">
      <p className="text-[11px] font-bold uppercase tracking-wide text-poster-muted">
        {label}
      </p>
      <p className="mt-2 text-[22px] font-black leading-none">{value}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-24">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
        <div>
          <h2 className="text-[20px] font-black uppercase tracking-wide">{title}</h2>
          {subtitle && (
            <p className="text-[13px] text-poster-muted">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function TableCard({
  match,
  now,
  player1,
  player2,
  onWin1,
  onWin2,
  onDraw,
  onCancel,
}: {
  match: ActiveMatch;
  now: number;
  player1?: PlayerV2;
  player2?: PlayerV2;
  onWin1: () => void;
  onWin2: () => void;
  onDraw: () => void;
  onCancel: () => void;
}) {
  const elapsed = now - match.startedAt;
  return (
    <div className="overflow-hidden rounded-2xl border-[3px] border-[#1e4632] bg-white shadow-[4px_4px_0_0_#1e4632]">
      <div className="flex items-center justify-between bg-poster-court px-[14px] py-[6px] text-poster-cream">
        <span className="text-[13px] font-bold uppercase tracking-wide">
          Стол {match.tableNo}
        </span>
        <span className="font-mono text-[14px] tabular-nums">⏱ {fmtClock(elapsed)}</span>
      </div>
      <div className="p-12">
        <PlayerRow player={player1} onWin={onWin1} />
        <div className="my-8 flex items-center justify-center gap-12">
          <span className="h-px flex-1 bg-poster-ink/10" />
          <button
            onClick={onDraw}
            className="rounded-full border-2 border-poster-ink/25 px-16 py-[6px] text-[12px] font-bold uppercase tracking-wide text-poster-muted active:scale-95"
          >
            Ничья
          </button>
          <span className="h-px flex-1 bg-poster-ink/10" />
        </div>
        <PlayerRow player={player2} onWin={onWin2} />
      </div>
      <button
        onClick={onCancel}
        className="w-full border-t border-poster-ink/10 py-[10px] text-[12px] font-semibold text-poster-muted active:text-poster-clay"
      >
        ✕ Вернуть в очередь
      </button>
    </div>
  );
}

function PlayerRow({
  player,
  onWin,
}: {
  player?: PlayerV2;
  onWin: () => void;
}) {
  return (
    <div className="flex items-center gap-[10px] rounded-xl bg-[#00000008] p-8">
      <Avatar
        src={player?.image ?? ""}
        alt={player ? player.firstName : ""}
        className="h-[48px] w-[48px] shrink-0 rounded-full"
      />
      <p className="min-w-0 flex-1 truncate text-[17px] font-bold leading-tight">
        {player ? `${player.firstName} ${player.lastName}` : "—"}
      </p>
      <button
        onClick={onWin}
        className="shrink-0 rounded-full bg-poster-court px-[18px] py-12 text-[13px] font-black uppercase tracking-wide text-poster-cream transition active:scale-95"
      >
        Победа
      </button>
    </div>
  );
}

function EmptyTable({
  tableNo,
  next,
  nextNames,
  onCall,
}: {
  tableNo: number;
  next?: QueuePair;
  nextNames: [string, string] | null;
  onCall: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border-[3px] border-dashed border-poster-ink/25 bg-[#ffffff4d] p-[14px]">
      <span className="text-[13px] font-bold uppercase tracking-wide text-poster-muted">
        Стол {tableNo} · свободен
      </span>
      {next && nextNames ? (
        <button
          onClick={onCall}
          className="mt-12 rounded-xl bg-poster-ink px-[14px] py-12 text-left text-poster-cream transition hover:bg-poster-clay"
        >
          <span className="block text-[11px] font-bold uppercase tracking-wide opacity-70">
            Вызвать пару
          </span>
          <span className="mt-2 block text-[16px] font-bold">
            {nextNames[0]} — {nextNames[1]}
          </span>
        </button>
      ) : (
        <p className="mt-12 text-[13px] text-poster-muted">Нет пар в очереди</p>
      )}
    </div>
  );
}

function QueueRow({
  idx,
  callableNow,
  p1,
  p2,
  sub1,
  sub2,
  disabled,
  onCall,
}: {
  idx: number;
  callableNow: boolean;
  p1?: PlayerV2;
  p2?: PlayerV2;
  sub1: string;
  sub2: string;
  disabled: boolean;
  onCall: () => void;
}) {
  return (
    <li
      className={`flex items-stretch gap-[10px] rounded-xl border-2 p-8 ${
        callableNow
          ? "border-[#1e4632] bg-poster-court/5"
          : "border-poster-ink/10 bg-[#ffffff66]"
      }`}
    >
      <span
        className={`mt-2 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[13px] font-black ${
          callableNow ? "bg-poster-court text-poster-cream" : "bg-[#0000001a] text-poster-muted"
        }`}
      >
        {idx + 1}
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[6px]">
        <QPlayer player={p1} sub={sub1} />
        <QPlayer player={p2} sub={sub2} />
      </div>
      <button
        onClick={onCall}
        disabled={disabled}
        className="shrink-0 rounded-xl bg-poster-clay px-[14px] text-[13px] font-black uppercase tracking-wide text-poster-cream transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        На стол
      </button>
    </li>
  );
}

function QPlayer({ player, sub }: { player?: PlayerV2; sub: string }) {
  return (
    <div className="flex min-w-0 items-center gap-8">
      <Avatar
        src={player?.image ?? ""}
        alt={player ? player.firstName : ""}
        className="h-[34px] w-[34px] shrink-0 rounded-full"
      />
      <p className="min-w-0 flex-1 truncate text-[15px] font-bold leading-tight">
        {player ? `${player.firstName} ${player.lastName}` : "—"}
      </p>
      <span className="shrink-0 text-[11px] text-poster-muted">{sub}</span>
    </div>
  );
}

function BenchChip({
  player,
  today,
  total,
  remaining,
  selected,
  onClick,
}: {
  player?: PlayerV2;
  today: number;
  total: number;
  remaining: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-8 rounded-full border-2 py-4 pl-4 pr-12 transition ${
        selected
          ? "border-[#1e4632] bg-poster-court/15"
          : "border-poster-ink/15 bg-[#ffffff80] hover:border-poster-ink/40"
      }`}
    >
      <Avatar
        src={player?.image ?? ""}
        alt={player ? player.firstName : ""}
        className="h-32 w-32 rounded-full"
      />
      <div className="text-left">
        <p className="text-[14px] font-bold leading-tight">
          {player ? `${player.firstName} ${player.lastName.charAt(0)}.` : "—"}
        </p>
        <p className="text-[11px] text-poster-muted">
          {today} сег · {total} всего · ост. {remaining}
        </p>
      </div>
    </button>
  );
}

function EmptyState({ onOpenPicker }: { onOpenPicker: () => void }) {
  return (
    <div className="mt-32 rounded-2xl border-[3px] border-dashed border-poster-ink/25 bg-[#ffffff4d] p-32 text-center">
      <p className="text-[40px]">🏓</p>
      <h2 className="mt-8 text-[22px] font-black">Отметь, кто сегодня пришёл</h2>
      <p className="mx-auto mt-4 max-w-md text-[14px] text-poster-muted">
        Выбери игроков — и табло само начнёт предлагать справедливые пары:
        первыми будут те, кто меньше всех сыграл.
      </p>
      <button
        onClick={onOpenPicker}
        className="mt-16 rounded-full bg-poster-ink px-24 py-12 text-[14px] font-bold uppercase tracking-wide text-poster-cream"
      >
        👥 Отметить пришедших
      </button>
    </div>
  );
}

function PresentPicker({
  players,
  present,
  search,
  onSearch,
  onToggle,
  onSelectAll,
  onClear,
  onClose,
  gamesToday,
}: {
  players: PlayerV2[];
  present: number[];
  search: string;
  onSearch: (s: string) => void;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onClose: () => void;
  gamesToday: Map<number, number>;
}) {
  const presentSet = new Set(present);
  const q = search.trim().toLowerCase();
  const filtered = players
    .filter((p) =>
      q ? `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) : true
    )
    .sort((a, b) => {
      // присутствующие наверх, потом по фамилии
      const ap = presentSet.has(a.id) ? 0 : 1;
      const bp = presentSet.has(b.id) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      return a.lastName.localeCompare(b.lastName, "ru");
    });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-poster-paper">
      <div className="sticky top-0 z-10 border-b-[3px] border-poster-ink bg-poster-paper px-16 py-12">
        <div className="container flex max-w-[1100px] items-center justify-between gap-12">
          <h2 className="text-[20px] font-black uppercase">
            Кто пришёл · {present.length}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-poster-ink px-[18px] py-8 text-[13px] font-bold uppercase tracking-wide text-poster-cream"
          >
            Готово
          </button>
        </div>
        <div className="container mt-12 flex max-w-[1100px] flex-wrap items-center gap-8">
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Поиск по имени…"
            className="min-w-[180px] flex-1 rounded-full border-2 border-poster-ink/20 bg-white px-16 py-8 text-[15px] outline-none focus:border-poster-ink"
          />
          <button
            onClick={onSelectAll}
            className="rounded-full border-2 border-poster-ink px-[14px] py-8 text-[12px] font-bold uppercase tracking-wide"
          >
            Все из ростера
          </button>
          <button
            onClick={onClear}
            className="rounded-full border-2 border-poster-ink/30 px-[14px] py-8 text-[12px] font-bold uppercase tracking-wide text-poster-muted"
          >
            Сбросить
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-16 py-16">
        <div className="container grid max-w-[1100px] grid-cols-2 gap-8 tablet:grid-cols-3 desktop:grid-cols-4">
          {filtered.map((p) => {
            const on = presentSet.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id)}
                className={`flex items-center gap-[10px] rounded-xl border-2 p-8 text-left transition ${
                  on
                    ? "border-[#1e4632] bg-poster-court/10"
                    : "border-poster-ink/15 bg-[#ffffff80]"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar
                    src={p.image}
                    alt={p.firstName}
                    className={`h-[44px] w-[44px] rounded-full ${on ? "" : "grayscale"}`}
                  />
                  {on && (
                    <span className="absolute -bottom-[1px] -right-[1px] flex h-[18px] w-[18px] items-center justify-center rounded-full bg-poster-court text-[11px] text-poster-cream">
                      ✓
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold leading-tight">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-[11px] text-poster-muted">
                    {(gamesToday.get(p.id) ?? 0) > 0
                      ? `${gamesToday.get(p.id)} игр сегодня`
                      : "ещё не играл сегодня"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
