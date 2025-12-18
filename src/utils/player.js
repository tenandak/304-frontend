export function getPlayerId(player) {
  return player?.id ?? player?.playerId ?? null;
}

export function getPlayerName(player) {
  return player?.name ?? player?.playerName ?? "Unknown";
}

export function getSeatIndex(player, fallbackIndex) {
  if (player && player.seatIndex !== undefined && player.seatIndex !== null) {
    return player.seatIndex;
  }
  return fallbackIndex;
}

export function getInitials(name) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
