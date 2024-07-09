"use client";

import { Match, MatchResult } from "@/app/interface";
import { Typography, Card, List } from "antd";
import dayjs from "dayjs";

const { Title } = Typography;

interface MatchListProps {
  matches: Match[];
}

const groupMatchesByDate = (matches: Match[]) => {
  const grouped: { [key: string]: Match[] } = {};

  matches.forEach((match) => {
    const date = dayjs(match.date).format("YYYY-MM-DD");
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(match);
  });

  // Sort each group by ID and the groups by descending date
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => b.id - a.id); // Sort by ID
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf()
  );
  const sortedGroupedMatches: { [key: string]: Match[] } = {};
  sortedDates.forEach((date) => {
    sortedGroupedMatches[date] = grouped[date];
  });

  return sortedGroupedMatches;
};

const getMatchResultStyle = (
  _: any,
  isWinner: boolean,
  isDraw: boolean
): React.CSSProperties => {
  const baseStyle: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
  };
  if (isDraw) {
    return { ...baseStyle, backgroundColor: "#fffbe6", color: "#faad14" };
  }
  if (isWinner) {
    return { ...baseStyle, backgroundColor: "#f6ffed", color: "#52c41a" };
  }
  return {};
};

const MatchList: React.FC<MatchListProps> = ({ matches }) => {
  const groupedMatches = groupMatchesByDate(matches);

  return (
    <div style={{ marginTop: 32, padding: "0 16px" }}>
      <Title level={4}>Сыгранно {matches.length} матчей</Title>
      {Object.keys(groupedMatches).map((date) => (
        <Card
          key={date}
          title={dayjs(date).format("DD MMMM YYYY")}
          style={{ marginBottom: 16 }}
        >
          <List
            itemLayout="horizontal"
            dataSource={groupedMatches[date]}
            renderItem={(match) => {
              const isDraw = match.result === MatchResult.draw;
              const player1Style = getMatchResultStyle(
                match.result,
                match.result === MatchResult.player1Win,
                isDraw
              );
              const player2Style = getMatchResultStyle(
                match.result,
                match.result === MatchResult.player2Win,
                isDraw
              );
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "start",
                          }}
                        >
                          <span style={player1Style}>
                            {match.player1.firstName} {match.player1.lastName}
                          </span>
                        </span>
                        <span
                          style={{
                            flex: 0,
                            margin: "0 8px",
                            textAlign: "center",
                            minWidth: "40px",
                          }}
                        >
                          vs
                        </span>
                        <span
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "end",
                          }}
                        >
                          <span style={player2Style}>
                            {match.player2.firstName} {match.player2.lastName}
                          </span>
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </Card>
      ))}
    </div>
  );
};

export default MatchList;
