const express = require("express");
const http = require("http");
const crypto = require("crypto");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true }, pingInterval: 25000, pingTimeout: 20000 });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (req, res) => res.json({ ok: true, rooms: rooms.size }));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const randomId = (n) => crypto.randomBytes(n || 8).toString("hex");
const makeCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const cleanName = (s) => String(s || "").replace(/[<>]/g, "").trim().slice(0, 18);
const roleText = {
  wolf: ["Ma sói", "Mỗi đêm cùng đồng đội chọn một người để cắn. Ban ngày hãy thuyết phục dân làng và che giấu thân phận."],
  villager: ["Dân làng", "Không có năng lực ban đêm. Hãy quan sát, thảo luận và tìm ra Ma sói."],
  seer: ["Tiên tri", "Mỗi đêm được soi một người để biết người đó có thuộc phe Ma sói hay không."],
  witch: ["Phù thủy", "Có một bình cứu và một bình độc cho cả ván. Mỗi bình chỉ dùng một lần."],
  protector: ["Bảo vệ", "Mỗi đêm chọn một người để bảo vệ khỏi bị Ma sói cắn. Không được bảo vệ cùng một người hai đêm liên tiếp."]
};
function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
function rolesFor(count) {
  const wolves = count >= 13 ? 4 : count >= 10 ? 3 : count >= 7 ? 2 : 1;
  const roles = Array(wolves).fill("wolf");
  roles.push("seer", "witch");
  if (count >= 7) roles.push("protector");
  while (roles.length < count) roles.push("villager");
  return shuffle(roles);
}
function clearTimer(room) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.endsAt = null;
}
function sendError(socket, message) { socket.emit("errorMessage", message); }
function alive(room) { return room.players.filter(p => p.alive); }
function wolves(room) { return alive(room).filter(p => p.role === "wolf"); }
function getPlayer(room, id) { return room.players.find(p => p.id === id); }
function checkWin(room) {
  const living = alive(room);
  const wolfCount = living.filter(p => p.role === "wolf").length;
  const townCount = living.length - wolfCount;
  if (wolfCount === 0) { room.status = "ended"; room.phase = "ended"; room.winner = "town"; room.announcement = "Dân làng đã tìm ra toàn bộ Ma sói!"; clearTimer(room); return true; }
  if (wolfCount >= townCount) { room.status = "ended"; room.phase = "ended"; room.winner = "wolf"; room.announcement = "Ma sói đã chiếm ưu thế và chiến thắng!"; clearTimer(room); return true; }
  return false;
}
function plurality(ids) {
  if (!ids.length) return null;
  const counts = new Map();
  ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
  const max = Math.max(...counts.values());
  const tied = [...counts.entries()].filter(x => x[1] === max).map(x => x[0]);
  return tied[Math.floor(Math.random() * tied.length)];
}
function publicState(room, player) {
  const ended = room.status === "ended";
  const me = player;
  const others = room.players.map(p => ({
    id: p.id, name: p.name, alive: p.alive, ready: p.ready, connected: p.connected,
    role: ended ? roleText[p.role][0] : undefined
  }));
  let actionType = null, prompt = "", targets = [], privateInfo = "";
  let actionDone = false;
  if (room.phase === "night" && me && me.alive) {
    const sub = room.subphase;
    if (sub === "protect" && me.role === "protector") {
      actionType = "protect"; prompt = "Chọn một người để bảo vệ đêm nay.";
      targets = alive(room).filter(p => p.id !== room.lastProtected).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "wolves" && me.role === "wolf") {
      actionType = "wolf"; prompt = "Ma sói: hãy chọn mục tiêu chung.";
      targets = alive(room).filter(p => p.role !== "wolf").map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.wolfVotes[me.id];
      privateInfo = "Đồng đội: " + wolves(room).filter(p => p.id !== me.id).map(p => p.name).join(", ");
    } else if (sub === "seer" && me.role === "seer") {
      actionType = "seer"; prompt = "Chọn một người để soi thân phận.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "witch" && me.role === "witch") {
      actionType = "witch"; prompt = "Phù thủy, hãy quyết định có sử dụng bình thuốc không.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
      privateInfo = room.night.wolfTarget ? ("Người bị Ma sói nhắm đến: " + (getPlayer(room, room.night.wolfTarget) || {}).name) : "Đêm nay Ma sói chưa chọn được mục tiêu.";
    }
  }
  if (room.phase === "vote" && me && me.alive) {
    actionType = "vote"; prompt = "Bỏ phiếu kín: chọn người bạn muốn đưa ra xét xử.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
    actionDone = !!room.votes[me.id];
  }
  const notes = me && room.privateNotes[me.id] ? room.privateNotes[me.id] : "";
  return {
    code: room.code, status: room.status, phase: room.phase, subphase: room.subphase || "",
    day: room.day, players: others, playerCount: room.players.length,
    settings: room.settings, endsAt: room.endsAt, announcement: room.announcement,
    winner: room.winner, chat: room.chat.slice(-35),
    self: me ? {
      id: me.id, name: me.name, alive: me.alive, ready: me.ready, role: me.role,
      roleName: roleText[me.role] ? roleText[me.role][0] : "",
      roleDescription: roleText[me.role] ? roleText[me.role][1] : "",
      actionType, prompt, targets, actionDone, privateInfo, privateNote: notes,
      witchSaveAvailable: me.role === "witch" && room.witchSaveAvailable,
      witchPoisonAvailable: me.role === "witch" && room.witchPoisonAvailable,
      wolfMates: me.role === "wolf" ? wolves(room).filter(p => p.id !== me.id).map(p => p.name) : []
    } : null,
    canStart: room.status === "lobby" && room.players.length >= 5 && room.players.length <= 16 && room.players.every(p => p.ready),
    voteReadyCount: room.voteReady.size,
    isRevealed: ended
  };
}
function broadcast(room) {
  room.players.forEach(p => {
    if (p.socketId) io.to(p.socketId).emit("state", publicState(room, p));
  });
}
function addChat(room, player, message) {
  room.chat.push({ id: randomId(4), name: player.name, message: String(message).trim().slice(0, 240), time: Date.now(), alive: player.alive });
  room.chat = room.chat.slice(-50);
}
function finishGame(room) {
  broadcast(room);
}
function setTimer(room, seconds, callback) {
  clearTimer(room);
  room.endsAt = Date.now() + seconds * 1000;
  room.timer = setTimeout(callback, seconds * 1000);
}
function createRoomObject(code, player) {
  return {
    code, players: [player], status: "lobby", phase: "lobby", subphase: "",
    settings: { discussionSeconds: 180, voteSeconds: 45, nightSeconds: 35 },
    day: 0, timer: null, endsAt: null, announcement: "Đang chờ mọi người tham gia.",
    winner: null, night: null, votes: {}, voteReady: new Set(), chat: [],
    privateNotes: {}, witchSaveAvailable: true, witchPoisonAvailable: true, lastProtected: null
  };
}
function joinPlayer(socket, room, player, token) {
  player.socketId = socket.id;
  player.connected = true;
  socket.join(room.code);
  socket.emit("joined", { code: room.code, token, playerId: player.id });
  broadcast(room);
}
function startGame(room) {
  if (room.status !== "lobby" || room.players.length < 5 || room.players.length > 16 || !room.players.every(p => p.ready)) return false;
  const roles = rolesFor(room.players.length);
  room.players.forEach((p, i) => { p.role = roles[i]; p.alive = true; p.ready = false; });
  room.status = "playing"; room.day = 0; room.winner = null;
  room.witchSaveAvailable = true; room.witchPoisonAvailable = true; room.lastProtected = null;
  room.announcement = "Vai trò đã được chia bí mật. Ván chơi bắt đầu!";
  startNight(room);
  return true;
}
function setNightStep(room, index) {
  const steps = ["protect", "wolves", "seer", "witch"];
  while (index < steps.length) {
    const step = steps[index];
    const role = step === "wolves" ? "wolf" : step;
    const players = alive(room).filter(p => p.role === role);
    if (players.length) {
      room.subphase = step;
      room.night.stepIndex = index;
      if (step === "wolves") {
        room.night.wolfVotes = {};
      } else {
        room.night.done = {};
      }
      room.announcement = step === "protect" ? "Đêm: Bảo vệ thức dậy." :
        step === "wolves" ? "Đêm: Ma sói đang chọn mục tiêu." :
        step === "seer" ? "Đêm: Tiên tri thức dậy." : "Đêm: Phù thủy thức dậy.";
      broadcast(room);
      setTimer(room, room.settings.nightSeconds, () => advanceNight(room));
      return;
    }
    index++;
  }
  resolveNight(room);
}
function startNight(room) {
  if (room.status !== "playing") return;
  room.phase = "night"; room.subphase = "";
  room.night = { protectTarget: null, wolfVotes: {}, wolfTarget: null, seerTarget: null, witchSave: false, witchPoisonTarget: null, done: {} };
  room.privateNotes = {};
  room.voteReady = new Set();
  setNightStep(room, 0);
}
function advanceNight(room) {
  if (room.status !== "playing" || room.phase !== "night") return;
  clearTimer(room);
  setNightStep(room, room.night.stepIndex + 1);
}
function resolveNight(room) {
  clearTimer(room);
  const deaths = [];
  const target = room.night.wolfTarget;
  if (target && target !== room.night.protectTarget && !(room.night.witchSave && target)) deaths.push(target);
  if (room.night.witchPoisonTarget && !deaths.includes(room.night.witchPoisonTarget)) deaths.push(room.night.witchPoisonTarget);
  deaths.forEach(id => { const p = getPlayer(room, id); if (p && p.alive) p.alive = false; });
  if (room.night.protectTarget) room.lastProtected = room.night.protectTarget;
  else room.lastProtected = null;
  const names = deaths.map(id => (getPlayer(room, id) || {}).name).filter(Boolean);
  room.announcement = names.length ? ("Trời sáng! Người không qua khỏi đêm nay: " + names.join(", ") + ".") : "Trời sáng! Đêm qua không có ai bị loại.";
  if (checkWin(room)) { finishGame(room); return; }
  room.phase = "discussion"; room.subphase = "";
  room.day += 1; room.voteReady = new Set();
  broadcast(room);
  setTimer(room, room.settings.discussionSeconds, () => startVote(room));
}
function startVote(room) {
  if (room.status !== "playing") return;
  clearTimer(room);
  room.phase = "vote"; room.subphase = ""; room.votes = {}; room.voteReady = new Set();
  room.announcement = "Thời gian thảo luận kết thúc. Hãy bỏ phiếu kín!";
  broadcast(room);
  setTimer(room, room.settings.voteSeconds, () => resolveVote(room));
}
function resolveVote(room) {
  if (room.status !== "playing" || room.phase !== "vote") return;
  clearTimer(room);
  const targetId = plurality(Object.values(room.votes));
  const target = targetId && getPlayer(room, targetId);
  if (target && target.alive) {
    target.alive = false;
    room.announcement = "Kết quả bỏ phiếu: " + target.name + " bị loại khỏi làng.";
  } else {
    room.announcement = "Kết quả bỏ phiếu hòa hoặc không đủ phiếu. Không ai bị loại.";
  }
  if (checkWin(room)) { finishGame(room); return; }
  broadcast(room);
  setTimeout(() => { if (room.status === "playing") startNight(room); }, 3500);
}
function handleNightAction(socket, room, player, data) {
  if (room.status !== "playing" || room.phase !== "night" || !player.alive) return;
  const sub = room.subphase;
  const target = getPlayer(room, data && data.targetId);
  if (sub === "wolves" && player.role === "wolf") {
    if (!target || !target.alive || target.role === "wolf") return sendError(socket, "Hãy chọn một người còn sống không thuộc phe Ma sói.");
    room.night.wolfVotes[player.id] = target.id;
    const livingWolves = wolves(room);
    if (livingWolves.every(p => room.night.wolfVotes[p.id])) {
      room.night.wolfTarget = plurality(livingWolves.map(p => room.night.wolfVotes[p.id]));
      advanceNight(room);
    } else broadcast(room);
    return;
  }
  if (room.night.done[player.id]) return;
  if (sub === "protect" && player.role === "protector") {
    if (!target || !target.alive || target.id === room.lastProtected) return sendError(socket, "Mục tiêu không hợp lệ hoặc đã được bảo vệ đêm trước.");
    room.night.protectTarget = target.id;
    room.night.done[player.id] = true;
    advanceNight(room); return;
  }
  if (sub === "seer" && player.role === "seer") {
    if (!target || !target.alive || target.id === player.id) return sendError(socket, "Hãy chọn một người chơi khác còn sống.");
    room.night.seerTarget = target.id;
    room.privateNotes[player.id] = target.role === "wolf" ? (target.name + " thuộc phe Ma sói.") : (target.name + " không thuộc phe Ma sói.");
    room.night.done[player.id] = true;
    advanceNight(room); return;
  }
  if (sub === "witch" && player.role === "witch") {
    const action = data && data.action;
    if (action === "save") {
      if (!room.witchSaveAvailable || !room.night.wolfTarget) return sendError(socket, "Không còn bình cứu hoặc đêm nay không có mục tiêu bị cắn.");
      room.night.witchSave = true; room.witchSaveAvailable = false;
    } else if (action === "poison") {
      if (!room.witchPoisonAvailable || !target || !target.alive) return sendError(socket, "Không còn bình độc hoặc mục tiêu không hợp lệ.");
      room.night.witchPoisonTarget = target.id; room.witchPoisonAvailable = false;
    }
    room.night.done[player.id] = true;
    advanceNight(room); return;
  }
}
function attachPlayer(socket, room, player, token) {
  if (player.socketId && player.socketId !== socket.id) {
    const old = io.sockets.sockets.get(player.socketId);
    if (old) old.leave(room.code);
  }
  joinPlayer(socket, room, player, token);
}

