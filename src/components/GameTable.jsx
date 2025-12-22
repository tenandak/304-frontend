import { useEffect, useState } from "react";
import "./GameTable.css";
import PixelButton from "./ui/PixelButton";
import { getInitials, getPlayerName, getSeatIndex } from "../utils/player";

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
  if (allowedBids.length === 0 && allowedActions.includes("bid250")) {
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
    } else if (faceDownPlayableCardIds.length === 0) {
      setPlayFaceDown(false);
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
  const trumpSuit = round?.trump?.suit || null;
  const bidActionType =
    round?.phase === "second-pass-bidding"
      ? "PLACE_SECOND_PASS_BID"
      : "PLACE_FIRST_BID";
  const modePlayableIds = playFaceDown
    ? faceDownPlayableCardIds
    : playableCardIds;
  const seatMap = new Map();
  const remaining = [];
  players.forEach((p, idx) => {
    const seat = getSeatIndex(p, undefined);
    if (seat !== undefined && seat !== null) {
      seatMap.set(seat, p);
    } else {
      remaining.push({ p, idx });
    }
  });
  remaining.forEach(({ p }) => {
    const targetSeat = Array.from({ length: 4 }, (_, i) => i).find(
      (s) => !seatMap.has(s)
    );
    if (targetSeat !== undefined) seatMap.set(targetSeat, p);
  });
  const filledSeats = [0, 1, 2, 3].map((i) => seatMap.get(i));
  const mySeatIndex = players.find((p) => (p?.id || p?.playerId) === playerId)?.seatIndex;
  const offset = Number.isInteger(mySeatIndex) ? ((2 - mySeatIndex + 4) % 4) : 0;
  const uiSeats = [0, 1, 2, 3].map((i) => filledSeats[(i - offset + 4) % 4]);
  const uiDirectionByPlayerId = new Map(
    uiSeats.map((player, idx) => {
      const pid = player?.id || player?.playerId;
      const dir = ["N", "E", "S", "W"][idx];
      return [pid, dir];
    })
  );
  const seatLabelFromSeatIndex = (seat) =>
    seat === 0 || seat === 2 ? "NS" : seat === 1 || seat === 3 ? "EW" : null;
  const seatLabelFromPlayerId = (pid) => {
    if (!pid) return null;
    const player = players.find((p) => (p?.id || p?.playerId) === pid);
    return seatLabelFromSeatIndex(player?.seatIndex);
  };
  const myTeamLabel = seatLabelFromSeatIndex(mySeatIndex);

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

  const northSouth = [filledSeats[0], filledSeats[2]].filter(Boolean);
  const eastWest = [filledSeats[1], filledSeats[3]].filter(Boolean);

  const teamLabelByTeamId = new Map();
  teams.forEach((team) => {
    const seatLabel = (team.playerIds || [])
      .map((pid) => seatLabelFromPlayerId(pid))
      .find(Boolean);
    if (seatLabel) {
      teamLabelByTeamId.set(team.id, seatLabel);
    }
  });

  const highestBidderTeamLabel = highestBidderId
    ? seatLabelFromPlayerId(highestBidderId) ||
      (() => {
        const t = teams.find((team) => team.playerIds?.includes(highestBidderId));
        return t ? teamLabelByTeamId.get(t.id) || null : null;
      })()
    : null;
  const currentTrickWinnerTeamLabel =
    teamLabelByTeamId.get(currentTrickWinnerTeamId) ||
    seatLabelFromPlayerId(currentTrick?.winnerPlayerId) ||
    null;

  const nsTeam =
    teams.find((t) => teamLabelByTeamId.get(t.id) === "NS") ||
    teams[0] ||
    null; // TODO: fall back to first team if mapping is unclear
  const ewTeam =
    teams.find((t) => teamLabelByTeamId.get(t.id) === "EW") ||
    teams[1] ||
    null; // TODO: fall back to second team if mapping is unclear

  const humanizePhase = (value) => {
    switch (value) {
      case "first-pass-bidding":
        return "First-pass bidding";
      case "second-pass-bidding":
        return "Second-pass bidding";
      case "optional-250-bidding":
        return "Optional 250 bidding";
      case "trump-selection":
        return "Trump selection";
      default:
        if (value?.startsWith("tricks")) return "Tricks";
        return value || "Unknown";
    }
  };
  const currentPhaseLabel = humanizePhase(phase);
  const currentTurnName =
    players.find((p) => (p.id || p.playerId) === currentTurnPlayerId)?.name ||
    currentTurnPlayerId ||
    "Unknown";
  const teamLabelForPlayer = (player) => seatLabelFromSeatIndex(player?.seatIndex);

  return (
    <div className="game-root">
      <div className="play-area room-shell">
        <div className="table-grid">
          <div aria-hidden="true" />
          <div className="table-center-cell">
              <DeckStack />
              {round?.phase === "first-pass-bidding" && <DealAnimation key={round?.id || "deal"} />}
              <div className="table-center">
                {round?.phase?.startsWith("tricks") ? (
                  currentTrick ? (
                    <CenterPlayArea
                      currentTrick={currentTrick}
                      players={players}
                      playerId={playerId}
                      bidding={bidding}
                      suitSymbol={suitSymbol}
                      directionFromPlayerId={(pid) => {
                        const dir = uiDirectionByPlayerId.get(pid);
                        return dir || null;
                      }}
                    />
                  ) : (
                    <div className="meta">Waiting for play…</div>
                  )
                ) : (
                  <div className="meta">Table is ready.</div>
                )}
              </div>
          </div>

          <div className="seat seat-north">
            <Seat
              direction="north"
              teamLabel={teamLabelForPlayer(uiSeats[0]) || "NS"}
              player={uiSeats[0]}
              isDealer={uiSeats[0]?.seatIndex === round?.dealerIndex}
              isYou={(uiSeats[0]?.id || uiSeats[0]?.playerId) === playerId}
              isTurn={
                !!uiSeats[0] &&
                currentTurnPlayerId === (uiSeats[0]?.id || uiSeats[0]?.playerId)
              }
              isPartner={
                !!uiSeats[0] &&
                myTeamLabel === "NS" &&
                (uiSeats[0]?.id || uiSeats[0]?.playerId) !== playerId
              }
            />
          </div>
          <div className="seat seat-east">
            <Seat
              direction="east"
              teamLabel={teamLabelForPlayer(uiSeats[1]) || "EW"}
              player={uiSeats[1]}
              isDealer={uiSeats[1]?.seatIndex === round?.dealerIndex}
              isYou={(uiSeats[1]?.id || uiSeats[1]?.playerId) === playerId}
              isTurn={
                !!uiSeats[1] &&
                currentTurnPlayerId === (uiSeats[1]?.id || uiSeats[1]?.playerId)
              }
              isPartner={
                !!uiSeats[1] &&
                myTeamLabel === "EW" &&
                (uiSeats[1]?.id || uiSeats[1]?.playerId) !== playerId
              }
            />
          </div>
          <div className="seat seat-south">
            <Seat
              direction="south"
              teamLabel={teamLabelForPlayer(uiSeats[2]) || "NS"}
              player={uiSeats[2]}
              isDealer={uiSeats[2]?.seatIndex === round?.dealerIndex}
              isYou={(uiSeats[2]?.id || uiSeats[2]?.playerId) === playerId}
              isTurn={
                !!uiSeats[2] &&
                currentTurnPlayerId === (uiSeats[2]?.id || uiSeats[2]?.playerId)
              }
              isPartner={
                !!uiSeats[2] &&
                myTeamLabel === "NS" &&
                (uiSeats[2]?.id || uiSeats[2]?.playerId) !== playerId
              }
            />
          </div>
          <div className="seat seat-west">
            <Seat
              direction="west"
              teamLabel={teamLabelForPlayer(uiSeats[3]) || "EW"}
              player={uiSeats[3]}
              isDealer={uiSeats[3]?.seatIndex === round?.dealerIndex}
              isYou={(uiSeats[3]?.id || uiSeats[3]?.playerId) === playerId}
              isTurn={
                !!uiSeats[3] &&
                currentTurnPlayerId === (uiSeats[3]?.id || uiSeats[3]?.playerId)
              }
              isPartner={
                !!uiSeats[3] &&
                myTeamLabel === "EW" &&
                (uiSeats[3]?.id || uiSeats[3]?.playerId) !== playerId
              }
            />
          </div>
        </div>
      </div>

      <Scoreboard
        north={uiSeats[0]}
        south={uiSeats[2]}
        east={uiSeats[1]}
        west={uiSeats[3]}
        nsTeam={nsTeam}
        ewTeam={ewTeam}
        highestBidderTeamLabel={highestBidderTeamLabel}
        currentTrickWinnerTeamLabel={currentTrickWinnerTeamLabel}
      />

      <div className="action-tray">
        <div className="tray-header">
          <div className="phase-label">{currentPhaseLabel}</div>
          <div className="phase-info">
            {isBidding
              ? round?.phase === "second-pass-bidding"
                ? "Second-pass: 250 or pass if allowed."
                : "Choose a bid or partner/pass."
              : phase?.startsWith("tricks")
              ? isMyTrickTurn
                ? "Your turn to play."
                : "Waiting for other players."
              : phase === "trump-selection"
              ? "Select a suit and a card to reveal trump."
              : isOptional
              ? "Optional 250: bid or pass."
              : "Follow the round instructions."}
          </div>
          {isBidding && <div className="phase-sub">Current turn: {currentTurnName}</div>}
          {phase?.startsWith("tricks") && (
            <div className="phase-sub">{isMyTrickTurn ? "Your turn" : "Waiting…"}</div>
          )}
        </div>

        {isBidding && (
          <div className="tray-actions">
            {allowedBids.map((bid) => (
              <PixelButton
                key={bid}
                variant="primary"
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "bid", value: bid },
                  })
                }
              >
                Bid {bid}
              </PixelButton>
            ))}
            {options?.canCallPartner && isMyTurn && (
              <PixelButton
                variant="secondary"
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "partner" },
                  })
                }
              >
                Partner (Pass)
              </PixelButton>
            )}
            {isOpen && !isHighestBidder && !iPassed && (
              <PixelButton
                variant="secondary"
                onClick={() =>
                  onSendAction({
                    type: bidActionType,
                    payload: { type: "pass" },
                  })
                }
              >
                Pass
              </PixelButton>
            )}
          </div>
        )}

        {isOptional && (
          <div className="tray-actions">
            {!isMyOverrideTurn ? (
              <div className="meta">Waiting…</div>
            ) : (
              <>
                <PixelButton
                  variant="primary"
                  onClick={() =>
                    onSendAction({
                      type: "PLACE_SECOND_PASS_BID",
                      payload: { type: "bid", value: 250 },
                    })
                  }
                >
                  Bid 250
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  onClick={() =>
                    onSendAction({
                      type: "PLACE_SECOND_PASS_BID",
                      payload: { type: "pass" },
                    })
                  }
                >
                  Pass
                </PixelButton>
              </>
            )}
          </div>
        )}

        {phase === "trump-selection" && playerId === bidding?.bidderId && (
          <div className="tray-actions">
            {["hearts", "spades", "diamonds", "clubs"].map((suit) => (
              <PixelButton
                key={suit}
                variant="secondary"
                onClick={() => setSelectedSuit(suit)}
              >
                {suit}
              </PixelButton>
            ))}
            {selectedSuit && (
              <div className="hand-grid">
                {(me?.hand || [])
                  .filter((card) => card.suit === selectedSuit)
                  .map((card) => (
                    <button
                      key={card.id || card.rank + card.suit}
                      className="card-btn"
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
            )}
          </div>
        )}
      </div>

      <div className="hand-dock">
        <div className="hand-label">Your Hand</div>
        <div className="hand-scroll">
          <div className="hand-row">
            {(me?.hand || []).map((card, idx) => {
              const isPlayable =
                isMyTrickTurn &&
                modePlayableIds.length > 0 &&
                modePlayableIds.includes(card.id);
              const blockedByRules =
                modePlayableIds.length === 0 &&
                (playableCardIds.length > 0 || faceDownPlayableCardIds.length > 0);
              const disabled = !isPlayable || blockedByRules;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`hand-card ${isPlayable ? "playable" : ""} ${
                    disabled ? "disabled" : ""
                  }`}
                  onClick={() => {
                    if (!isPlayable) return;
                    onSendAction({
                      type: playFaceDown ? "PLAY_GUESS_FACE_DOWN" : "PLAY_CARD",
                      payload: { cardId: card.id },
                    });
                  }}
                >
                  <span className="hand-rank">{card.rank}</span>
                  <span className="hand-suit">{suitSymbol(card.suit)}</span>
                </button>
              );
            })}
          </div>
        </div>
        {canPlayFaceDown && (
          <div className="face-row">
            <PixelButton
              variant="secondary"
              onClick={() => setPlayFaceDown((prev) => !prev)}
              disabled={!isMyTrickTurn || faceDownPlayableCardIds.length === 0}
            >
              {playFaceDown ? "Playing Face Down" : "Play Face Down"}
            </PixelButton>
            <div className="meta warning">Face-down play hides your card; backend enforces risk.</div>
          </div>
        )}
      </div>

      <details className="debugDock">
        <summary>Debug</summary>
        <p className="meta">Phase: {phase}</p>
        <p className="meta">
          UI rotation: mySeatIndex={mySeatIndex ?? "?"} offset={offset} | North={getPlayerName(uiSeats[0])} East={getPlayerName(uiSeats[1])} South={getPlayerName(uiSeats[2])} West={getPlayerName(uiSeats[3])}
        </p>
        <pre className="state-pre">{JSON.stringify(gameState, null, 2)}</pre>
      </details>
    </div>
  );
}

