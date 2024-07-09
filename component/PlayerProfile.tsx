"use client";

import { Typography, List, Card } from "antd";
import React from "react";

const { Title, Text } = Typography;

interface MatchDetail {
  opponent: string;
  result: string;
}

interface PlayerProfileProps {
  player: {
    id: number;
    name: string;
    gamesPlayed: number;
  };
  matchDetails: {
    round: number;
    matches: MatchDetail[];
  }[];
}

const getMatchResultStyle = (result: string): React.CSSProperties => {
  switch (result) {
    case "PLAYER1_WIN":
      return { backgroundColor: "#f6ffed", color: "#52c41a" }; // Green for win
    case "PLAYER2_WIN":
      return { backgroundColor: "#fff1f0", color: "#f5222d" }; // Red for loss
    case "DRAW":
      return { backgroundColor: "#fffbe6", color: "#faad14" }; // Yellow for draw
    default:
      return {};
  }
};

const calculateStatistics = (matchDetails: MatchDetail[]) => {
  let wins = 0;
  let draws = 0;
  let losses = 0;

  matchDetails.forEach((match) => {
    if (match.result === "PLAYER1_WIN") wins += 1;
    else if (match.result === "PLAYER2_WIN") losses += 1;
    else if (match.result === "DRAW") draws += 1;
  });

  let score = wins * 3 + draws * 2 + losses * 1;

  return { wins, draws, losses, score };
};

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  matchDetails,
}) => {
  const allMatches = matchDetails.flatMap((round) => round.matches);
  const { wins, draws, losses, score } = calculateStatistics(allMatches);

  return (
    <div>
      <Title level={2}>Профиль игрока</Title>
      <Card>
        <Title level={3}>{player.name}</Title>
        <Text>Сыграно матчей: {player.gamesPlayed}</Text>
        <br />
        <Text>
          Побед: {wins}, Ничьих: {draws}, Поражений: {losses}
        </Text>
        <br />
        <Text>Очков: {score}</Text>
      </Card>
      <Title level={3} style={{ marginTop: "32px" }}>
        Матчи по турам
      </Title>
      {matchDetails.map((round) => (
        <Card
          key={round.round}
          title={`Тур ${round.round}`}
          style={{ marginBottom: "16px" }}
        >
          <List
            itemLayout="horizontal"
            dataSource={round.matches}
            renderItem={(match) => (
              <List.Item style={getMatchResultStyle(match.result)}>
                <List.Item.Meta
                  title={<Text strong>{match.opponent}</Text>}
                  description={
                    match.result === "PLAYER1_WIN"
                      ? "Победил(а)"
                      : match.result === "PLAYER2_WIN"
                      ? "Проиграл(а)"
                      : "Ничья"
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}
    </div>
  );
};

export default PlayerProfile;
