import "./RoomLobby.css";
import PixelButton from "./ui/PixelButton";
import PixelPanel from "./ui/PixelPanel";
import { getInitials, getPlayerId, getPlayerName } from "../utils/player";

const seats = ["North", "East", "South", "West"];

function RoomLobby({ roomId, players, onStartGame }) {
  const seatMap = new Map();
  const remaining = [];

  players.forEach((player, idx) => {
    const seat = player?.seatIndex;
    if (seat !== undefined && seat !== null) {
      seatMap.set(seat, player);
    } else {
      remaining.push({ player, idx });
    }
  });

  remaining.forEach(({ player }) => {
    const targetSeat = Array.from({ length: 4 }, (_, i) => i).find(
      (s) => !seatMap.has(s)
    );
    if (targetSeat !== undefined) {
      seatMap.set(targetSeat, player);
    }
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {
      // fallback if clipboard not available
    }
  };

  const filledSeats = seats.map((_, seatIndex) => seatMap.get(seatIndex));
  const canStart = players.length === 4;

  return (
    <div className="room-shell">
      <PixelPanel className="table-frame">
        <div className="table-corners" aria-hidden="true" />
        <div className="table-grid">
          <Seat direction="north" player={filledSeats[0]} />
          <Seat direction="east" player={filledSeats[1]} />
          <Seat direction="south" player={filledSeats[2]} />
          <Seat direction="west" player={filledSeats[3]} />
        </div>
      </PixelPanel>

      <div className="lobby-controls">
        <div className="control-row">
          <PixelButton
            variant="secondary"
            className="copy-btn"
            onClick={handleCopy}
            title="Copy room code"
          >
            Copy Room Code ({roomId})
          </PixelButton>
          <PixelButton
            variant="primary"
            className="start-btn"
            onClick={onStartGame}
            disabled={!canStart}
          >
            Start Game
          </PixelButton>
        </div>
        {!canStart && (
          <p className="helper">Need exactly 4 players to start.</p>
        )}
      </div>
    </div>
  );
}

function Seat({ direction, player }) {
  const name = getPlayerName(player);
  const badgeClass = player ? "badge filled" : "badge";
  return (
    <div className={`seat seat-${direction}`}>
      <div className={badgeClass}>
        <div className="avatar">{player ? getInitials(name) : "?"}</div>
        <div className="info">
          <div className="name">{name || "Open Seat"}</div>
          <div className="status">{player ? "Ready" : "Waiting"}</div>
        </div>
      </div>
      {!player && <div className="pulse" aria-hidden="true" />}
    </div>
  );
}

export default RoomLobby;
