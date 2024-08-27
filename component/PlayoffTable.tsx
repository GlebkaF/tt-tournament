import Link from "next/link";
import React from "react";

interface PlayoffMatch {
  player1: {
    id: number;
    name: string;
    score: number;
  };
  player2: {
    id: number;
    name: string;
    score: number;
  };
}

interface PlayoffStage {
  name: string;
  matches: PlayoffMatch[];
}

interface Props {
  stages: PlayoffStage[];
}

const stages: PlayoffStage[] = [
  {
    name: "Полуфинал",
    matches: [
      {
        player1: {
          id: 1,
          name: "Костя",
          score: 4,
        },
        player2: {
          id: 2,
          name: "Виталя Хомич",
          score: 3,
        },
      },
      {
        player1: {
          id: 1,
          name: "Костя",
          score: 4,
        },
        player2: {
          id: 2,
          name: "Виталя Хомич",
          score: 3,
        },
      },
    ],
  },
  {
    name: "Третье место",
    matches: [
      {
        player1: {
          id: 1,
          name: "Костя",
          score: 4,
        },
        player2: {
          id: 2,
          name: "Виталя Хомич",
          score: 3,
        },
      },
    ],
  },
  {
    name: "Финал",
    matches: [
      {
        player1: {
          id: 1,
          name: "Костя",
          score: 4,
        },
        player2: {
          id: 2,
          name: "Виталя Хомич",
          score: 3,
        },
      },
    ],
  },
];

/** Формирует строчку для использования в md статьях. Измени список матчей, скопируй и запусти в браузере */
function _mdHelper() {
  (() => {
    const stages = [
      {
        name: "Полуфинал",
        matches: [
          {
            player1: {
              id: 4,
              name: "Зайцева",
              score: 4,
            },
            player2: {
              id: 11,
              name: "Аникин",
              score: 3,
            },
          },
          {
            player1: {
              id: 2,
              name: "Емельянова",
              score: 4,
            },
            player2: {
              id: 8,
              name: "Шкретов",
              score: 2,
            },
          },
        ],
      },
      {
        name: "Третье место",
        matches: [
          {
            player1: {
              id: 8,
              name: "Шкретов",
              score: 4,
            },
            player2: {
              id: 11,
              name: "Аникин",
              score: 3,
            },
          },
        ],
      },
      {
        name: "Финал",
        matches: [
          {
            player1: {
              id: 2,
              name: "Емельянова",
              score: 4,
            },
            player2: {
              id: 4,
              name: "Зайцева",
              score: 2,
            },
          },
        ],
      },
    ];

    const mdString = `<PlayoffTable stages='${JSON.stringify(stages)}' />`;

    console.log(mdString);
  })();
}

export default function PlayoffTable({ stages }: Props) {
  return (
    <div className="flex flex-row gap-32 mobile:flex-col overflow-x-auto">
      {stages.map((stage, index) => {
        return (
          <div
            key={index}
            className="min-w-[200px]  flex flex-col gap-16 justify-center "
          >
            <div className="text-l text-center">{stage.name}</div>
            {stage.matches.map(({ player1, player2 }, index) => {
              const isPlayer1Winner = player1.score > player2.score;
              const winner = isPlayer1Winner ? player1 : player2;
              const looser = isPlayer1Winner ? player2 : player1;

              return (
                <div
                  key={index}
                  className="border border-solid border-primary-base "
                >
                  <div className="flex justify-between px-16 py-8 bg-primary-positive">
                    <Link href={"/players/" + winner.id} target="_blank">
                      {winner.name}
                    </Link>
                    <div className="ml-8">{winner.score}</div>
                  </div>
                  <div className="flex justify-between px-16 py-8">
                    <Link href={"/players/" + looser.id} target="_blank">
                      {looser.name}
                    </Link>
                    <div className="ml-8">{looser.score}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
