import Link from "next/link";

const MainPage = () => {
  return (
    <div className="container pt-8">
      <h2 className="text-3xl font-bold mb-4">Настольной теннис</h2>
      <h3 className="text-2xl font-semibold mb-8">Европейский берег</h3>
      <div className="mb-8">
        <p className="mt-2 text-gray-600">
          Хотите играть с нами? Напишите в&nbsp;
          <Link
            href="https://t.me/glebkaf"
            className="text-xl font-semibold text-blue-500 hover:underline"
            target="_blank" // чтобы открывать ссылку в новом окне
            rel="noopener noreferrer" // для безопасности
          >
            Telegram
          </Link>
          .
        </p>
      </div>
      <h3 className="text-2xl font-bold mb-4">Новости</h3>
      <div className="space-y-8">
        <div>
          <Link
            href="/post/random-pairs-2024"
            className="text-xl font-semibold text-blue-500 hover:underline"
          >
            Случайные пары 2024
          </Link>
          <p className="mt-2 text-gray-600">
            Результаты второго парного турнира &ldquo;Случайные пары
            2024&rdquo;, который прошел 20 июля 2024 года.
          </p>
        </div>
        {/* Вы можете добавлять больше новостей здесь */}
      </div>
    </div>
  );
};

export default MainPage;
