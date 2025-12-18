import { useState } from "react";
import "./Lobby.css";
import PixelButton from "./ui/PixelButton";
import PixelInput from "./ui/PixelInput";
import PixelPanel from "./ui/PixelPanel";
import { getPlayerName } from "../utils/player";

function Lobby({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const trimmedName = playerName.trim();
  const trimmedRoom = roomInput.trim();
  const canCreate = trimmedName.length > 0;
  const canJoin = trimmedName.length > 0 && trimmedRoom.length > 0;

  return (
    <div className="lobby-shell">
      <div className="kolam-border" aria-hidden="true" />
      <PixelPanel className="lobby-hero">
        <div className="cow-banner">
          <div className="animal-row">
            <div className="cows">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={`l${i}`} className="cow cow-left" aria-hidden="true">
                  🐄
                </span>
              ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={`ml${i}`} className="mango" aria-hidden="true">
                🥭
              </span>
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={`pl${i}`} className="peacock peacock-left" aria-hidden="true">
                🦚
              </span>
            ))}
            <div className="cow-center">304</div>
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={`pr${i}`} className="peacock peacock-right" aria-hidden="true">
                🦚
              </span>
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={`mr${i}`} className="mango" aria-hidden="true">
                🥭
              </span>
            ))}
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={`r${i}`} className="cow cow-right" aria-hidden="true">
                🐄
              </span>
            ))}
            </div>
          </div>
          <div className="cow-title">Kattuvan Style</div>
          <div className="cow-subtitle">A Sri Lankan Tamil Card Game</div>
        </div>
      </PixelPanel>

      <main className="lobby-main">
        <PixelPanel className="lobby-card" title="Registration Desk">
          <PixelInput
            label="Player Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            hint={!canCreate ? "Name required to create or join." : undefined}
          />
          <PixelInput
            label="Room Code"
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder="e.g. 12AB"
            autoComplete="off"
            hint={!canJoin && trimmedRoom.length === 0 ? "Room code required to join." : undefined}
          />
          <div className="actions">
            <PixelButton
              variant="primary"
              onClick={() => onCreateRoom(trimmedName)}
              disabled={!canCreate}
              fullWidth
            >
              Create Room
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={() => onJoinRoom(trimmedRoom, trimmedName)}
              disabled={!canJoin}
              fullWidth
            >
              Join Room
            </PixelButton>
          </div>
        </PixelPanel>
      </main>
    </div>
  );
}

export default Lobby;
