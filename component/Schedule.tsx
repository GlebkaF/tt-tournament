"use client";
import React, { useState } from "react";
import { Button, List, Select, Spin } from "antd";
import { Player, Pair } from "@/app/interface";

const { Option } = Select;

const Schedule: React.FC<{ players: Player[] }> = ({ players }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [pairs, setPairs] = useState<
    { player1Id: number; player2Id: number }[]
  >([]);
  const [loadingPairs, setLoadingPairs] = useState(false);

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
      const response = await res.json();
      setPairs(response);
      setLoadingPairs(false);
    } catch (error) {
      console.error(error);
      setLoadingPairs(false);
    }
  };

  const findPlayerById = (id: number) =>
    players.find((player) => player.id === id);

  return (
    <div className="container mx-auto px-4">
      <h1>Schedule Matches</h1>
      <div>
        <Select
          mode="multiple"
          style={{ width: "100%", marginBottom: "16px" }}
          placeholder="Выберите игроков"
          onChange={handlePlayerSelect}
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
        {loadingPairs ? (
          <Spin />
        ) : (
          pairs.length > 0 && (
            <List
              header={<div>Возможные Пары</div>}
              bordered
              dataSource={pairs}
              renderItem={(pair) => {
                const player1 = findPlayerById(pair.player1Id);
                const player2 = findPlayerById(pair.player2Id);
                return (
                  <List.Item>
                    {player1 &&
                      player2 &&
                      `${player1.firstName} ${player1.lastName} vs ${player2.firstName} ${player2.lastName}`}
                  </List.Item>
                );
              }}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Schedule;
