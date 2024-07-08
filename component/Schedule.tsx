"use client";
import React, { useState } from "react";
import { Button, List, Select, Spin, Modal, Empty } from "antd";
import { Player } from "@/app/interface";
import MatchForm from "./MatchForm";

const { Option } = Select;

interface Pair {
  player1Id: number;
  player2Id: number;
  player1Matches: number;
  player2Matches: number;
}

const Schedule: React.FC<{ players: Player[] }> = ({ players }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<number[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPair, setSelectedPair] = useState<Pair | null>(null);
  const [fixedPairs, setFixedPairs] = useState<Pair[]>([]);

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
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedPair(null);
  };

  const handleFormSubmit = () => {
    setIsModalVisible(false);
    setFixedPairs((prev) =>
      prev.filter(
        (p) =>
          !(
            p.player1Id === selectedPair?.player1Id &&
            p.player2Id === selectedPair?.player2Id
          )
      )
    );
    setSelectedPair(null);
    generatePairs();
  };

  const fixPair = (pair: Pair) => {
    setFixedPairs((prev) => [...prev, pair]);
    setPairs((prev) =>
      prev.filter(
        (p) =>
          !(p.player1Id === pair.player1Id && p.player2Id === pair.player2Id)
      )
    );
  };

  return (
    <div className="container mx-auto px-4">
      <h1>Schedule Matches</h1>
      <div>
        <Select
          mode="multiple"
          style={{ width: "100%", marginBottom: "16px" }}
          placeholder="Выберите игроков"
          onChange={handlePlayerSelect}
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
        {loadingPairs ? (
          <Spin />
        ) : (
          <>
            {fixedPairs.length > 0 && (
              <List
                header={<div>Закрепленные Пары</div>}
                bordered
                dataSource={fixedPairs}
                renderItem={(pair) => {
                  const player1 = findPlayerById(pair.player1Id);
                  const player2 = findPlayerById(pair.player2Id);
                  return (
                    <List.Item
                      actions={[
                        <Button type="primary" onClick={() => showModal(pair)}>
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
            {pairs.length > 0 ? (
              <List
                header={<div>Возможные Пары</div>}
                bordered
                dataSource={pairs}
                renderItem={(pair) => {
                  const player1 = findPlayerById(pair.player1Id);
                  const player2 = findPlayerById(pair.player2Id);
                  return (
                    <List.Item
                      actions={[
                        <Button type="default" onClick={() => fixPair(pair)}>
                          Закрепить пару
                        </Button>,
                        <Button type="primary" onClick={() => showModal(pair)}>
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
          visible={isModalVisible}
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

export default Schedule;
