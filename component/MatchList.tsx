"use client";

import { Match, MatchResult } from "@/app/interface";
import { Typography, Card, List, Button, Space, message, Popconfirm } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import {
  authHeader,
  clearPassword,
  ensurePassword,
  savePassword,
} from "@/utils/adminAuth";

const { Title } = Typography;

interface MatchListProps {
  matches: Match[];
  totalMatchesCount: number;
  // editable=true показывает админ-кнопки правки результата
  editable?: boolean;
  onChanged?: () => void;
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

const MatchList: React.FC<MatchListProps> = ({
  matches,
  totalMatchesCount,
  editable = false,
  onChanged,
}) => {
  const groupedMatches = groupMatchesByDate(matches);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const playerName = (p: { firstName: string; lastName: string }) =>
    `${p.firstName} ${p.lastName}`.trim();

  // Общий запрос к /api/match с админ-авторизацией.
  const adminRequest = async (
    method: "PUT" | "DELETE",
    body: object
  ): Promise<boolean> => {
    const password = ensurePassword();
    if (!password) {
      message.error("Авторизация отменена.");
      return false;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/match", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(password),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        savePassword(password);
        return true;
      }
      if (res.status === 401) {
        message.error("Неверный пароль, попробуйте еще");
        clearPassword();
      } else {
        message.error("Ошибка при сохранении.");
      }
      return false;
    } catch {
      message.error("Ошибка сети.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const changeResult = async (match: Match, result: MatchResult) => {
    if (result === match.result) {
      setEditingId(null);
      return;
    }
    const ok = await adminRequest("PUT", { matchId: match.id, result });
    if (ok) {
      message.success("Результат изменён");
      setEditingId(null);
      onChanged?.();
    }
  };

  const deleteMatch = async (match: Match) => {
    const ok = await adminRequest("DELETE", { matchId: match.id });
    if (ok) {
      message.success("Матч удалён");
      setEditingId(null);
      onChanged?.();
    }
  };

  const renderEditControls = (match: Match) => (
    <div style={{ marginTop: 12 }}>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <Button
          block
          type={match.result === MatchResult.player1Win ? "primary" : "default"}
          disabled={busy}
          onClick={() => changeResult(match, MatchResult.player1Win)}
        >
          Победил(а) {playerName(match.player1)}
        </Button>
        <Button
          block
          type={match.result === MatchResult.draw ? "primary" : "default"}
          disabled={busy}
          onClick={() => changeResult(match, MatchResult.draw)}
        >
          Ничья
        </Button>
        <Button
          block
          type={match.result === MatchResult.player2Win ? "primary" : "default"}
          disabled={busy}
          onClick={() => changeResult(match, MatchResult.player2Win)}
        >
          Победил(а) {playerName(match.player2)}
        </Button>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Popconfirm
            title="Удалить матч?"
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteMatch(match)}
          >
            <Button danger type="text" disabled={busy}>
              Удалить матч
            </Button>
          </Popconfirm>
          <Button type="text" disabled={busy} onClick={() => setEditingId(null)}>
            Отмена
          </Button>
        </div>
      </Space>
    </div>
  );

  return (
    <div>
      <Title level={4}>
        Сыгранно {matches.length} матчей из {totalMatchesCount}
      </Title>
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
              const isEditing = editingId === match.id;
              return (
                <List.Item>
                  <div style={{ width: "100%" }}>
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
                              alignItems: "center",
                            }}
                          >
                            <span style={player2Style}>
                              {match.player2.firstName} {match.player2.lastName}
                            </span>
                            {editable && !isEditing && (
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined />}
                                style={{ marginLeft: 8 }}
                                onClick={() => setEditingId(match.id)}
                              />
                            )}
                          </span>
                        </div>
                      }
                    />
                    {editable && isEditing && renderEditControls(match)}
                  </div>
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
