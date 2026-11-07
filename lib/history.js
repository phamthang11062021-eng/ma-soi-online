const crypto = require("crypto");

const MAX_HISTORY_EVENTS = 150;

function addHistoryEvent(room, options = {}) {
  if (!Array.isArray(room.history)) room.history = [];
  const visibility = options.visibility === "private" ? "private" : "public";
  const playerIds = visibility === "private"
    ? [...new Set((Array.isArray(options.playerIds) ? options.playerIds : []).filter(Boolean))]
    : [];
  const message = String(options.message || "").trim().slice(0, 240);
  if (!message) return null;

  const event = {
    id: crypto.randomBytes(5).toString("hex"),
    day: Number.isInteger(room.day) ? room.day : 0,
    phase: String(room.phase || "lobby"),
    kind: String(options.kind || "system").slice(0, 24),
    message,
    visibility,
    playerIds,
    timestamp: Date.now()
  };
  room.history.push(event);
  if (room.history.length > MAX_HISTORY_EVENTS) {
    room.history.splice(0, room.history.length - MAX_HISTORY_EVENTS);
  }
  return event;
}

function visibleHistory(room, player) {
  if (!room || !Array.isArray(room.history)) return [];
  return room.history
    .filter(event => event.visibility === "public" ||
      (player && Array.isArray(event.playerIds) && event.playerIds.includes(player.id)))
    .map(event => ({
      id: event.id,
      day: event.day,
      phase: event.phase,
      kind: event.kind,
      message: event.message,
      visibility: event.visibility,
      timestamp: event.timestamp
    }));
}

module.exports = { addHistoryEvent, visibleHistory, MAX_HISTORY_EVENTS };