export default GameTable;

function CenterPlayArea({
  currentTrick,
  players,
  playerId,
  bidding,
  trumpSuit,
  suitSymbol,
  directionFromPlayerId,
}) {
  const slots = { N: null, E: null, S: null, W: null };

  currentTrick?.cards?.forEach((entry) => {
    const dir = directionFromPlayerId(entry.playerId);
    if (dir && !slots[dir]) {
      slots[dir] = entry;
    }
  });

  const renderCard = (entry) => {
    if (!entry) return null;
    const playerName =
      players.find((p) => p.id === entry.playerId)?.name || entry.playerId;
    const card = entry.card;
    const revealCard =
      !entry.faceDown || playerId === entry.playerId || playerId === bidding?.bidderId;
    const isTrumpCallerPlay =
      entry.faceDown &&
      entry.playerId === bidding?.bidderId &&
      trumpSuit &&
      card?.suit === trumpSuit;
    const label = revealCard
      ? card
        ? `${card.rank ?? "?"} ${card.suit ? suitSymbol(card.suit) : ""}`.trim()
        : "Card"
      : "Face Down";
    const extra =
      isTrumpCallerPlay && playerId !== bidding?.bidderId
        ? " (Trump)"
        : entry.isGuess
        ? " (Guess)"
        : "";
    const faceClass = revealCard ? "card-face" : "card-back";

    return (
      <>
        <div className="slot-name">{playerName}</div>
        <div className={`slot-card ${faceClass}`}>
          <span className="card-label">
            {label}
            {extra}
          </span>
        </div>
      </>
    );
  };

  const directions = ["N", "E", "S", "W"];

  return (
    <div className="center-grid">
      {directions.map((dir) => (
        <div key={dir} className={`center-slot slot-${dir.toLowerCase()}`}>
          {slots[dir] ? (
            renderCard(slots[dir])
          ) : (
            <div className="slot-placeholder">Waiting…</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Scoreboard({
  north,
  south,
  east,
  west,
  nsTeam,
  ewTeam,
  highestBidderTeamLabel,
  currentTrickWinnerTeamLabel,
}) {
  const nsNames = [north, south].filter(Boolean).map(getPlayerName).join(", ") || "TBD";
  const ewNames = [east, west].filter(Boolean).map(getPlayerName).join(", ") || "TBD";
  const nsHighlight =
    highestBidderTeamLabel === "NS" || currentTrickWinnerTeamLabel === "NS";
  const ewHighlight =
    highestBidderTeamLabel === "EW" || currentTrickWinnerTeamLabel === "EW";

  const renderTeamRow = (label, names, team, highlight) => (
    <div className={`score-row ${highlight ? "score-highlight" : ""}`}>
      <div className="score-label">Team {label}</div>
      <div className="score-names" title={names}>
        {names}
      </div>
      <div className="score-meta">
        Collector: {team?.collector ?? "-"} | Distributor: {team?.distributor ?? "-"}
      </div>
    </div>
  );

  return (
    <div className="scoreboard-panel">
      {renderTeamRow("NS", nsNames, nsTeam, nsHighlight)}
      {renderTeamRow("EW", ewNames, ewTeam, ewHighlight)}
    </div>
  );
}

function Seat({ direction, player, isYou, isTurn, teamLabel, isPartner, isDealer }) {
  const name = getPlayerName(player) || "Open Seat";
  const initials = player ? getInitials(name) : "?";
  const hasPlayer = !!player;
  const plaqueClasses = ["seat-plaque"];
  if (isTurn) plaqueClasses.push("seat-turn");
  if (isYou) plaqueClasses.push("seat-you");

  return (
    <div className={`seat-block seat-${direction}`}>
      <div className={plaqueClasses.join(" ")}>
        <div className="seat-top">
          <div className="seat-avatar">{initials}</div>
          <div className="seat-text">
            <div className="seat-name" title={name}>
              {name}
            </div>
            <div className="seat-team">Team {teamLabel || "?"}</div>
          </div>
        </div>
        <div className="seat-badges">
          {isYou && <span className="badge-chip badge-you">YOU</span>}
          {isTurn && <span className="badge-chip badge-turn">TURN</span>}
          {isPartner && <span className="badge-chip badge-partner">PARTNER</span>}
          {isDealer && <span className="badge-chip">DEALER</span>}
          {!hasPlayer && <span className="badge-chip">Open Seat</span>}
        </div>
      </div>
    </div>
  );
}

function DeckStack() {
  return (
    <div className="deck-stack">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="deck-card" style={{ transform: `translateY(-${i * 2}px)` }} />
      ))}
    </div>
  );
}

function DealAnimation() {
  const seats = [
    { dir: "north", className: "deal--north" },
    { dir: "east", className: "deal--east" },
    { dir: "south", className: "deal--south" },
    { dir: "west", className: "deal--west" },
  ];

  return (
    <div className="deal-layer">
      {seats.map((seat, seatIdx) =>
        Array.from({ length: 4 }).map((_, cardIdx) => {
          const delay = (seatIdx * 4 + cardIdx) * 0.12;
          return (
            <div
              key={`${seat.dir}-${cardIdx}`}
              className={`deal-card ${seat.className}`}
              style={{ animationDelay: `${delay}s` }}
            />
          );
        })
      )}
    </div>
  );
}
