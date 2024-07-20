import Link from "next/link";

const MainPage = () => {
  return (
    <div className="container pt-8">
      <h2 className="text-3xl font-bold mb-4">Настольной теннис</h2>
      <h3 className="text-2xl font-semibold mb-8">Европейский берег</h3>
      <div className="space-y-8">
        <div>
          <Link
            href="/post/random-pairs-2024"
            className="text-xl font-semibold text-blue-500 hover:underline"
          >
            Случайные пары 2024
          </Link>
          <p className="mt-2 text-gray-600">
            Результаты второго парного турнира "Случайные пары 2024", прошедшего
            в Новосибирске, на микрорайоне Европейский Берег 20 июля 2024 года.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
