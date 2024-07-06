"use client";

import { Typography, List, Card } from "antd";

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

const PlayerProfile: React.FC<PlayerProfileProps> = ({
  player,
  matchDetails,
}) => {
  return (
    <div>
      <Title level={2}>Профиль игрока</Title>
      <Card>
        <Title level={3}>{player.name}</Title>
        <Text>Сыграно матчей: {player.gamesPlayed}</Text>
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
