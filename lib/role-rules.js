const WOLF_TEAM = new Set(["wolf", "white-wolf", "wolf-cub"]);
function isWolfTeam(role) { return WOLF_TEAM.has(role); }
function piperHasWon(livingPlayers, enchantedIds, piperId) {
  const enchanted = enchantedIds instanceof Set ? enchantedIds : new Set(enchantedIds || []);
  return livingPlayers.some(p => p.id === piperId && p.alive) &&
    livingPlayers.filter(p => p.id !== piperId).every(p => enchanted.has(p.id));
}
function angelWinsOnVote(role, day) { return role === "angel" && day === 1; }
function chooseScapegoat(livingPlayers) { return livingPlayers.find(p => p.role === "scapegoat") || null; }
module.exports = { isWolfTeam, piperHasWon, angelWinsOnVote, chooseScapegoat };
