const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const roleSource = fs.readFileSync(path.join(root, "public", "roles.js"), "utf8");
const serverSource = fs.readFileSync(path.join(root, "server.js"), "utf8");
const roleEntries = [...roleSource.matchAll(/\{id:"([^"]+)"[^}]*status:"([^"]+)"/g)];
const roleStatus = new Map(roleEntries.map(([, id, status]) => [id, status]));
const guideStart = serverSource.indexOf("const ROLE_GUIDES = {");
const guideEnd = serverSource.indexOf("\n};", guideStart);
const guideSource = serverSource.slice(guideStart, guideEnd);
const guideIds = [...guideSource.matchAll(/^\s{2}(?:"([^"]+)"|([A-Za-z_$][\w$]*)):\s*\{/gm)]
  .map(match => match[1] || match[2]);

test("every role implemented by the server has a playable archive card", () => {
  assert.ok(guideIds.length > 0, "server role guide list should be detected");
  for (const id of guideIds) {
    assert.equal(roleStatus.get(id), "playable", "Missing or incorrectly labelled archive role: " + id);
  }
});

test("archive-only concepts are clearly marked as planned", () => {
  const guideSet = new Set(guideIds);
  for (const [id, status] of roleStatus) {
    if (!guideSet.has(id)) assert.equal(status, "planned", "Unimplemented role must remain planned: " + id);
  }
  assert.equal(roleStatus.size, 21);
  assert.equal([...roleStatus.values()].filter(status => status === "playable").length, 18);
  assert.equal([...roleStatus.values()].filter(status => status === "planned").length, 3);
});
