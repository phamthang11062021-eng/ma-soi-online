const test = require("node:test");
const assert = require("node:assert/strict");
const { isWolfTeam, piperHasWon, angelWinsOnVote, chooseScapegoat } = require("../lib/role-rules");

test("wolf variants are recognized as the wolf team", () => {
  for (const role of ["wolf", "white-wolf", "wolf-cub"]) assert.equal(isWolfTeam(role), true);
  for (const role of ["villager", "seer", "pied-piper", "angel"]) assert.equal(isWolfTeam(role), false);
});
test("piper wins only while alive and every other living player is enchanted", () => {
  const living = [{id:"p",alive:true},{id:"a",alive:true},{id:"b",alive:true}];
  assert.equal(piperHasWon(living, new Set(["a","b"]), "p"), true);
  assert.equal(piperHasWon(living, new Set(["a"]), "p"), false);
  assert.equal(piperHasWon(living, new Set(["a","b"]), "missing"), false);
  assert.equal(piperHasWon([{id:"p",alive:false}], new Set(), "p"), false);
});
test("angel only wins when voted out on the first day", () => {
  assert.equal(angelWinsOnVote("angel", 1), true);
  assert.equal(angelWinsOnVote("angel", 2), false);
  assert.equal(angelWinsOnVote("villager", 1), false);
});
test("scapegoat selection ignores dead players", () => {
  const living = [{id:"a",role:"villager",alive:true},{id:"b",role:"scapegoat",alive:true},{id:"c",role:"scapegoat",alive:false}];
  assert.equal(chooseScapegoat(living).id, "b");
  assert.equal(chooseScapegoat([{id:"x",role:"villager",alive:true}]), null);
});

test("thief reserve cards respect the host's enabled custom roles", () => {
  const { eligibleThiefReserveRoles } = require("../lib/role-rules");
  const pool = eligibleThiefReserveRoles(
    ["seer", "witch", "white-wolf", "wolf-cub", "thief", "scapegoat"],
    ["thief", "seer"],
    ["thief", "seer", "witch", "scapegoat"]
  );
  assert.deepEqual(pool, ["villager", "witch", "scapegoat"]);
});
test("excluded voters do not block automatic vote resolution", () => {
  const { allEligibleVotersVoted } = require("../lib/role-rules");
  const players = [
    { id: "a", alive: true },
    { id: "b", alive: true },
    { id: "c", alive: true }
  ];
  assert.equal(allEligibleVotersVoted(players, { a: "b", b: "a" }, new Set(["c"])), true);
  assert.equal(allEligibleVotersVoted(players, { a: "b" }, new Set(["c"])), false);
  assert.equal(allEligibleVotersVoted(players, { a: "b", b: "a", c: "a" }, []), true);
});
