import { useEffect, useState } from "react";
import GameTable from "./components/GameTable";
import Lobby from "./components/Lobby";
import RoomLobby from "./components/RoomLobby";
import { socket, useSocketEvents } from "./socket";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, []);

  useSocketEvents({
    connect: () => {
      setConnected(true);
    },
    disconnect: () => {
      setConnected(false);
      setRoomId(null);
      setPlayerId(null);
      setGameState(null);
      setPlayers([]);
    },
    playerCreated: ({ playerId: id }) => {
      setPlayerId(id);
    },
    roomJoined: ({ roomId: id, players: list }) => {
      setRoomId(id);
      setPlayers(list || []);
    },
    gameState: (state) => {
      setGameState(state);
    },
    error: ({ message }) => {
      setError(message || "An error occurred");
    },
  });

  const handleCreateRoom = (playerName) => {
    socket.emit("createRoom", { playerName });
  };

  const handleJoinRoom = (roomInput, playerName) => {
    socket.emit("joinRoom", { roomId: roomInput, playerName });
  };

  const handleStartGame = () => {
    socket.emit("startGame", { roomId });
  };

  const handleSendAction = (action) => {
    socket.emit("playerAction", { roomId, playerId, action });
  };

  let content = null;
  if (!connected) {
    content = <p>Connecting to server...</p>;
  } else if (connected && !roomId) {
    content = (
      <Lobby
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    );
  } else if (roomId && !gameState) {
    content = (
      <RoomLobby
        roomId={roomId}
        players={players}
        onStartGame={handleStartGame}
      />
    );
  } else if (roomId && gameState) {
    content = (
      <GameTable
        roomId={roomId}
        playerId={playerId}
        gameState={gameState}
        onSendAction={handleSendAction}
      />
    );
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: 960, margin: "0 auto" }}>
      <header
        style={{
          padding: "0.5rem 0",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>304 Kattuvan Style</h1>
        <div>
          Status:{" "}
          <strong style={{ color: connected ? "green" : "red" }}>
            {connected ? "Connected" : "Disconnected"}
          </strong>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: "#ffe0e0",
            color: "#900",
            padding: "0.5rem 1rem",
            marginBottom: "1rem",
            border: "1px solid #f5b5b5",
          }}
        >
          <span>{error}</span>
          <button
            style={{ marginLeft: "1rem" }}
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {content}
    </div>
  );
}
