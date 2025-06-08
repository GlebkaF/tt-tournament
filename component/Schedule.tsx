"use client";
import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Button, List, Select, Spin, Modal, Empty, Typography } from "antd";
import { Player } from "@/app/interface";
import MatchForm from "./MatchForm";
import { Loading } from "./Loading";
const { Option } = Select;
const { Title, Text } = Typography;

interface Pair {
  player1Id: number;
  player2Id: number;
  player1Matches: number;
  player2Matches: number;
}

// Улучшенный алгоритм для генерации предложенной очереди с учетом закрепленных пар
function generateSuggestedQueue(allPairs: Pair[], fixedPairs: Pair[]): Pair[] {
  // 1. Создаем мапу для подсчета виртуальных игр (реальные + закрепленные)
  const virtualMatchCounts = new Map<number, number>();

  // Инициализируем виртуальными счетчиками из реальных данных
  allPairs.forEach((pair) => {
    if (!virtualMatchCounts.has(pair.player1Id)) {
      virtualMatchCounts.set(pair.player1Id, pair.player1Matches);
    }
    if (!virtualMatchCounts.has(pair.player2Id)) {
      virtualMatchCounts.set(pair.player2Id, pair.player2Matches);
    }
  });

  // 2. Добавляем +1 игру для каждого игрока в закрепленных парах (виртуально сыграли)
  const occupiedPlayerIds = new Set<number>();
  fixedPairs.forEach((pair) => {
    occupiedPlayerIds.add(pair.player1Id);
    occupiedPlayerIds.add(pair.player2Id);

    // Увеличиваем виртуальный счетчик игр
    virtualMatchCounts.set(
      pair.player1Id,
      (virtualMatchCounts.get(pair.player1Id) || 0) + 1
    );
    virtualMatchCounts.set(
      pair.player2Id,
      (virtualMatchCounts.get(pair.player2Id) || 0) + 1
    );
  });

  // 3. Создаем новый список пар с виртуальными счетчиками
  const virtualPairs: Pair[] = allPairs.map((pair) => ({
    ...pair,
    player1Matches:
      virtualMatchCounts.get(pair.player1Id) || pair.player1Matches,
    player2Matches:
      virtualMatchCounts.get(pair.player2Id) || pair.player2Matches,
  }));

  // 4. Сортируем пары по виртуальной сумме игр (приоритет меньшему количеству)
  const sortedVirtualPairs = virtualPairs.sort(
    (a, b) =>
      a.player1Matches +
      a.player2Matches -
      (b.player1Matches + b.player2Matches)
  );

  // 5. Генерируем предложенную очередь:
  // - Для свободных игроков: обычная логика
  // - Для занятых игроков: следующая лучшая пара для каждого
  const suggestedQueue: Pair[] = [];
  const usedPlayerIds = new Set<number>();

  // Сначала добавляем пары для свободных игроков
  for (const pair of sortedVirtualPairs) {
    if (
      !occupiedPlayerIds.has(pair.player1Id) &&
      !occupiedPlayerIds.has(pair.player2Id) &&
      !usedPlayerIds.has(pair.player1Id) &&
      !usedPlayerIds.has(pair.player2Id)
    ) {
      suggestedQueue.push(pair);
      usedPlayerIds.add(pair.player1Id);
      usedPlayerIds.add(pair.player2Id);
    }
  }

  // Затем для каждого занятого игрока ищем следующую лучшую пару
  occupiedPlayerIds.forEach((occupiedPlayerId) => {
    const nextBestPair = sortedVirtualPairs.find((pair) => {
      return (
        (pair.player1Id === occupiedPlayerId ||
          pair.player2Id === occupiedPlayerId) &&
        !usedPlayerIds.has(pair.player1Id) &&
        !usedPlayerIds.has(pair.player2Id) &&
        // Не должна пересекаться с уже закрепленными парами
        !fixedPairs.some(
          (fp) =>
            (fp.player1Id === pair.player1Id &&
              fp.player2Id === pair.player2Id) ||
            (fp.player1Id === pair.player2Id && fp.player2Id === pair.player1Id)
        )
      );
    });

    if (nextBestPair) {
      suggestedQueue.push(nextBestPair);
      usedPlayerIds.add(nextBestPair.player1Id);
      usedPlayerIds.add(nextBestPair.player2Id);
    }
  });

  return suggestedQueue;
}

