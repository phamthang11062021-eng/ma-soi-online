"use strict";

const crypto = require("node:crypto");

const COLORS = ["red", "yellow", "green", "blue"];
const CARD_TYPES = ["number", "skip", "reverse", "draw2", "wild", "wild4"];

function makeDeck() {
  const deck = [];
  let serial = 0;
  const add = (color, type, value = null) => deck.push({
    id: "c" + (++serial),
    color,
    type,
    value,
    label: type === "number" ? String(value) :
      ({ skip: "CẤM", reverse: "ĐẢO", draw2: "+2", wild: "ĐỔI MÀU", wild4: "+4" })[type]
  });
  for (const color of COLORS) {
    add(color, "number", 0);
    for (let n = 1; n <= 9; n++) {
      add(color, "number", n);
      add(color, "number", n);
    }
    for (const type of ["skip", "reverse", "draw2"]) {
      add(color, type);
      add(color, type);
    }
  }
  for (let i = 0; i < 4; i++) {
    add(null, "wild");
    add(null, "wild4");
  }
  return deck;
}

function shuffle(cards, randomInt = crypto.randomInt) {
  const result = cards.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createGame(players, settings = {}) {
  if (!Array.isArray(players) || players.length < 2 || players.length > 10) {
    throw new Error("Bài Màu Số cần từ 2 đến 10 người chơi.");
  }
  const ids = new Set(players.map(p => p.id));
  if (ids.size !== players.length || players.some(p => !p.id || !p.name)) {
    throw new Error("Danh sách người chơi không hợp lệ.");
  }
  const deck = shuffle(makeDeck());
  const gamePlayers = players.map(p => ({ id: p.id, name: p.name, hand: deck.splice(0, 7) }));
  let firstIndex = deck.findIndex(card => card.type === "number");
  if (firstIndex < 0) firstIndex = 0;
  const firstCard = deck.splice(firstIndex, 1)[0];
  return {
    status: "playing",
    players: gamePlayers,
    drawPile: deck,
    discardPile: [firstCard],
    topCard: firstCard,
    activeColor: firstCard.color,
    currentIndex: 0,
    direction: 1,
    winnerId: null,
    drawnCardId: null,
    unoPendingId: null,
    turnSerial: 0,
    settings: {
      turnSeconds: clamp(settings.turnSeconds, 10, 120, 30),
      allowPlayDrawnCard: settings.allowPlayDrawnCard !== false,
      unoPenalty: settings.unoPenalty !== false,
      stacking: false
    }
  };
}

function clamp(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
}

function currentPlayer(game) {
  return game.players[game.currentIndex] || null;
}

function getPlayer(game, playerId) {
  return game.players.find(p => p.id === playerId) || null;
}

function isPlayable(game, player, card) {
  if (!game || !player || !card || game.status !== "playing") return false;
  if (card.type === "wild") return true;
  if (card.type === "wild4") {
    return !player.hand.some(c => c.id !== card.id && c.color === game.activeColor && c.type !== "wild" && c.type !== "wild4");
  }
  return card.color === game.activeColor ||
    (game.topCard.type === "number" && card.type === "number" && card.value === game.topCard.value) ||
    (card.type !== "number" && card.type === game.topCard.type);
}

function drawOne(game, player) {
  if (!game.drawPile.length) {
    if (game.discardPile.length <= 1) return null;
    const top = game.discardPile.pop();
    game.drawPile = shuffle(game.discardPile);
    game.discardPile = [top];
  }
  const card = game.drawPile.pop();
  if (card) player.hand.push(card);
  return card;
}

function nextIndex(game, steps = 1) {
  const count = game.players.length;
  return (game.currentIndex + game.direction * steps % count + count) % count;
}

function advance(game, steps = 1) {
  game.currentIndex = nextIndex(game, steps);
  game.drawnCardId = null;
  game.turnSerial++;
}

function requireTurn(game, playerId) {
  if (!game || game.status !== "playing") throw new Error("Ván chơi chưa diễn ra.");
  if (currentPlayer(game)?.id !== playerId) throw new Error("Chưa đến lượt của bạn.");
  return getPlayer(game, playerId);
}

function playCard(game, playerId, cardId, chosenColor) {
  const player = requireTurn(game, playerId);
  const index = player.hand.findIndex(card => card.id === cardId);
  if (index < 0) throw new Error("Không tìm thấy lá bài trong tay bạn.");
  const card = player.hand[index];
  if (game.drawnCardId && game.drawnCardId !== card.id) throw new Error("Bạn chỉ được đánh lá vừa rút hoặc bỏ lượt.");
  if (!isPlayable(game, player, card)) throw new Error("Lá bài này không hợp lệ.");
  if ((card.type === "wild" || card.type === "wild4") && !COLORS.includes(chosenColor)) {
    throw new Error("Hãy chọn màu tiếp theo.");
  }

  if (game.unoPendingId && game.unoPendingId !== playerId) game.unoPendingId = null;
  player.hand.splice(index, 1);
  game.discardPile.push(card);
  game.topCard = card;
  game.activeColor = card.color || chosenColor;
  game.drawnCardId = null;

  let skipped = false;
  if (card.type === "reverse") {
    game.direction *= -1;
    if (game.players.length === 2) skipped = true;
  } else if (card.type === "skip") {
    skipped = true;
  } else if (card.type === "draw2" || card.type === "wild4") {
    const target = game.players[nextIndex(game)];
    const penalty = card.type === "draw2" ? 2 : 4;
    for (let i = 0; i < penalty; i++) drawOne(game, target);
    skipped = true;
  }

  if (player.hand.length === 0) {
    game.status = "ended";
    game.winnerId = player.id;
    game.unoPendingId = null;
    return { card, winnerId: player.id, nextPlayerId: null };
  }

  game.unoPendingId = player.hand.length === 1 && game.settings.unoPenalty ? player.id : null;
  advance(game, skipped ? 2 : 1);
  return { card, winnerId: null, nextPlayerId: currentPlayer(game)?.id || null };
}

function drawCard(game, playerId) {
  const player = requireTurn(game, playerId);
  if (game.drawnCardId) throw new Error("Bạn đã rút bài trong lượt này.");
  if (game.unoPendingId && game.unoPendingId !== playerId) game.unoPendingId = null;
  const card = drawOne(game, player);
  if (!card) {
    advance(game);
    return { card: null, canPlay: false, nextPlayerId: currentPlayer(game)?.id || null };
  }
  const canPlay = game.settings.allowPlayDrawnCard && isPlayable(game, player, card);
  if (canPlay) game.drawnCardId = card.id;
  else advance(game);
  return { card, canPlay, nextPlayerId: currentPlayer(game)?.id || null };
}

function passTurn(game, playerId) {
  const player = requireTurn(game, playerId);
  if (!game.drawnCardId) throw new Error("Bạn cần rút bài trước khi bỏ lượt.");
  if (game.unoPendingId && game.unoPendingId !== playerId) game.unoPendingId = null;
  game.drawnCardId = null;
  advance(game);
  return { nextPlayerId: currentPlayer(game)?.id || null };
}

function callUno(game, playerId) {
  const player = getPlayer(game, playerId);
  if (!player || player.hand.length !== 1 || game.unoPendingId !== playerId) {
    throw new Error("Bạn hiện không cần gọi UNO.");
  }
  game.unoPendingId = null;
  return true;
}

function catchUno(game, catcherId) {
  const offenderId = game.unoPendingId;
  if (!offenderId || offenderId === catcherId || !game.settings.unoPenalty) {
    throw new Error("Không có người chơi nào đang bị bắt lỗi UNO.");
  }
  const offender = getPlayer(game, offenderId);
  if (!offender || offender.hand.length !== 1) throw new Error("Trạng thái UNO không còn hợp lệ.");
  for (let i = 0; i < 2; i++) drawOne(game, offender);
  game.unoPendingId = null;
  return { offenderId, cardsAdded: 2 };
}

function timeoutTurn(game) {
  const player = currentPlayer(game);
  if (!player || game.status !== "playing") return null;
  if (game.unoPendingId && game.unoPendingId !== player.id) game.unoPendingId = null;
  if (game.drawnCardId) {
    game.drawnCardId = null;
    advance(game);
    return { action: "pass", playerId: player.id };
  }
  const card = drawOne(game, player);
  advance(game);
  return { action: "draw-and-pass", playerId: player.id, cardId: card?.id || null };
}

function publicState(game, viewerId) {
  if (!game) return null;
  return {
    status: game.status,
    players: game.players.map(p => ({
      id: p.id, name: p.name, cardCount: p.hand.length,
      isCurrent: p.id === currentPlayer(game)?.id,
      hand: p.id === viewerId ? p.hand.map(c => ({ ...c })) : undefined
    })),
    currentPlayerId: currentPlayer(game)?.id || null,
    direction: game.direction,
    activeColor: game.activeColor,
    topCard: { ...game.topCard },
    drawCount: game.drawPile.length,
    discardCount: game.discardPile.length,
    winnerId: game.winnerId,
    drawnCardId: game.drawnCardId,
    unoPendingId: game.unoPendingId,
    settings: { ...game.settings }
  };
}

module.exports = {
  COLORS, makeDeck, shuffle, createGame, currentPlayer, getPlayer,
  isPlayable, playCard, drawCard, passTurn, callUno, catchUno,
  timeoutTurn, publicState
};
