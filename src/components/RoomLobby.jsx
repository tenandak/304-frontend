function RoomLobby({ roomId, players, onStartGame }) {
  return (
    <div style={{ padding: "1rem" }}>
      <h2>Room Lobby</h2>
      <p>
        Room Code: <strong>{roomId}</strong>
      </p>
      <ul>
        {players.map((player, index) => {
          const seatLabel =
            player.seatIndex !== undefined ? player.seatIndex : index;
          return (
            <li key={player.id || player.playerId || index}>
              Seat {seatLabel}: {player.name || player.playerName || "Unknown"}
            </li>
          );
        })}
      </ul>
      <button onClick={onStartGame} disabled={players.length !== 4}>
        Start Game
      </button>
      {players.length !== 4 && (
        <p style={{ color: "#666" }}>Need exactly 4 players to start.</p>
      )}
    </div>
  );
}

export default RoomLobby;
