const test = require("node:test");
const assert = require("node:assert/strict");
const { playerPose, allConnectedPlayersConfirmed } = require("../lib/table-presentation");

function player(id, role, alive = true) { return { id, role, alive, connected: true }; }

test("all living players sit during lobby, dealing, role reveal and daytime", () => {
  for (const phase of ["lobby", "dealing", "roleReveal", "daybreak", "discussion", "vote"]) {
    const room = { phase, subphase: "", afterDeathCallback: null };
    assert.equal(playerPose(room, player("viewer", "villager"), player("target", "seer"), null), "sitting", phase);
  }
});

test("all living players sleep during night intro and private night turns by default", () => {
  const viewer = player("seer", "seer");
  const target = player("wolf", "wolf");
  assert.equal(playerPose({ phase: "nightIntro" }, viewer, target, null), "sleeping");
  assert.equal(playerPose({ phase: "night", subphase: "seer", night: { peeked: {} } }, viewer, target, "seer"), "sleeping");
});

test("only the active player sees their own character wake for a private role action", () => {
  const viewer = player("seer", "seer");
  const target = player("seer", "seer");
  const room = { phase: "night", subphase: "seer", night: { peeked: {} } };
  assert.equal(playerPose(room, viewer, target, "seer"), "acting");
  assert.equal(playerPose(room, player("villager", "villager"), target, null), "sleeping");
});

test("wolves see their own pack awake, while villagers see the pack asleep", () => {
  const wolf = player("wolf-a", "wolf");
  const packmate = player("wolf-b", "wolf");
  const room = { phase: "night", subphase: "wolves", night: { peeked: {} } };
  assert.equal(playerPose(room, wolf, packmate, "wolf"), "acting");
  assert.equal(playerPose(room, player("villager", "villager"), packmate, null), "sleeping");
});

test("little girl sees wolves awake only after using the peek action", () => {
  const wolf = player("wolf-a", "wolf");
  const girl = player("girl", "littleGirl");
  const beforePeek = { phase: "night", subphase: "wolves", night: { peeked: {} } };
  const afterPeek = { phase: "night", subphase: "wolves", night: { peeked: { girl: true } } };
  assert.equal(playerPose(beforePeek, girl, wolf, "peek"), "sleeping");
  assert.equal(playerPose(afterPeek, girl, wolf, "peek"), "acting");
});

test("dead players never wake; night-time hunter resolution keeps living villagers asleep", () => {
  const dead = player("dead-seer", "seer", false);
  const living = player("living", "villager");
  const room = { phase: "deathshot", afterDeathCallback: "afterNight" };
  assert.equal(playerPose(room, living, dead, null), "dead");
  assert.equal(playerPose(room, living, living, null), "sleeping");
});

test("role reveal completes when every connected player has confirmed", () => {
  assert.equal(allConnectedPlayersConfirmed([{ connected: true, roleSeen: true }, { connected: true, roleSeen: true }]), true);
  assert.equal(allConnectedPlayersConfirmed([{ connected: true, roleSeen: true }, { connected: true, roleSeen: false }]), false);
});

test("disconnected players do not block role reveal; reconnecting player can still receive their private role", () => {
  assert.equal(allConnectedPlayersConfirmed([{ connected: true, roleSeen: true }, { connected: false, roleSeen: false }]), true);
});
