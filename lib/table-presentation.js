function playerPose(room, viewer, target, actionType) {
  if (!target || !target.alive) return "dead";
  const nightScene = room.phase === "nightIntro" || room.phase === "night" ||
    (room.phase === "deathshot" && room.afterDeathCallback === "afterNight");
  if (!nightScene) return "sitting";

  if (room.phase === "night" && room.subphase === "wolves" && target.role === "wolf") {
    const viewerIsWolf = !!viewer && viewer.alive && viewer.role === "wolf";
    const viewerPeeked = !!viewer && viewer.alive && viewer.role === "littleGirl" &&
      !!(room.night && room.night.peeked && room.night.peeked[viewer.id]);
    if (viewerIsWolf || viewerPeeked) return "acting";
  }

  if (viewer && viewer.id === target.id && actionType) return "acting";
  return "sleeping";
}

function allConnectedPlayersConfirmed(players) {
  return players.filter(player => player.connected).every(player => player.roleSeen);
}

module.exports = { playerPose, allConnectedPlayersConfirmed };
