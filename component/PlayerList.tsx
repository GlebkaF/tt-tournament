interface Player {
  id: number;
  firstName: string;
  lastName: string;
}

interface PlayerListProps {
  players: Player[];
}

const PlayerList: React.FC<PlayerListProps> = ({ players }) => {
  return (
    <div>
      <h1>Players List</h1>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.firstName} {player.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
