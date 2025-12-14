import { useEffect, useState } from "react";

function GameTable({ roomId, playerId, gameState, onSendAction }) {
  const players = gameState?.players || [];
  const me = players.find((p) => p.id === playerId);
  const teams = gameState?.teams ?? [];
  const phase = gameState?.currentRound?.phase || "Unknown";
  const currentRound = gameState?.currentRound || null;
  const round = gameState?.currentRound;
  const options = round?.biddingOptions;
  const bidding = round?.bidding;
  const isBidding =
    round?.phase === "first-pass-bidding" ||
    round?.phase === "second-pass-bidding";
  const currentTurnPlayerId =
    options?.currentTurnPlayerId ?? bidding?.currentTurnPlayerId ?? null;
  const isMyTurn = currentTurnPlayerId
    ? currentTurnPlayerId === playerId
    : true;
  const hasBid = !!bidding?.hasBid;
  const highestBidderId = options?.highestBidderId || null;
  const isHighestBidder = highestBidderId === playerId;
  const allowedActions =
    options?.allowedActionsByPlayerId?.[playerId] || [];
  let allowedBids =
    options?.allowedBidValuesByPlayerId?.[playerId] || [];
  if (
    allowedBids.length === 0 &&
    allowedActions.includes("bid250")
  ) {
    allowedBids = [250];
  }
  const isOpen =
    options?.isOpenBidding ?? bidding?.isOpenBidding ?? false;
  const passedIds =
    options?.passedPlayerIdsSinceLastBid ||
    options?.passedPlayerIds ||
    [];
  const iPassed = passedIds.includes(playerId);
  const highestBidValue =
    options?.highestBid ?? bidding?.highestBid ?? null;
  const highestBidder = highestBidderId
    ? players.find((p) => p.id === highestBidderId)
    : null;
  const hiddenTrumpCardId = round?.trump?.hiddenCardId;
  const isTrumpOwner = bidding?.bidderId === playerId;
  const hiddenTrumpCard = (() => {
    if (!hiddenTrumpCardId || !isTrumpOwner) return null;
    const [suit, rank] = hiddenTrumpCardId.split("-");
    if (!suit || !rank) return null;
    return { id: hiddenTrumpCardId, suit, rank };
  })();
  const [selectedSuit, setSelectedSuit] = useState(null);
  const override = round?.overrideOptions;
  const isOptional = round?.phase === "optional-250-bidding";
  const turnId = override?.currentTurnPlayerId || null;
  const isMyOverrideTurn = turnId === playerId;
  const passedOverride = new Set(override?.passedPlayerIds || []);
  const trickOptions = round?.trickOptions || {};
  const trickTurnPlayerId = trickOptions.currentTurnPlayerId || null;
  const isMyTrickTurn = trickTurnPlayerId === playerId;
  const faceDownPlayableCardIds =
    trickOptions.faceDownPlayableCardIdsByPlayerId?.[playerId] || [];
  const playableCardIds =
    trickOptions.playableCardIdsByPlayerId?.[playerId] ||
    faceDownPlayableCardIds ||
    [];
  const myTrickActions =
    trickOptions.allowedActionsByPlayerId?.[playerId] || [];
  const canPlayFaceDown = myTrickActions.includes("playCardFaceDown");
  const [playFaceDown, setPlayFaceDown] = useState(false);
  useEffect(() => {
    if (playableCardIds.length === 0 && faceDownPlayableCardIds.length > 0) {
      setPlayFaceDown(true);
    }
  }, [playableCardIds, faceDownPlayableCardIds]);
  const currentTrick =
    round?.tricks?.find((t) => t.index === round?.trickIndex) ||
    round?.tricks?.[round?.tricks?.length - 1] ||
    null;
  const currentTrickWinnerTeamId =
    currentTrick?.winnerPlayerId &&
    teams.find((team) =>
      team.playerIds?.includes(currentTrick.winnerPlayerId)
    )?.id;
  const bidActionType =
    round?.phase === "second-pass-bidding"
      ? "PLACE_SECOND_PASS_BID"
      : "PLACE_FIRST_BID";
  const modePlayableIds = playFaceDown
    ? faceDownPlayableCardIds
    : playableCardIds;

  const suitSymbol = (suit) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "spades":
        return "♠";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      default:
        return suit;
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Game Table</h3>
      <p>
        Room: {roomId} • You are: {me?.name || "Unknown"} (ID: {playerId})
      </p>

      <h4>Teams</h4>
      <ul>
        {teams.map((team, index) => {
          const playerIds = team.playerIds || [];
          const teamPlayers = playerIds.map((id) =>
            gameState?.players.find((p) => p.id === id || p.playerId === id)
          );
          return (
            <li key={team.id || index} style={{ marginBottom: "0.5rem" }}>
              <div>Team {team.id ?? index}</div>
              <div>
                Players:{" "}
                {teamPlayers.map((p, idx) => {
                  const label = p?.name || p?.playerName || playerIds[idx] || "Unknown";
                  return (
                    <span key={playerIds[idx] || idx}>
                      {label}
                      {idx < teamPlayers.length - 1 ? ", " : ""}
                    </span>
                  );
                })}
              </div>
              <div>
                Collector: {team.collector ?? "-"} | Distributor:{" "}
                {team.distributor ?? "-"}
              </div>
            </li>
          );
        })}
      </ul>

      <h4>Current Phase</h4>
      <p>{phase}</p>
      {phase === "first-pass-bidding" && (
        <p>First-pass bidding: anyone can bid, backend enforces rules.</p>
      )}

      <h4>Your Hand</h4>
      {!me || !me.hand ? (
        <p>Hand not available</p>
      ) : (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {me.hand.map((card, idx) => (
            // During trick play, only allow cards the backend marks as playable
            <button
              key={idx}
              type="button"
              style={{ padding: "0.4rem 0.6rem", minWidth: "3.5rem" }}
              disabled={
                !isMyTrickTurn ||
                (modePlayableIds.length > 0 &&
                  !modePlayableIds.includes(card.id)) ||
                (modePlayableIds.length === 0 &&
                  (playableCardIds.length > 0 ||
                    faceDownPlayableCardIds.length > 0))
              }
              onClick={() => {
                const canPlayThisCard =
                  isMyTrickTurn && modePlayableIds.includes(card.id);
                if (!canPlayThisCard) return;
                onSendAction({
                  type: playFaceDown ? "PLAY_GUESS_FACE_DOWN" : "PLAY_CARD",
                  payload: { cardId: card.id },
                });
              }}
            >
              {card.rank} {suitSymbol(card.suit)}
            </button>
          ))}
        </div>
      )}
      {isMyTrickTurn &&
        modePlayableIds.length === 0 &&
        (playableCardIds.length > 0 || faceDownPlayableCardIds.length > 0) && (
          <p style={{ marginTop: "0.25rem", color: "#a00" }}>
            No legal moves.
          </p>
        )}
      {canPlayFaceDown && (
        <div style={{ marginTop: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setPlayFaceDown((prev) => !prev)}
            disabled={!isMyTrickTurn || faceDownPlayableCardIds.length === 0}
            style={{
              padding: "0.4rem 0.8rem",
              background: playFaceDown ? "#d22" : undefined,
              color: playFaceDown ? "#fff" : undefined,
            }}
          >
            {playFaceDown ? "Playing Face Down" : "Play Face Down"}
          </button>
          <div style={{ fontSize: "0.85rem", color: "#a00", marginTop: "0.25rem" }}>
            Face-down play hides your card; backend enforces risk.
          </div>
        </div>
      )}
      {round?.phase?.startsWith("tricks") && (
        <p style={{ marginTop: "0.25rem" }}>
          {isMyTrickTurn ? "Your Turn" : "Waiting…"}
        </p>
      )}
      {round?.phase?.startsWith("tricks") && (
        <div style={{ marginTop: "0.5rem" }}>
          <h4 style={{ margin: "0.25rem 0" }}>Current Trick</h4>
          {!currentTrick || !currentTrick.cards?.length ? (
            <p>No cards played yet.</p>
          ) : (
            <ul style={{ paddingLeft: "1rem", margin: 0 }}>
              {currentTrick.cards.map((entry, idx) => {
                const playerName =
                  players.find((p) => p.id === entry.playerId)?.name ||
                  entry.playerId;
                const card = entry.card;
                const revealCard =
                  !entry.faceDown ||
                  playerId === entry.playerId ||
                  playerId === bidding?.bidderId;
                const label = revealCard
                  ? card
                    ? `${card.rank ?? "?"} ${
                        card.suit ? suitSymbol(card.suit) : ""
                      }`.trim()
                    : "Card"
                  : "Face Down";
                const extra = entry.isGuess ? " (Guess)" : "";
                return (
                  <li key={idx}>
                    {playerName}: {label}
                    {extra}
                  </li>
                );
              })}
            </ul>
          )}
          {currentTrickWinnerTeamId && (
            <p style={{ marginTop: "0.25rem" }}>
              Trick winner: Team {currentTrickWinnerTeamId}
            </p>
          )}
        </div>
      )}
      {hiddenTrumpCard && (
        <div style={{ marginTop: "0.5rem" }}>
          <h4 style={{ margin: "0.25rem 0" }}>Trump Card</h4>
          <button
            type="button"
            style={{ padding: "0.4rem 0.6rem", minWidth: "3.5rem" }}
          >
            {hiddenTrumpCard.rank} {suitSymbol(hiddenTrumpCard.suit)}
          </button>
        </div>
      )}

      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => onSendAction({ type: "ping" })}>
          Send Test Action
        </button>
      </div>
      <div style={{ margin: "1rem 0" }}>
        <h4>Debug Actions</h4>
        <button
          style={{ marginRight: "0.5rem" }}
          onClick={() => onSendAction({ type: "NOOP_DEBUG" })}
        >
          Debug: Send NOOP action
        </button>
        <button onClick={() => console.log("gameState", gameState)}>
          Debug: Log gameState
        </button>
      </div>

      {isBidding && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <h4>
            {round?.phase === "second-pass-bidding"
              ? "Second-Pass (250) Bidding"
              : "First-Pass Bidding"}
          </h4>
          <p>
            Current turn:{" "}
            {players.find((p) => p.id === currentTurnPlayerId)?.name ||
              currentTurnPlayerId ||
              "Unknown"}
          </p>
          <p>
            {round?.phase === "second-pass-bidding"
              ? "Second-pass: non-highest players may bid 250 or pass."
              : "Choose a bid or call Partner."}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {allowedBids.map((bid) => (
              <button
                key={bid}
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "bid", value: bid },
                  })
                }
              >
                Bid {bid}
              </button>
            ))}
            {options?.canCallPartner && isMyTurn && (
              <button
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "partner" },
                  })
                }
              >
                Partner (Pass)
              </button>
            )}
            {isOpen && !isHighestBidder && !iPassed && (
              <button
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "pass" },
                  })
                }
              >
                Pass
              </button>
            )}
          </div>
          {hasBid && (
            <p style={{ marginTop: "0.5rem" }}>
              Passes since last bid: {bidding?.passesSinceLastBid ?? 0}
            </p>
          )}
          <p style={{ marginTop: "0.25rem" }}>
            Highest bid: {highestBidValue ?? "None"} by{" "}
            {highestBidder?.name || highestBidderId || "N/A"}
          </p>
          <p style={{ marginTop: "0.25rem" }}>
            Open bidding: {isOpen ? "Yes" : "No"}
          </p>
          <p style={{ marginTop: "0.25rem" }}>
            Passes: {passedIds.length}/3
          </p>
        </div>
      )}
      {isOptional && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <h4>Optional 250 Bidding</h4>
          <p>
            Highest bid: {override?.highestBid ?? "None"} by{" "}
            {players.find((p) => p.id === override?.highestBidderId)?.name ||
              override?.highestBidderId ||
              "N/A"}
          </p>
          <p>
            Optional 250 bidding — current turn:{" "}
            {players.find((p) => p.id === turnId)?.name || turnId || "Unknown"}
          </p>
          {!isMyOverrideTurn ? (
            <p>Waiting…</p>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  onSendAction({
                    type: "PLACE_SECOND_PASS_BID",
                    payload: { type: "bid", value: 250 },
                  })
                }
              >
                Bid 250
              </button>
              <button
                onClick={() =>
                  onSendAction({
                    type: "PLACE_SECOND_PASS_BID",
                    payload: { type: "pass" },
                  })
                }
              >
                Pass
              </button>
            </div>
          )}
          <p style={{ marginTop: "0.25rem" }}>
            Passes so far: {passedOverride.size}
          </p>
        </div>
      )}
      {highestBidValue && (
        <p style={{ marginTop: "0.5rem" }}>
          Current highest bid: {highestBidValue} by{" "}
          {highestBidder?.name || highestBidderId}
        </p>
      )}
      {phase === "trump-selection" && (
        <div style={{ marginTop: 20, padding: 10, border: "1px solid #ccc" }}>
          <h4>Trump Selection</h4>
          <p>
            Bidder:{" "}
            {players.find((p) => p.id === bidding?.bidderId)?.name ||
              bidding?.bidderId ||
              "Unknown"}
          </p>
          {playerId !== bidding?.bidderId ? (
            <p>Waiting for bidder…</p>
          ) : (
            <>
              <p>Select a suit, then choose a card of that suit.</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["hearts", "spades", "diamonds", "clubs"].map((suit) => (
                  <button
                    key={suit}
                    type="button"
                    onClick={() => setSelectedSuit(suit)}
                    style={{
                      border:
                        selectedSuit === suit
                          ? "2px solid #333"
                          : "1px solid #ccc",
                    }}
                  >
                    {suit}
                  </button>
                ))}
              </div>
              {selectedSuit && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p>Choose a card to reveal as trump:</p>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {(me?.hand || [])
                      .filter((card) => card.suit === selectedSuit)
                      .map((card) => (
                        <button
                          key={card.id || card.rank + card.suit}
                          type="button"
                          onClick={() =>
                            onSendAction({
                              type: "SELECT_TRUMP",
                              payload: { suit: selectedSuit, cardId: card.id },
                            })
                          }
                        >
                          {card.rank} {suitSymbol(card.suit)}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto" }}>
        {JSON.stringify(gameState, null, 2)}
      </pre>
    </div>
  );
}

export default GameTable;
