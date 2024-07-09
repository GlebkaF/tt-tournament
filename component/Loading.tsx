"use client";
import { Spin, Typography } from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

function getLoadingText() {
  const loadingTexts = [
    "Загружаем данные...",
    "Собираем мячики...",
    "Полируем ракетки...",
    "Протираем стол...",
    "Натягиваем сетку...",
    "Ищем мячики...",
    "Разгоняем тучи...",
    "Рассчитываем скорость ветра...",
  ];
  const randomText = Math.floor(Math.random() * loadingTexts.length);
  return loadingTexts[randomText];
}

export const Loading = () => {
  const [loadingText, setLoadingText] = useState("Загружаем данные...");

  useEffect(() => {
    setLoadingText(getLoadingText());
    const interval = setInterval(() => {
      setLoadingText(getLoadingText());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Spin size="large" style={{ marginBottom: "4px" }}></Spin>
      <Text>{loadingText}</Text>
    </div>
  );
};
