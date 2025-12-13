import { useState } from "react";

function Lobby({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState("");
  const [roomInput, setRoomInput] = useState("");

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Lobby</h2>
      <p style={{ color: "#555" }}>
        Enter your name and create a room, or join with a room code.
      </p>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Player Name:
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label>
          Room ID:
          <input
            type="text"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => onCreateRoom(playerName)}>Create Room</button>
        <button onClick={() => onJoinRoom(roomInput, playerName)}>
          Join Room
        </button>
      </div>
    </div>
  );
}

export default Lobby;
