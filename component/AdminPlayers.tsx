"use client";

import { message } from "antd";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CURRENT_TOURNAMENT_NAME } from "@/app/const";
import {
  authHeader,
  clearPassword,
  ensurePassword,
  getStoredPassword,
  savePassword,
} from "@/utils/adminAuth";

interface AdminPlayer {
  id: number;
  firstName: string;
  lastName: string;
  telegram: string | null;
  hasDatabaseImage: boolean;
  inCurrentTournament: boolean;
}

async function readError(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return body?.error ?? "Неизвестная ошибка";
}

export default function AdminPlayers() {
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const adminFetch = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const password = ensurePassword();
      if (!password) throw new Error("Авторизация отменена");

      const headers = new Headers(init.headers);
      headers.set("Authorization", authHeader(password));
      const response = await fetch(input, { ...init, headers });

      if (response.status === 401) {
        clearPassword();
        throw new Error("Неверный пароль");
      }
      if (response.ok) savePassword(password);
      return response;
    },
    []
  );

  const loadPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminFetch("/api/admin/players");
      if (!response.ok) throw new Error(await readError(response));
      setPlayers((await response.json()) as AdminPlayer[]);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [adminFetch]);

  useEffect(() => {
    if (getStoredPassword()) void loadPlayers();
  }, [loadPlayers]);

  const createPlayer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/players", {
        method: "POST",
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(await readError(response));

      const player = (await response.json()) as AdminPlayer;
      message.success(
        `${player.lastName} ${player.firstName} добавлен(а) в турнир`
      );
      form.reset();
      await loadPlayers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const updatePhoto = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/players", {
        method: "PATCH",
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(await readError(response));

      message.success("Фотография обновлена");
      form.reset();
      await loadPlayers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const removeFromTournament = async (playerId: number) => {
    const player = players.find(({ id }) => id === playerId);
    if (!player) {
      message.error("Выберите игрока");
      return;
    }

    setSaving(true);
    try {
      const response = await adminFetch("/api/admin/players", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (!response.ok) throw new Error(await readError(response));

      message.success(
        `${player.lastName} ${player.firstName} больше не участвует в турнире`
      );
      await loadPlayers();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-4 w-full border-2 border-poster-ink bg-white px-12 py-8 text-m text-poster-ink";
  const buttonClass =
    "border-2 border-poster-ink bg-poster-ink px-16 py-8 font-bold uppercase tracking-[0.08em] text-poster-cream disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="container py-32 tablet:py-48">
      <header className="mb-24 border-b-[3px] border-poster-ink pb-16">
        <div className="caption-s font-bold uppercase tracking-[0.18em] text-poster-clay">
          Администрирование
        </div>
        <h1 className="mt-8 text-[36px] font-black uppercase leading-none tablet:text-[56px]">
          Игроки
        </h1>
      </header>

      {players.length === 0 && (
        <button
          className={buttonClass}
          onClick={() => void loadPlayers()}
          disabled={loading}
        >
          {loading ? "Загрузка…" : "Войти и загрузить игроков"}
        </button>
      )}

      <div className="mt-24 grid grid-cols-1 gap-20 desktop:grid-cols-2">
        <form
          onSubmit={createPlayer}
          className="border-[3px] border-poster-ink bg-poster-cream p-20"
        >
          <h2 className="text-[24px] font-black uppercase">Новый участник</h2>
          <div className="mt-4 caption-s font-bold uppercase tracking-[0.1em] text-poster-clay">
            {CURRENT_TOURNAMENT_NAME}
          </div>
          <p className="mt-8 text-m text-poster-muted">
            Игрок сразу попадёт в этот турнир, фото сохранится в БД.
          </p>

          <label className="mt-16 block font-bold">
            Имя
            <input className={inputClass} name="firstName" required />
          </label>
          <label className="mt-12 block font-bold">
            Фамилия
            <input className={inputClass} name="lastName" required />
          </label>
          <label className="mt-12 block font-bold">
            Telegram
            <input
              className={inputClass}
              name="telegram"
              placeholder="@username"
            />
          </label>
          <label className="mt-12 block font-bold">
            Фото
            <input
              className={inputClass}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </label>

          <button className={`${buttonClass} mt-16`} disabled={saving}>
            Добавить · {CURRENT_TOURNAMENT_NAME}
          </button>
        </form>

        <form
          onSubmit={updatePhoto}
          className="border-[3px] border-poster-ink bg-poster-cream p-20"
        >
          <h2 className="text-[24px] font-black uppercase">Заменить фото</h2>
          <p className="mt-4 text-m text-poster-muted">
            Подходит и для старых игроков: новое фото будет храниться в БД.
          </p>

          <label className="mt-16 block font-bold">
            Игрок
            <select
              className={inputClass}
              name="playerId"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Выберите игрока
              </option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.lastName} {player.firstName}
                  {player.hasDatabaseImage ? " · фото в БД" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-12 block font-bold">
            Новое фото
            <input
              className={inputClass}
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
            />
          </label>

          <button
            className={`${buttonClass} mt-16`}
            disabled={saving || players.length === 0}
          >
            Сохранить фото
          </button>
        </form>

        <section className="border-[3px] border-poster-clay bg-poster-cream p-20">
          <h2 className="text-[24px] font-black uppercase text-poster-clay-deep">
            Убрать из турнира
          </h2>
          <div className="mt-4 caption-s font-bold uppercase tracking-[0.1em] text-poster-clay">
            {CURRENT_TOURNAMENT_NAME}
          </div>
          <p className="mt-8 text-m text-poster-muted">
            Профиль, фото и матчи останутся в базе, но матчи перестанут
            учитываться в этом турнире. При повторном добавлении они вернутся.
          </p>

          <ul className="mt-16 max-h-[360px] overflow-y-auto border-2 border-poster-ink bg-white">
            {players
              .filter(({ inCurrentTournament }) => inCurrentTournament)
              .map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between gap-12 border-t border-poster-ink/20 px-12 py-8 first:border-t-0"
                >
                  <span className="font-bold">
                    {player.lastName} {player.firstName}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 border border-poster-clay px-8 py-4 caption-s font-bold uppercase text-poster-clay-deep hover:bg-poster-clay hover:text-white disabled:opacity-50"
                    disabled={saving}
                    onClick={() => void removeFromTournament(player.id)}
                  >
                    Убрать
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>

      {players.length > 0 && (
        <div className="mt-24 border-2 border-poster-ink bg-white p-16">
          <div className="font-black uppercase">
            Игроков в базе: {players.length}
          </div>
          <div className="mt-4 text-m text-poster-muted">
            С фото в БД:{" "}
            {players.filter((player) => player.hasDatabaseImage).length}
          </div>
          <div className="mt-2 text-m text-poster-muted">
            Участников «{CURRENT_TOURNAMENT_NAME}»: {" "}
            {players.filter((player) => player.inCurrentTournament).length}
          </div>
        </div>
      )}
    </div>
  );
}
