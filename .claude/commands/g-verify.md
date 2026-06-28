---
name: g-verify
description: Собирает HTML-отчёт по текущей итерации со скриншотами/curl/проверками. Запускай в конце итерации. Адаптировано под tt-tournament (Next.js App Router, локальный Postgres, agent-browser).
---

Ты собираешь **verification report** по текущей итерации — HTML с наглядными пруфами того, что работает. Юзер откроет его, пролистает, убедится.

Это форк explee-овского g-verify под стек tt-tournament: Next.js (App Router) + Prisma + Postgres, публичные страницы без авторизации, прод на `https://ebtt.ru` / x260. Локально dev гоняется на :3000.

## 1. Определи scope итерации

Не спрашивай — вычисли сам:

1. Текущая ветка: `git branch --show-current`
2. Если `main` → scope = последние 1-3 коммита + uncommitted (`git log --oneline -5`, `git status --short`)
3. Если feature-ветка:
   - PR: `gh pr view --json number,baseRefName 2>/dev/null`
   - Есть → `{base}...HEAD` + uncommitted; нет → `main...HEAD` + uncommitted
4. Покажи юзеру 1-2 строкой: "Итерация: {N} коммитов + {M} uncommitted на `{branch}`. PR: #{num}/'не открыт'. Продолжаю."

⚠️ В этом репозитории рабочее дерево часто содержит **несколько параллельных правок**. Если в scope попало больше, чем ждёт юзер, — перечисли файлы и уточни, что именно проверяем.

## 2. Классифицируй изменения

`git diff {base}...HEAD --name-only` + `git status --short`. Раскидай по типам:

- **visual** — `component/**/*.tsx`, `app/**/*.tsx`, `app/**/*.css`, `tailwind.config.*`
- **api** — `app/api/**/route.ts`
- **logic** — `service/**`, `helpers/**`, `utils/**`, `lib/**` без UI
- **db** — `prisma/schema.prisma`, `prisma/migrations/**`, `command/seed-*.ts`
- **config** — `*.json`, `*.mjs`, `next.config.*`, `.env*`, `docker-compose*`, `.github/**`
- **docs** — `*.md`

Один коммит может попасть в несколько категорий — это норм.

## 3. Подними окружение

**Локальный Postgres + dev-сервер (НЕ трогая прод):**
- Postgres 16 (brew): `/opt/homebrew/opt/postgresql@16/bin/pg_ctl -D /opt/homebrew/var/postgresql@16 status` (стартовать, если не запущен).
- БД `tt_local`, роль `tt`/`tt`. Клиент: полный путь `/opt/homebrew/opt/postgresql@16/bin/psql "postgresql://tt:tt@localhost:5432/tt_local"`.
- Dev-сервер: `npx dotenv -e .env.local -- npm run dev` (run_in_background). Жди строку `Ready in` в логе, выясни порт (`localhost:30NN` — бывает 3000 или 3001, если 3000 занят).
- `CURRENT_TOURNAMENT_ID` (`app/const.ts`) = 4. Запись матчей разрешена только в турнир 4.

**⚠️ Известная нестабильность dev-сервера (Next 15.x):**
В репо конфликт `app/favicon.ico` + `public/favicon.ico`. Когда браузер запрашивает `/favicon.ico`, Next 500-ит → компилит `/_error` и `/_not-found` → после этого **всё дерево начинает отдавать 404** (включая `/_next/static/*.css`). Поэтому:
- Прогрей нужный маршрут через `curl` (он скомпилит роут), убедись что в HTML есть ожидаемый контент.
- Делай **agent-browser screenshot с первого захода после свежего `npm run dev`** — до того, как сервер словит каскад. На каждую страницу — свой свежий старт, если нужно.
- Альтернатива (стабильнее, но дольше): прод-режим `npx dotenv -e .env.local -- npm run build && npx next start -p 3005`. Минус: локально `next start` иногда отдаёт `/_next/static/*` с HTTP 400 (рассчитан на Caddy-прокси) → страница без стилей. Для стилизованных скриншотов надёжнее dev-first-load.

**Seed тестовых данных:** если для страницы нужны матчи — вставь через psql, **запомни id для cleanup**:
```bash
psql "$URL" -c "insert into \"Match\" (\"player1Id\",\"player2Id\",\"player1Score\",\"player2Score\",result,date,\"tournamentId\") values
 (20,1,11,5,'PLAYER1_WIN','2026-06-25',4) on conflict do nothing;"
```

## 4. Собери evidence по каждой категории

Скип пустую категорию.

