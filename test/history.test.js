const test = require("node:test");
const assert = require("node:assert/strict");
const { addHistoryEvent, visibleHistory, MAX_HISTORY_EVENTS } = require("../lib/history");

test("public history is visible to every player", () => {
  const room = { day: 2, phase: "discussion", history: [] };
  addHistoryEvent(room, { message: "Bình minh: An đã bị loại." });
  assert.equal(visibleHistory(room, { id: "p1" }).length, 1);
  assert.equal(visibleHistory(room, { id: "p2" }).length, 1);
});

test("private history is visible only to listed player IDs", () => {
  const room = { day: 1, phase: "night", history: [] };
  addHistoryEvent(room, {
    message: "Kết quả soi: Bình thuộc phe Ma sói.",
    visibility: "private",
    playerIds: ["seer-1"]
  });
  assert.equal(visibleHistory(room, { id: "seer-1" }).length, 1);
  assert.equal(visibleHistory(room, { id: "villager-1" }).length, 0);
  assert.equal(visibleHistory(room, null).length, 0);
});

test("private recipient IDs are never returned to clients", () => {
  const room = { day: 1, phase: "night", history: [] };
  addHistoryEvent(room, {
    message: "Bí mật của Tiên tri.",
    visibility: "private",
    playerIds: ["seer-1", "seer-1"]
  });
  const event = visibleHistory(room, { id: "seer-1" })[0];
  assert.equal(event.visibility, "private");
  assert.equal(Object.hasOwn(event, "playerIds"), false);
});

test("history is capped to the newest 150 events", () => {
  const room = { day: 1, phase: "discussion", history: [] };
  for (let i = 0; i < MAX_HISTORY_EVENTS + 12; i++) {
    addHistoryEvent(room, { message: "Sự kiện " + i });
  }
  const events = visibleHistory(room, { id: "p1" });
  assert.equal(events.length, MAX_HISTORY_EVENTS);
  assert.equal(events[0].message, "Sự kiện 12");
  assert.equal(events.at(-1).message, "Sự kiện " + (MAX_HISTORY_EVENTS + 11));
});