io.on("connection", (socket) => {
  socket.on("createRoom", (payload) => {
    const name = cleanName(payload && payload.name);
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    if ([...rooms.values()].some(r => r.players.some(p => p.name.toLowerCase() === name.toLowerCase()))) {
      // Same display name is allowed in a different room.
    }
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    const token = randomId(18);
    const player = { id: randomId(8), name, token, socketId: null, connected: true, ready: false, alive: true, role: null };
    const room = createRoomObject(code, player);
    rooms.set(code, room);
    attachPlayer(socket, room, player, token);
  });
  socket.on("joinRoom", (payload) => {
    const code = String(payload && payload.code || "").trim().toUpperCase();
    const name = cleanName(payload && payload.name);
    const token = String(payload && payload.token || "");
    const room = rooms.get(code);
    if (!room) return sendError(socket, "Không tìm thấy phòng. Kiểm tra lại mã phòng nhé.");
    let player = token ? room.players.find(p => p.token === token) : null;
    if (player) {
      if (player.name.toLowerCase() !== name.toLowerCase() && name) return sendError(socket, "Tên không khớp với phiên chơi đã lưu.");
      return attachPlayer(socket, room, player, token);
    }
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    if (room.status !== "lobby") return sendError(socket, "Ván chơi đã bắt đầu. Chỉ người chơi cũ có mã phiên mới vào lại được.");
    if (room.players.length >= 16) return sendError(socket, "Phòng đã đủ 16 người.");
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) return sendError(socket, "Tên này đã có trong phòng, hãy chọn tên khác.");
    const newToken = randomId(18);
    player = { id: randomId(8), name, token: newToken, socketId: null, connected: true, ready: false, alive: true, role: null };
    room.players.push(player);
    attachPlayer(socket, room, player, newToken);
  });
  socket.on("ready", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return;
    const p = room.players.find(x => x.socketId === socket.id);
    p.ready = !p.ready; broadcast(room);
  });
  socket.on("startGame", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    if (!startGame(room)) return sendError(socket, "Cần ít nhất 5 người và tất cả người chơi phải sẵn sàng.");
    broadcast(room);
  });
  socket.on("nightAction", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    handleNightAction(socket, room, p, data || {});
    broadcast(room);
  });
  socket.on("vote", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "vote") return;
    const p = room.players.find(x => x.socketId === socket.id);
    const target = getPlayer(room, data && data.targetId);
    if (!p || !p.alive || !target || !target.alive || p.id === target.id) return sendError(socket, "Phiếu không hợp lệ.");
    if (room.votes[p.id]) return sendError(socket, "Bạn đã bỏ phiếu rồi.");
    room.votes[p.id] = target.id;
    if (alive(room).every(x => room.votes[x.id])) resolveVote(room);
    else broadcast(room);
  });
  socket.on("readyVote", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive) return;
    room.voteReady.add(p.id);
    if (room.voteReady.size > alive(room).length / 2) startVote(room);
    else broadcast(room);
  });
  socket.on("chat", (payload) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive) return;
    if (p.lastChatAt && Date.now() - p.lastChatAt < 1200) return;
    const message = String(payload && payload.message || "").trim().slice(0, 240);
    if (!message) return;
    p.lastChatAt = Date.now();
    addChat(room, p, message); broadcast(room);
  });
  socket.on("leaveRoom", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    socket.leave(room.code); broadcast(room);
  });
  socket.on("disconnect", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    broadcast(room);
  });
});

server.listen(PORT, () => console.log("Ma Soi Online running on port " + PORT));