// Функция для получения оставшихся пар (исключая предложенную очередь и закрепленные)
function getRemainingPairs(
  allPairs: Pair[],
  suggestedQueue: Pair[],
  fixedPairs: Pair[]
): Pair[] {
  // Все занятые игроки (из очереди и закрепленных)
  const occupiedPlayerIds = new Set<number>();

  [...suggestedQueue, ...fixedPairs].forEach((pair) => {
    occupiedPlayerIds.add(pair.player1Id);
    occupiedPlayerIds.add(pair.player2Id);
  });

  // Возвращаем пары, которых нет в предложенной очереди и закрепленных парах
  return allPairs.filter(
    (pair) =>
      !suggestedQueue.some(
        (sp) =>
          sp.player1Id === pair.player1Id && sp.player2Id === pair.player2Id
      ) &&
      !fixedPairs.some(
        (fp) =>
          fp.player1Id === pair.player1Id && fp.player2Id === pair.player2Id
      )
  );
}

const ScheduleComponent: React.FC<{ players: Player[] }> = ({ players }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [suggestedQueue, setSuggestedQueue] = useState<Pair[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [fixedPairs, setFixedPairs] = useState<Pair[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Извлечение состояния из URL при загрузке компонента
    const playersFromUrl = searchParams.get("selectedPlayers");
    const fixedPairsFromUrl = searchParams.get("fixedPairs");
    if (playersFromUrl) {
      setSelectedPlayers(playersFromUrl.split(",").map(Number));
    }
    if (fixedPairsFromUrl) {
      const parsedFixedPairs = JSON.parse(fixedPairsFromUrl);
      setFixedPairs(parsedFixedPairs);
    }
  }, [searchParams]);

  useEffect(() => {
    // Обновление URL-параметров при изменении состояния
    const updateUrl = (players: number[], fixedPairs: Pair[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (players.length > 0) {
        params.set("selectedPlayers", players.join(","));
      } else {
        params.delete("selectedPlayers");
      }
      if (fixedPairs.length > 0) {
        params.set("fixedPairs", JSON.stringify(fixedPairs));
      } else {
        params.delete("fixedPairs");
      }
      const url = `${pathname}?${params.toString()}`;
      window.history.replaceState({}, "", url);
    };
    updateUrl(selectedPlayers, fixedPairs);
  }, [selectedPlayers, fixedPairs, pathname, searchParams]);

  const handlePlayerSelect = (selected: number[]) => {
    setSelectedPlayers(selected);
  };

  const generatePairs = async () => {
    if (selectedPlayers.length < 2) return;
    setLoadingPairs(true);
    try {
      const res = await fetch("/api/pairs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerIds: selectedPlayers }),
      });
      const response: Pair[] = await res.json();
      setPairs(response);

      // Генерируем предложенную очередь
      const suggested = generateSuggestedQueue(response, fixedPairs);
      setSuggestedQueue(suggested);

      setLoadingPairs(false);
    } catch (error) {
      console.error(error);
      setLoadingPairs(false);
    }
  };

  const findPlayerById = (id: number) =>
    players.find((player) => player.id === id);

  const showModal = (pair: Pair) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedPair(null);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);

    if (selectedPair) {
      // Удаляем пару из закрепленных (если она там была)
      setFixedPairs((prev) =>
        prev.filter(
          (p) =>
            !(
              p.player1Id === selectedPair.player1Id &&
              p.player2Id === selectedPair.player2Id
            )
        )
      );

      // Удаляем пару из предложенной очереди (если она там была)
      setSuggestedQueue((prev) =>
        prev.filter(
          (p) =>
            !(
              p.player1Id === selectedPair.player1Id &&
              p.player2Id === selectedPair.player2Id
            )
        )
      );
    }

    setSelectedPair(null);
    generatePairs();
  };

  const fixPair = (pair: Pair) => {
    const newFixedPairs = [...fixedPairs, pair];
    setFixedPairs(newFixedPairs);

    // Пересчитываем предложенную очередь с новым алгоритмом
    if (pairs.length > 0) {
      const newSuggested = generateSuggestedQueue(pairs, newFixedPairs);
      setSuggestedQueue(newSuggested);
    }
  };

  const unfixPair = (pair: Pair) => {
    const newFixedPairs = fixedPairs.filter(
      (p) => !(p.player1Id === pair.player1Id && p.player2Id === pair.player2Id)
    );
    setFixedPairs(newFixedPairs);

    // Пересчитываем предложенную очередь с новым алгоритмом
    if (pairs.length > 0) {
      const newSuggested = generateSuggestedQueue(pairs, newFixedPairs);
      setSuggestedQueue(newSuggested);
    }
  };

  // Новая функция для закрепления пары из предложенной очереди
  const fixPairFromQueue = (pair: Pair) => {
    const newFixedPairs = [...fixedPairs, pair];
    setFixedPairs(newFixedPairs);

    // Пересчитываем предложенную очередь с новым алгоритмом
    if (pairs.length > 0) {
      const newSuggested = generateSuggestedQueue(pairs, newFixedPairs);
      setSuggestedQueue(newSuggested);
    }
  };

  return (
    <div className="container pb-32 pt-24">
      <Title level={3}>Расписание</Title>
      <Text>
        Отметь игроков которые пришли играть, нажми сформировать пары, вызывай
        пары играть, заноси результаты
      </Text>
      <div>
        <Select
          mode="multiple"
          style={{ width: "100%", marginBottom: "16px" }}
          placeholder="Выберите игроков"
          onChange={handlePlayerSelect}
          value={selectedPlayers} // Поддержка состояния при загрузке
          filterOption={(input, option) =>
            (option?.children
              ?.toString()
              ?.toLowerCase()
              ?.indexOf(input.toLowerCase()) ?? -1) >= 0
          }
          showSearch
        >
          {players.map((player) => (
            <Option key={player.id} value={player.id}>
              {`${player.firstName} ${player.lastName}`}
            </Option>
          ))}
        </Select>
        <Button
          type="primary"
          onClick={generatePairs}
          disabled={selectedPlayers.length < 2}
          style={{ marginBottom: "16px" }}
        >
          Сформировать Пары
        </Button>

        {/* Новый блок: Предложенная очередь */}
        {suggestedQueue.length > 0 && !loadingPairs && (
          <List
            style={{ marginBottom: "16px", backgroundColor: "#e6f7ff" }}
            header={<div>Предложенная очередь</div>}
            bordered
            dataSource={suggestedQueue}
            renderItem={(pair) => {
              const player1 = findPlayerById(pair.player1Id);
              const player2 = findPlayerById(pair.player2Id);
              return (
                <List.Item
                  actions={[
                    <Button
                      type="default"
                      key="1"
                      onClick={() => fixPairFromQueue(pair)}
                    >
                      Закрепить
                    </Button>,
                    <Button
                      type="primary"
                      key="2"
                      onClick={() => showModal(pair)}
                    >
                      Занести результат
                    </Button>,
                  ]}
                >
                  {player1 &&
                    player2 &&
                    `${player1.firstName} ${player1.lastName} (${pair.player1Matches} игр) vs ${player2.firstName} ${player2.lastName} (${pair.player2Matches} игр)`}
                </List.Item>
              );
            }}
          />
        )}

        {fixedPairs.length > 0 && (
          <List
            style={{ marginBottom: "16px", backgroundColor: "#52c41a32" }}
            header={<div>Закрепленные Пары</div>}
            bordered
            dataSource={fixedPairs}
            renderItem={(pair) => {
              const player1 = findPlayerById(pair.player1Id);
              const player2 = findPlayerById(pair.player2Id);
              return (
                <List.Item
                  actions={[
                    <Button
                      type="default"
                      key="1"
                      onClick={() => unfixPair(pair)}
                    >
                      Открепить
                    </Button>,
                    <Button
                      type="primary"
                      key="2"
                      onClick={() => showModal(pair)}
                    >
                      Занести результат
                    </Button>,
                  ]}
                >
                  {player1 &&
                    player2 &&
                    `${player1.firstName} ${player1.lastName} (${pair.player1Matches} игр) vs ${player2.firstName} ${player2.lastName} (${pair.player2Matches} игр)`}
                </List.Item>
              );
            }}
          />
        )}
        {loadingPairs ? (
          <Loading />
        ) : (
          <>
            {pairs.length > 0 ? (
              <List
                header={<div>Возможные Пары</div>}
                bordered
                dataSource={getRemainingPairs(
                  pairs,
                  suggestedQueue,
                  fixedPairs
                )} // Используем новую функцию для фильтрации
                renderItem={(pair) => {
                  const player1 = findPlayerById(pair.player1Id);
                  const player2 = findPlayerById(pair.player2Id);
                  return (
                    <List.Item
                      actions={[
                        <Button
                          type="default"
                          key="2"
                          onClick={() => fixPair(pair)}
                        >
                          Закрепить пару
                        </Button>,
                        <Button
                          type="primary"
                          key="3"
                          onClick={() => showModal(pair)}
                        >
                          Занести результат
                        </Button>,
                      ]}
                    >
                      {player1 &&
                        player2 &&
                        `${player1.firstName} ${player1.lastName} (${pair.player1Matches} игр) vs ${player2.firstName} ${player2.lastName} (${pair.player2Matches} игр)`}
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="Возможных пар нет, все сыграно" />
            )}
          </>
        )}
      </div>
      {selectedPair && (
        <Modal
          title="Занести результат"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
        >
          <MatchForm
            players={players}
            playedMatches={[]}
            onSubmit={handleFormSubmit}
            player1Id={selectedPair.player1Id}
            player2Id={selectedPair.player2Id}
          />
        </Modal>
      )}
    </div>
  );
};

const Schedule: React.FC<{ players: Player[] }> = (props) => (
  <Suspense fallback={<Loading />}>
    <ScheduleComponent {...props} />
  </Suspense>
);

export default Schedule;
