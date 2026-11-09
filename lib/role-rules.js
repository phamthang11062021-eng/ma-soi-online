const WOLF_TEAM = new Set(["wolf", "white-wolf", "wolf-cub"]);
function isWolfTeam(role) { return WOLF_TEAM.has(role); }
function piperHasWon(livingPlayers, enchantedIds, piperId) {
  const enchanted = enchantedIds instanceof Set ? enchantedIds : new Set(enchantedIds || []);
  return livingPlayers.some(p => p.id === piperId && p.alive) &&
    livingPlayers.filter(p => p.id !== piperId).every(p => enchanted.has(p.id));
}
function angelWinsOnVote(role, day) { return role === "angel" && day === 1; }
function chooseScapegoat(livingPlayers) { return livingPlayers.find(p => p.role === "scapegoat") || null; }
function eligibleThiefReserveRoles(configurableRoles, assignedRoles, enabledRoles) {
  const assigned = new Set(assignedRoles || []);
  const enabled = new Set(Array.isArray(enabledRoles) ? enabledRoles : configurableRoles);
  const additional = configurableRoles.filter(role =>
    enabled.has(role) && !assigned.has(role) && !isWolfTeam(role) && role !== "thief"
  );
  return [...new Set(["villager", ...additional])];
}
function allEligibleVotersVoted(players, votes, excludedIds = []) {
  const excluded = excludedIds instanceof Set ? excludedIds : new Set(excludedIds || []);
  const ballot = votes || {};
  return players
    .filter(player => player.alive && !excluded.has(player.id))
    .every(player => Object.prototype.hasOwnProperty.call(ballot, player.id) && !!ballot[player.id]);
}
module.exports = {
  isWolfTeam, piperHasWon, angelWinsOnVote, chooseScapegoat,
  eligibleThiefReserveRoles, allEligibleVotersVoted
};
