"use client";
import { Player, Match, MatchResult } from "@/app/interface";
import { useState, useMemo, useEffect } from "react";
import { Form, Select, Button, message, Typography, DatePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

interface MatchFormProps {
  players: Player[];
  playedMatches: Match[];
  onSubmit: () => void;
}

const MatchForm: React.FC<MatchFormProps> = ({
  players,
  playedMatches,
  onSubmit,
}) => {
  // Sort players by last name
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) =>
      (a.lastName || "" + a.firstName || "").localeCompare(
        b.lastName || "" + b.firstName || ""
      )
    );
  }, [players]);

  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [result, setResult] = useState<MatchResult>(MatchResult.draw);
  const [matchDate, setMatchDate] = useState(dayjs());
  const [errorMessage, setErrorMessage] = useState<string>("");

  const getOpponents = useMemo(
    () => (playerId: number | null) => {
      if (!playerId) return [];
      return sortedPlayers.filter((player) => {
        if (player.id === playerId) return false;
        const match = playedMatches.find(({ player1, player2 }) => {
          const mPlayers = [player1.id, player2.id].sort();
          const pPlayers = [player.id, playerId].sort();
          return mPlayers[0] === pPlayers[0] && mPlayers[1] === pPlayers[1];
        });
        return !match;
      });
    },
    [sortedPlayers, playedMatches]
  );

  useEffect(() => {
    setPlayer2Id(null);
  }, [player1Id]);

  const handleSubmit = async () => {
    if (player1Id === null || player2Id === null) {
      setErrorMessage("All fields are required.");
      return;
    }
    if (player1Id === player2Id) {
      setErrorMessage("Players must be different.");
      return;
    }

    const scores = {
      [MatchResult.player1Win]: { player1Score: 3, player2Score: 1 },
      [MatchResult.player2Win]: { player1Score: 1, player2Score: 3 },
      [MatchResult.draw]: { player1Score: 2, player2Score: 2 },
    };
    const { player1Score, player2Score } = scores[result];
    const res = await fetch("/api/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        result,
        date: matchDate.format("YYYY-MM-DD"),
      }),
    });
    if (res.ok) {
      message.success("Match recorded successfully!");
      onSubmit(); // Refresh matches after submission
      setPlayer2Id(null);
    } else {
      message.error("There was an error recording the match.");
    }
  };

  const getPlayerName = (id: number | null) => {
    const player = players.find((p) => p.id === id);
    return player ? `${player.lastName || ""} ${player.firstName}`.trim() : "";
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      className="p-4 bg-white shadow-md rounded-lg w-full max-w-lg mx-auto"
    >
      <Title level={3}>Запись результат матча</Title>
      <Form.Item label="Игрок 1" required>
        <Select
          showSearch
          value={player1Id || undefined}
          onChange={setPlayer1Id}
          placeholder="Выберите игрока"
          optionFilterProp="children"
          size="large"
          filterOption={(input, option) =>
            (option?.children
              ?.toString()
              ?.toLowerCase()
              ?.indexOf(input.toLowerCase()) ?? -1) >= 0
          }
        >
          {sortedPlayers.map((player) => (
            <Option key={player.id} value={player.id}>
              {`${player.lastName || ""} ${player.firstName}`.trim()}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Игрок 2" required>
        <Select
          showSearch
          value={player2Id || undefined}
          onChange={setPlayer2Id}
          placeholder="Выберите игрока"
          optionFilterProp="children"
          size="large"
          filterOption={(input, option) =>
            (option?.children
              ?.toString()
              ?.toLowerCase()
              ?.indexOf(input.toLowerCase()) ?? -1) >= 0
          }
          disabled={!player1Id}
        >
          {getOpponents(player1Id).map((player) => (
            <Option key={player.id} value={player.id}>
              {`${player.lastName || ""} ${player.firstName}`.trim()}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Дата матча" required>
        <DatePicker
          value={matchDate}
          onChange={setMatchDate}
          size="large"
          className="w-full"
        />
      </Form.Item>
      <Form.Item label="Результат" required>
        <div className="space-y-3">
          <Button
            type={result === MatchResult.player1Win ? "primary" : "default"}
            onClick={() => setResult(MatchResult.player1Win)}
            size="large"
            block
            disabled={!player1Id || !player2Id}
          >
            Победил(а) {getPlayerName(player1Id)}
          </Button>
          <Button
            type={result === MatchResult.draw ? "primary" : "default"}
            onClick={() => setResult(MatchResult.draw)}
            size="large"
            block
            disabled={!player1Id || !player2Id}
          >
            Ничья
          </Button>
          <Button
            type={result === MatchResult.player2Win ? "primary" : "default"}
            onClick={() => setResult(MatchResult.player2Win)}
            size="large"
            block
            disabled={!player1Id || !player2Id}
          >
            Победил(а) {getPlayerName(player2Id)}
          </Button>
        </div>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          block
          disabled={!player1Id || !player2Id}
        >
          Сохранить
        </Button>
        {errorMessage && (
          <Text type="danger" className="mt-4">
            {errorMessage}
          </Text>
        )}
      </Form.Item>
    </Form>
  );
};

export default MatchForm;
