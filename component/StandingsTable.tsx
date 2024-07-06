"use client";

import { Table, Typography } from "antd";
import { useMediaQuery } from "react-responsive";

const { Title } = Typography;

interface StandingsTableProps {
  standings: {
    position: number;
    player: string;
    rounds: number[];
    totalPoints: number;
    gamesPlayed: number;
    league: string;
  }[];
}

const generateColumns = (roundsCount: number, isMobile: boolean) => {
  if (isMobile) {
    return [
      {
        title: "Место",
        dataIndex: "position",
        key: "position",
        align: "center" as const,
        render: (text: any) => <strong>{text}</strong>,
      },
      {
        title: "Участник",
        dataIndex: "player",
        key: "player",
        align: "left" as const,
      },
      {
        title: "Итого",
        dataIndex: "totalPoints",
        key: "totalPoints",
        align: "center" as const,
      },
    ];
  }

  const roundsColumns = Array.from({ length: roundsCount }, (_, index) => ({
    title: (index + 1).toString(),
    dataIndex: `round${index + 1}`,
    key: `round${index + 1}`,
    align: "center" as const,
  }));

  return [
    {
      title: "Место",
      dataIndex: "position",
      key: "position",
      align: "center" as const,
      render: (text: any) => <strong>{text}</strong>,
    },
    {
      title: "Участник",
      dataIndex: "player",
      key: "player",
      align: "left" as const,
    },
    ...roundsColumns,
    {
      title: "Итого",
      dataIndex: "totalPoints",
      key: "totalPoints",
      align: "center" as const,
    },
    {
      title: "Сыграно игр",
      dataIndex: "gamesPlayed",
      key: "gamesPlayed",
      align: "center" as const,
    },
    {
      title: "Лига",
      dataIndex: "league",
      key: "league",
      align: "center" as const,
    },
  ];
};

const StandingsTable: React.FC<StandingsTableProps> = ({ standings }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const roundsCount = standings.length > 0 ? standings[0].rounds.length : 0;
  const columns = generateColumns(roundsCount, isMobile);

  const dataSource = standings.map((standing, index) => ({
    key: index + 1,
    position: standing.position,
    player: standing.player,
    ...standing.rounds.reduce(
      (obj, round, i) => ({
        ...obj,
        [`round${i + 1}`]: round,
      }),
      {}
    ),
    totalPoints: standing.totalPoints,
    gamesPlayed: standing.gamesPlayed,
    league: standing.league,
  }));

  return (
    <div>
      <Title level={3}>Сводная таблица турнира</Title>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        bordered
        size="middle"
      />
    </div>
  );
};

export default StandingsTable;