### visual
- Найди ключевые страницы из diff (`app/**/page.tsx`, изменённые `component/*.tsx` → на каких роутах используются). Собери URL'ы.
- При нужде создай минимальные фикстуры (см. seed выше).
- **Скриншоты:** `agent-browser batch --viewport 1440x900 --screenshot-dir /tmp/g-verify "open http://localhost:{PORT}{url}" "wait 2500" "screenshot --full {NN-slug}.png"`.
  - **Баг agent-browser:** `--screenshot-dir` часто игнорируется → файл падает в **cwd проекта**. После батча сразу: `mv ./0*-*.png /tmp/g-verify/ 2>/dev/null`. И вычисти любые посторонние `*.png` из корня репо, чтоб не закоммитить.
  - `--full` — полноразмерный скрин (а не только вьюпорт).
- Скриншоть edge cases: профиль без матчей (`/players/{id}` игрока с 0 встреч), 404 для несуществующего id, empty state.
- **Проверяй каждый PNG через Read** — если поймал 404/оверлей ошибки/нестилизованный HTML, это dev-каскад (см. §3): рестартни dev и сними заново с первого захода.

### api
- Подними dev. Публичные GET — просто `curl -s -w "\nHTTP %{http_code} | %{time_total}s" {url}`.
- Для защищённых (admin) ручек — покажи и 200, и 401/403 (с валидным/невалидным auth). Auth в проекте: Telegram-cookie (jose) + `isAdmin`.
- Запиши: endpoint, method, request, response (pretty JSON), timing, status.

### logic
- `npx tsc --noEmit` — обязательно, приложи вывод.
- Если есть тесты (`*.test.ts`) для изменённого — `npx jest {path}` / `npm test`, приложи вывод. Нет тестов — отметь красным.
- Подтверди поведение через `curl` + `grep` по HTML (напр. `grep -c "Неизвестный"` = 0).

### db
- Diff `prisma/schema.prisma`. Для миграций — покажи SQL миграции.

### config / docs
- config — diff в табличке (было → стало). docs — список изменённых md.

## 5. Собери HTML-отчёт

Путь: `/tmp/g-verify/report.html`. Картинки лежат рядом, HTML ссылается относительно (`<img src="./01-x.png">`). Перед генерацией: `rm -rf /tmp/g-verify && mkdir -p /tmp/g-verify` (но если скриншоты уже сняты — не сноси их).

Структура: hero (название итерации + ветка/PR/дата + grid статистики) → summary → секция на категорию (badge + заголовок + пруфы) → footer (`/g-verify` для повтора).

**Стиль — тёмная тема Vercel/Linear:**
- Palette: bg `#0a0a0a`, fg `#e5e7eb`, muted `#94a3b8`, brand `#00FBBC`, card `#141416`, border `#1f1f23`.
- Шрифт: `-apple-system,"Inter",system-ui,sans-serif`; код `"JetBrains Mono",Menlo,monospace`.
- Hero: радиальный градиент `radial-gradient(circle at 20% 0%, rgba(0,251,188,0.15), transparent 50%)`, h1 44-52px/700, сабтайтл muted, справа grid статов (32px bold brand + подпись muted 11px uppercase).
- Карточки: `card` bg, `border`, radius 16px, padding 28px; hover `border-color:rgba(0,251,188,.3); translateY(-2px)`. Badge типа слева (UI/API/DB/TEST/FIX — каждый своего цвета).
- Картинки: radius 10px, `box-shadow:0 8px 24px rgba(0,0,0,.45)`, hover scale 1.01. Грид `repeat(auto-fit,minmax(420px,1fr))` если 2+.
- `<pre>`: bg `#000`, подсветь HTTP-метод/статус (2xx зелёный, 4xx оранжевый), JSON-ключи `#7dd3fc`, строки `#86efac`, числа `#f9a8d4` простой regex-заменой. Тайминги — pill-бейдж.
- Штрихи: `scroll-behavior:smooth`, `<hr>` градиентный, fade-in карточек. Не лепи всё — 2-3 акцента. Отчёт должен быть **сочным**, чтобы юзер улыбнулся.

После генерации: `open /tmp/g-verify/report.html`.

## 6. Cleanup

- **Удали seed-фикстуры из БД** (по id, что запомнил) — фейковые результаты не должны остаться в `tt_local`.
- Вычисти посторонние `*.png` из корня репо (баг agent-browser).
- НЕ останавливай dev server (юзер может ещё пользоваться) — но скажи, на каком порту он остался.
- НЕ коммить `/tmp/g-verify/`.

## Финальный ответ юзеру

Одна строка: `Отчёт: /tmp/g-verify/report.html — {N} checkpoint'ов ({visual} visual, {api} api, ...). Открыл в браузере.`
Плюс отдельно отметь любые замечания по ходу (нестабильность dev, посторонние правки в дереве, пропущенные тесты).
