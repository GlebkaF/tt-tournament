!!!!!!This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

https://www.figma.com/design/weFiVew7WJSYOhHi4okZuf/TTEVB?node-id=0-1&t=gy0cD7EFoDNNGhIr-1

## Getting Started!

First, run the development server:

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

### запуск команд

#### Произвольная команда

npx dotenv -e .env.local -- npx tsx command/seed-players.ts
npx dotenv -e .env.local -- npx tsx command/seed-missing-players.ts

#### Админка игроков

`/admin/players` позволяет создать игрока и сразу добавить его в текущий
турнир, убрать участника без удаления профиля, а также загрузить новое фото
существующему игроку. При исключении игрока его матчи остаются в БД, но не
учитываются в турнире; повторное добавление возвращает их. Используется тот же
Basic Auth, что и для записи результатов.

Новые фото хранятся в PostgreSQL; старые файловые фото продолжают работать как
fallback. На x260 необходимая схема применяется автоматически при деплое. Для
локальной базы:

```bash
npx dotenv -e .env.local -- npx prisma migrate deploy
```

#### Создать миграцию

(!) Добавь DATABASE_URL в .env.local

npx dotenv -e .env.local -- npx prisma migrate dev --name

### Бэкапы БД

Дневные дампы Postgres с x260 пушатся в приватный репозиторий: https://github.com/GlebkaF/tt-tournament-backups (cron 04:00 UTC = 07:00 МСК, скрипт `/opt/tt-tournament-data/backup.sh` на x260).

Восстановление:

```
gunzip -c dumps/tt-LATEST.sql.gz | docker exec -i tt-tournament-postgres psql -U tt -d tt
```

### Ежедневная Telegram-сводка

В 22:00 по Новосибирску (`15:00 UTC`) сервис публикует текстовую «Вечернюю
подачу» в тему «Болталка». Если за день нет матчей, пост не создаётся. Первый
запуск фиксирует список матчей дня; повторные cron-вызовы идемпотентны и нужны
только для восстановления после временного сбоя.

Сводка содержит общую статистику и до трёх фактических событий. Код вычисляет
личные серии, победные серии, игровые марафоны, рубежи и изменения таблицы, а
OpenAI выбирает самые интересные карточки через Structured Outputs. При любой
ошибке OpenAI используется детерминированный шаблон.

Локальный просмотр без отправки:

```bash
npm run digest:dry-run -- --date=2026-07-14
```

Для production нужны GitHub Actions Secrets: `OPENAI_API_KEY`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_THREAD_ID` и
`DIGEST_CRON_SECRET`. `HTTPS_PROXY` безопасно наследуется при деплое из уже
работающего на x260 контейнера `pesiki-bot`; значение в логи не выводится.

При деплое webhook бота и меню команд регистрируются автоматически. Команда
`/remaining` («С кем мне осталось сыграть») отвечает в той же Telegram-теме.
Если игрок ещё не привязан, бот предлагает выполнить `/start`: команда находит
игрока по `@username` из админки и сохраняет его стабильный `telegramId`. При
первой привязке бот отправляет администратору `@glebkaf` в личку сообщение вида
`Новая привязка: Фамилия Имя → @username`; повторный `/start` это сообщение не
дублирует и существующий `telegramId` не перезаписывает. Чтобы бот мог писать
администратору в личку, `@glebkaf` должен первым выполнить `/start`.
