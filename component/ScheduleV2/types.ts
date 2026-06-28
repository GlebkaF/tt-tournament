import { MatchResult } from "@/app/interface";

/** Игрок с аватаркой — то, что приходит с сервера в v2. */
export interface PlayerV2 {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}

/** Уже сыгранный матч (плоский, сериализуемый). */
export interface PlayedMatch {
  player1Id: number;
  player2Id: number;
  result: MatchResult;
  /** ISO-строка даты матча. */
  date: string;
}

/** Матч, который прямо сейчас идёт на столе. */
export interface ActiveMatch {
  /** Локальный id (счётчик), нужен для key и удаления. */
  id: string;
  tableNo: number;
  player1Id: number;
  player2Id: number;
  /** epoch ms старта — для таймера. */
  startedAt: number;
}

/** Состояние «игрового дня», которое переживает перезагрузку (localStorage). */
export interface DayState {
  present: number[];
  tableCount: number;
  active: ActiveMatch[];
  /** Монотонный счётчик для id столов/матчей. */
  seq: number;
}

/** Пара-кандидат из очереди. */
export interface QueuePair {
  player1Id: number;
  player2Id: number;
}
