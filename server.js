const express = require("express");
const http = require("http");
const crypto = require("crypto");
const path = require("path");
const { Server } = require("socket.io");
const { addHistoryEvent, visibleHistory } = require("./lib/history");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true }, pingInterval: 25000, pingTimeout: 20000 });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (req, res) => res.json({ ok: true, rooms: rooms.size }));
app.get("/werewolf", (req, res) => res.sendFile(path.join(__dirname, "public", "werewolf.html")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const randomId = (n = 8) => crypto.randomBytes(n).toString("hex");
const makeCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const cleanName = (s) => String(s || "").replace(/[<>]/g, "").trim().slice(0, 18);

const ROLE_GUIDES = {
  wolf: {
    name: "Ma sói", team: "Phe Ma sói", summary: "Ẩn mình giữa dân làng và loại bỏ phe dân vào ban đêm.",
    objective: "Sống sót đến khi số Ma sói còn sống bằng hoặc nhiều hơn số người phe dân còn sống.",
    power: "Mỗi đêm, các Ma sói cùng bỏ phiếu chọn một người để cắn. Bạn nhìn thấy tên đồng đội Ma sói.",
    how: ["Khi đến lượt Ma sói, chọn một người không thuộc phe sói.", "Nếu có nhiều sói, hãy thống nhất mục tiêu bằng phiếu kín.", "Ban ngày, tham gia thảo luận như người bình thường và tránh để lộ thân phận."],
    tips: "Đừng bỏ phiếu quá khác biệt với đồng đội một cách bất thường. Quan sát cách người khác lập luận.",
    limits: "Không thể cắn đồng đội. Người đã chết không thể hành động."
  },
  villager: {
    name: "Dân làng", team: "Phe Dân làng", summary: "Dùng suy luận và biểu quyết để tìm ra Ma sói.",
    objective: "Giúp phe dân loại bỏ toàn bộ Ma sói.",
    power: "Không có kỹ năng ban đêm. Sức mạnh của bạn là thảo luận, quan sát và lá phiếu.",
    how: ["Ban đêm, chờ các vai có kỹ năng hành động.", "Ban ngày, đọc thông báo và trao đổi với người còn sống.", "Khi đến lượt bỏ phiếu, chọn người bạn nghi ngờ nhất."],
    tips: "Ghi nhớ ai bảo vệ ai, ai thay đổi lời khai và ai thường né tránh câu hỏi.",
    limits: "Không được chat hoặc bỏ phiếu sau khi bị loại."
  },
  seer: {
    name: "Tiên tri", team: "Phe Dân làng", summary: "Mỗi đêm kiểm tra bí mật một người.",
    objective: "Tìm Ma sói và giúp dân làng có căn cứ để bỏ phiếu.",
    power: "Mỗi đêm chọn một người còn sống để soi. Kết quả chỉ gửi riêng cho bạn: thuộc phe sói hoặc không thuộc phe sói.",
    how: ["Khi màn hình hiện lượt Tiên tri, chọn một người còn sống.", "Đọc kết quả riêng trong phần thông tin bí mật của bạn.", "Ban ngày, cân nhắc cách chia sẻ thông tin để không bị Ma sói phát hiện quá sớm."],
    tips: "Ưu tiên soi người có ảnh hưởng hoặc có lời nói đáng ngờ. Ghi nhớ kết quả qua từng đêm.",
    limits: "Bạn không biết chính xác vai của người được soi; chỉ biết họ có thuộc phe Ma sói hay không."
  },
  witch: {
    name: "Phù thủy", team: "Phe Dân làng", summary: "Sở hữu một bình cứu và một bình độc cho cả ván.",
    objective: "Dùng thuốc đúng lúc để cứu phe dân và loại bỏ Ma sói.",
    power: "Có một bình cứu người bị sói nhắm đến và một bình độc để chọn một người còn sống. Mỗi bình chỉ dùng một lần trong cả ván; mỗi đêm chỉ chọn một hành động.",
    how: ["Khi đến lượt Phù thủy, đọc thông tin người bị sói nhắm đến (nếu có).", "Chọn Dùng bình cứu, chọn một người để dùng bình độc, hoặc Bỏ qua.", "Hãy cân nhắc kỹ vì bình thuốc đã dùng sẽ không hồi lại."],
    tips: "Không cần dùng thuốc ngay đêm đầu. Hãy cân nhắc thông tin và số người còn sống.",
    limits: "Mỗi bình chỉ dùng một lần. Trong phiên bản hiện tại, mỗi đêm chỉ thực hiện một lựa chọn thuốc."
  },
  protector: {
    name: "Bảo vệ", team: "Phe Dân làng", summary: "Chọn một người để che chở khỏi đòn cắn của Ma sói.",
    objective: "Giữ những người có ích cho phe dân sống sót.",
    power: "Mỗi đêm chọn một người còn sống để bảo vệ khỏi bị sói cắn. Không thể chọn cùng một người trong hai đêm liên tiếp.",
    how: ["Khi đến lượt Bảo vệ, chọn một người trong danh sách.", "Lựa chọn được giữ bí mật.", "Sang đêm tiếp theo, hãy đổi mục tiêu nếu người vừa bảo vệ vẫn còn sống."],
    tips: "Cân nhắc bảo vệ người có thông tin quan trọng hoặc người đang bị nghi ngờ nhiều.",
    limits: "Không thể bảo vệ cùng một người hai đêm liên tiếp. Bảo vệ không chặn được bình độc."
  },
  hunter: {
    name: "Thợ săn", team: "Phe Dân làng", summary: "Khi bị loại, có một phát súng cuối cùng.",
    objective: "Dùng phát súng cuối để kéo Ma sói ra ánh sáng và giúp phe dân thắng.",
    power: "Khi bị loại bởi bất kỳ nguyên nhân nào, bạn có 20 giây để chọn một người còn sống bắn theo. Mỗi ván chỉ có một phát súng.",
    how: ["Nếu bị loại, màn hình sẽ hiện lượt cuối của Thợ săn.", "Chọn một người còn sống mà bạn nghi ngờ nhất.", "Nếu không chọn trong thời gian cho phép, lượt bắn sẽ bị bỏ qua."],
    tips: "Ghi nhớ các biểu hiện đáng ngờ từ đầu ván; đừng chọn theo cảm tính ở giây cuối.",
    limits: "Chỉ có một phát súng. Không thể bắn người đã bị loại."
  },
  cupid: {
    name: "Thần tình yêu", team: "Phe Dân làng (trừ khi ghép đôi khác phe)", summary: "Ghép hai người thành một đôi định mệnh.",
    objective: "Giúp phe của đôi tình nhân chiến thắng. Nếu ghép một người sói với một người dân và chỉ còn hai người yêu sống, đôi tình nhân thắng riêng.",
    power: "Trong đêm đầu tiên, chọn hai người còn sống làm đôi tình nhân. Hai người được ghép sẽ biết nhau; nếu một người chết, người kia cũng chết vì đau lòng.",
    how: ["Ở đêm đầu tiên, chọn người thứ nhất.", "Chọn người thứ hai khác người thứ nhất rồi xác nhận ghép đôi.", "Sau đó, quan sát để bảo vệ đôi tình nhân và tránh để họ bị loại."],
    tips: "Bạn có thể ghép bất kỳ hai người còn sống, kể cả chính mình.",
    limits: "Chỉ ghép đôi một lần vào đêm đầu tiên. Khi một người yêu chết, người còn lại cũng bị loại."
  },
  elder: {
    name: "Già làng", team: "Phe Dân làng", summary: "Có thể sống sót sau đòn cắn đầu tiên của Ma sói.",
    objective: "Sống sót và dùng kinh nghiệm giúp phe dân tìm ra sói.",
    power: "Lần đầu bị Ma sói cắn, bạn sống sót và lớp bảo hộ mất đi. Nếu bị cắn lần nữa, bị bỏ phiếu loại hoặc trúng độc, bạn sẽ chết bình thường.",
    how: ["Bạn không cần bấm gì vào ban đêm.", "Nếu sống sót sau một đêm bị tấn công, hãy tiếp tục thảo luận vào ban ngày.", "Dùng thông tin và kinh nghiệm để giúp dân làng."],
    tips: "Đừng vội tiết lộ vai trò nếu chưa cần thiết; việc lộ vai có thể khiến sói đổi mục tiêu.",
    limits: "Chỉ chặn được một lần Ma sói cắn. Không chống được bình độc hay bỏ phiếu."
  },
  littleGirl: {
    name: "Cô bé", team: "Phe Dân làng", summary: "Có thể lén quan sát Ma sói trong đêm.",
    objective: "Thu thập thông tin về phe sói mà không để lộ thân phận.",
    power: "Trong lượt Ma sói, bạn có thể bấm Quan sát lén để nhận danh sách những người thuộc phe sói.",
    how: ["Khi màn hình hiện lượt Ma sói, tìm nút Quan sát lén.", "Bấm nút để xem thông tin riêng về những người thuộc phe sói.", "Dùng thông tin đó một cách khéo léo khi thảo luận ban ngày."],
    tips: "Không nên công khai ngay rằng bạn biết danh tính sói; hãy dùng câu hỏi và lập luận để kiểm chứng.",
    limits: "Quan sát chỉ dùng trong lúc Ma sói thức dậy. Thông tin chỉ hiển thị cho bạn."
  },
  mayor: {
    name: "Thị trưởng", team: "Phe Dân làng", summary: "Lá phiếu của bạn có trọng số gấp đôi.",
    objective: "Dùng tiếng nói có trọng lượng để giúp dân làng loại đúng người.",
    power: "Khi còn sống, phiếu bầu ban ngày của bạn được tính là hai phiếu.",
    how: ["Tham gia thảo luận như bình thường.", "Trong lượt bỏ phiếu, chọn một người như mọi người khác.", "Hệ thống tự động tính lá phiếu của bạn gấp đôi."],
    tips: "Hãy giải thích rõ lý do trước khi bỏ phiếu để người khác có thể cân nhắc.",
    limits: "Chỉ tăng trọng số phiếu ban ngày; không có tác dụng khi bạn đã bị loại."
  },
  medium: {
    name: "Thầy đồng", team: "Phe Dân làng", summary: "Một lần trong ván, hỏi thân phận của một người đã chết.",
    objective: "Dùng manh mối từ người đã khuất để tìm Ma sói.",
    power: "Một lần trong cả ván, vào ban đêm bạn có thể chọn một người đã bị loại để biết chính xác vai trò của họ.",
    how: ["Sau khi có người bị loại, chờ lượt Thầy đồng vào ban đêm.", "Chọn một người đã chết trong danh sách.", "Đọc kết quả riêng; bạn không thể dùng năng lực lần thứ hai."],
    tips: "Hãy chọn người mà vai trò của họ có thể giúp giải đáp nhiều nghi vấn nhất.",
    limits: "Chỉ dùng một lần trong cả ván và chỉ chọn người đã bị loại."
  }
};

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
const CONFIGURABLE_ROLES = ["seer", "witch", "protector", "cupid", "hunter", "elder", "littleGirl", "mayor", "medium"];
function rolesFor(count, settings = {}) {
  const automaticWolfCount = count >= 14 ? 4 : count >= 10 ? 3 : count >= 7 ? 2 : 1;
  const requestedWolfCount = Number(settings.wolfCount) || 0;
  const wolfCount = Math.min(Math.max(1, requestedWolfCount || automaticWolfCount), Math.max(1, count - 2));
  const roles = Array(wolfCount).fill("wolf");

  if (settings.customRoles) {
    const enabled = new Set(Array.isArray(settings.enabledRoles) ? settings.enabledRoles : CONFIGURABLE_ROLES);
    for (const role of CONFIGURABLE_ROLES) {
      if (enabled.has(role) && roles.length < count - 1) roles.push(role);
    }
  } else {
    roles.push("seer", "witch");
    if (count >= 6) roles.push("protector");
    if (count >= 7) roles.push("cupid");
    if (count >= 8) roles.push("hunter");
    if (count >= 9) roles.push("elder");
    if (count >= 10) roles.push("littleGirl");
    if (count >= 11) roles.push("mayor");
    if (count >= 12) roles.push("medium");
  }

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
  if (room.loverPair && room.loverPair.length === 2) {
    const [a, b] = room.loverPair.map(id => getPlayer(room, id));
    if (a && b && a.alive && b.alive && ((a.role === "wolf") !== (b.role === "wolf")) && living.length === 2) {
      room.status = "ended"; room.phase = "ended"; room.winner = "lovers";
      room.announcement = "Đôi tình nhân khác phe đã sống sót đến cuối cùng và giành chiến thắng!";
      addHistoryEvent(room, { message: "Kết thúc ván: đôi tình nhân khác phe giành chiến thắng.", kind: "result" });
      clearTimer(room); return true;
    }
  }
  if (wolfCount === 0) {
    room.status = "ended"; room.phase = "ended"; room.winner = "town";
    room.announcement = "Dân làng đã tìm ra toàn bộ Ma sói!";
    addHistoryEvent(room, { message: "Kết thúc ván: phe Dân làng chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
  if (wolfCount >= townCount) {
    room.status = "ended"; room.phase = "ended"; room.winner = "wolf";
    room.announcement = "Ma sói đã chiếm ưu thế và chiến thắng!";
    addHistoryEvent(room, { message: "Kết thúc ván: phe Ma sói chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
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
function weightedVoteWinner(room) {
  const totals = new Map();
  for (const [voterId, targetId] of Object.entries(room.votes)) {
    const voter = getPlayer(room, voterId);
    if (!voter || !voter.alive) continue;
    const weight = voter.role === "mayor" ? 2 : 1;
    totals.set(targetId, (totals.get(targetId) || 0) + weight);
  }
  if (!totals.size) return null;
  const max = Math.max(...totals.values());
  const leaders = [...totals.entries()].filter(([, value]) => value === max).map(([id]) => id);
  return leaders.length === 1 ? leaders[0] : null;
}
function publicState(room, player) {
  const ended = room.status === "ended";
  const me = player;
  const others = room.players.map(p => ({
    id: p.id, name: p.name, alive: p.alive, ready: p.ready, connected: p.connected,
    isHost: p.id === room.hostId,
    canManage: !!player && player.id === room.hostId && room.status === "lobby" && p.id !== room.hostId,
    role: ended ? (ROLE_GUIDES[p.role] || {}).name : undefined
  }));
  let actionType = null, prompt = "", targets = [], privateInfo = "", actionDone = false;
  if (room.phase === "deathshot" && me && me.id === room.currentHunterShot) {
    actionType = "hunterShot"; prompt = "Bạn là Thợ săn. Chọn một người còn sống để bắn phát súng cuối cùng.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
  } else if (room.phase === "night" && me && me.alive) {
    const sub = room.subphase;
    if (sub === "cupid" && me.role === "cupid") {
      actionType = "cupid"; prompt = "Đêm đầu tiên: chọn hai người để ghép thành đôi tình nhân.";
      targets = alive(room).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "protect" && me.role === "protector") {
      actionType = "protect"; prompt = "Chọn một người để bảo vệ đêm nay.";
      targets = alive(room).filter(p => p.id !== room.lastProtected).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "wolves" && me.role === "wolf") {
      actionType = "wolf"; prompt = "Ma sói: hãy chọn mục tiêu chung.";
      targets = alive(room).filter(p => p.role !== "wolf").map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.wolfVotes[me.id];
      privateInfo = "Đồng đội: " + wolves(room).filter(p => p.id !== me.id).map(p => p.name).join(", ");
    } else if (sub === "wolves" && me.role === "littleGirl") {
      actionType = "peek"; prompt = "Bạn có thể lén quan sát Ma sói trong đêm nay.";
      actionDone = !!room.night.peeked[me.id];
    } else if (sub === "seer" && me.role === "seer") {
      actionType = "seer"; prompt = "Chọn một người để soi thân phận.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "medium" && me.role === "medium") {
      actionType = "medium"; prompt = "Chọn một người đã bị loại để hỏi thân phận.";
      targets = room.players.filter(p => !p.alive).map(p => ({ id: p.id, name: p.name }));
      actionDone = room.mediumUsed || !!room.night.done[me.id];
    } else if (sub === "witch" && me.role === "witch") {
      actionType = "witch"; prompt = "Phù thủy, hãy quyết định có sử dụng một bình thuốc không.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
      privateInfo = room.night.wolfTarget ? ("Người bị Ma sói nhắm đến: " + ((getPlayer(room, room.night.wolfTarget) || {}).name || "không rõ")) : "Đêm nay Ma sói chưa chọn được mục tiêu.";
    }
  }
  if (room.phase === "vote" && me && me.alive) {
    actionType = "vote"; prompt = "Bỏ phiếu kín: chọn người bạn muốn đưa ra xét xử.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
    actionDone = !!room.votes[me.id];
  }
  const notes = me && room.privateNotes[me.id] ? room.privateNotes[me.id] : "";
  const guide = me && me.role ? ROLE_GUIDES[me.role] : null;
  if (me && me.role === "cupid" && room.loverPair) {
    const pairNames = room.loverPair.map(id => (getPlayer(room, id) || {}).name).filter(Boolean);
    privateInfo = "Đôi tình nhân bạn đã ghép: " + pairNames.join(" và ");
  }
  return {
    code: room.code, status: room.status, phase: room.phase, subphase: room.subphase || "",
    day: room.day, players: others, playerCount: room.players.length,
    settings: room.settings, endsAt: room.endsAt, announcement: room.announcement,
    winner: room.winner, chat: room.chat.slice(-35), history: visibleHistory(room, player),
    self: me ? {
      id: me.id, name: me.name, alive: me.alive, ready: me.ready, role: me.role,
      isHost: me.id === room.hostId,
      roleName: guide ? guide.name : "", roleDescription: guide ? guide.summary : "",
      guide, actionType, prompt, targets, actionDone, privateInfo, privateNote: notes,
      witchSaveAvailable: me.role === "witch" && room.witchSaveAvailable,
      witchPoisonAvailable: me.role === "witch" && room.witchPoisonAvailable,
      wolfMates: me.role === "wolf" ? wolves(room).filter(p => p.id !== me.id).map(p => p.name) : [],
      loverName: room.loverPair && room.loverPair.includes(me.id) ? ((getPlayer(room, room.loverPair.find(id => id !== me.id)) || {}).name || "") : "",
      mayorVoteWeight: me.role === "mayor" && me.alive ? 2 : 1
    } : null,
    canStart: !!player && player.id === room.hostId && room.status === "lobby" && room.players.length >= 5 && room.players.length <= room.settings.maxPlayers && (room.settings.wolfCount === 0 || room.settings.wolfCount <= room.players.length - 2) && room.players.every(p => p.ready),
    voteReadyCount: room.voteReady.size,
    isRevealed: ended
  };
}
function broadcast(room) {
  room.players.forEach(p => { if (p.socketId) io.to(p.socketId).emit("state", publicState(room, p)); });
}
function addChat(room, player, message) {
  room.chat.push({ id: randomId(4), name: player.name, message: String(message).trim().slice(0, 240), time: Date.now(), alive: player.alive });
  room.chat = room.chat.slice(-50);
}
function setTimer(room, seconds, callback) {
  clearTimer(room);
  room.endsAt = Date.now() + seconds * 1000;
  room.timer = setTimeout(callback, seconds * 1000);
}
function createRoomObject(code, player) {
  return {
    code, players: [player], hostId: player.id, hostTransferTimer: null, kickedTokens: new Set(), kickedNames: new Set(), status: "lobby", phase: "lobby", subphase: "",
    settings: {
      discussionSeconds: 180, voteSeconds: 45, nightSeconds: 35,
      maxPlayers: 16, wolfCount: 0, customRoles: false, enabledRoles: CONFIGURABLE_ROLES.slice()
    },
    day: 0, timer: null, endsAt: null, announcement: "Đang chờ mọi người tham gia.",
    winner: null, night: null, votes: {}, voteReady: new Set(), chat: [], history: [],
    privateNotes: {}, witchSaveAvailable: true, witchPoisonAvailable: true,
    lastProtected: null, elderShieldUsed: false, mediumUsed: false,
    loverPair: null, hunterShotUsed: new Set(), hunterQueue: [],
    currentHunterShot: null, afterDeathCallback: null, pendingDeathNames: []
  };
}
function joinPlayer(socket, room, player, token) {
  player.socketId = socket.id; player.connected = true;
  if (!room.hostId) room.hostId = player.id;
  if (room.hostTransferTimer && player.id === room.hostId) {
    clearTimeout(room.hostTransferTimer); room.hostTransferTimer = null;
  }
  socket.join(room.code);
  socket.emit("joined", { code: room.code, token, playerId: player.id }); broadcast(room);
}
function startGame(room, starterId) {
  if (starterId !== room.hostId) return false;
  if (room.status !== "lobby" || room.players.length < 5 || room.players.length > room.settings.maxPlayers || !room.players.every(p => p.ready)) return false;
  if (room.settings.wolfCount > 0 && room.settings.wolfCount > room.players.length - 2) return false;
  const roles = rolesFor(room.players.length, room.settings);
  room.players.forEach((p, i) => { p.role = roles[i]; p.alive = true; p.ready = false; });
  room.status = "playing"; room.day = 0; room.winner = null;
  room.witchSaveAvailable = true; room.witchPoisonAvailable = true; room.lastProtected = null;
  room.elderShieldUsed = false; room.mediumUsed = false; room.loverPair = null;
  room.hunterShotUsed = new Set(); room.hunterQueue = [];
  room.announcement = "Vai trò đã được chia bí mật. Hãy mở thẻ vai trò để đọc hướng dẫn của bạn!";
  addHistoryEvent(room, { message: "Ván chơi bắt đầu. Vai trò đã được chia riêng cho từng người chơi.", kind: "phase" });
  startNight(room); return true;
}
function setNightStep(room, index) {
  const steps = [];
  if (room.day === 0) steps.push("cupid");
  steps.push("protect", "wolves", "seer", "medium", "witch");
  while (index < steps.length) {
    const step = steps[index];
    const role = step === "wolves" ? "wolf" : step === "protect" ? "protector" : step;
    let players = alive(room).filter(p => p.role === role);
    if (step === "medium" && (room.mediumUsed || !room.players.some(p => !p.alive))) players = [];
    if (players.length) {
      room.subphase = step; room.night.stepIndex = index;
      const privateTurnNames = players.map(p => p.id);
      const turnLabel = step === "wolves" ? "Ma sói" : (ROLE_GUIDES[role] || {}).name || role;
      addHistoryEvent(room, { message: "Đến lượt " + turnLabel + " hành động.", visibility: "private", playerIds: privateTurnNames, kind: "private" });
      if (step === "wolves") {
        room.night.wolfVotes = {};
        const littleGirls = alive(room).filter(p => p.role === "littleGirl");
        if (littleGirls.length) addHistoryEvent(room, { message: "Bạn có thể quan sát lén bầy sói trong lượt này.", visibility: "private", playerIds: littleGirls.map(p => p.id), kind: "private" });
      }
      room.night.done = room.night.done || {};
      room.announcement =
        step === "cupid" ? "Đêm đầu tiên: Thần tình yêu đang ghép đôi." :
        step === "protect" ? "Đêm: Bảo vệ thức dậy." :
        step === "wolves" ? "Đêm: Ma sói đang chọn mục tiêu." :
        step === "seer" ? "Đêm: Tiên tri thức dậy." :
        step === "medium" ? "Đêm: Thầy đồng thức dậy." : "Đêm: Phù thủy thức dậy.";
      broadcast(room); setTimer(room, room.settings.nightSeconds, () => advanceNight(room)); return;
    }
    index++;
  }
  resolveNight(room);
}
function startNight(room) {
  if (room.status !== "playing") return;
  room.phase = "night"; room.subphase = "";
  room.night = { protectTarget: null, wolfVotes: {}, wolfTarget: null, seerTarget: null, witchSave: false, witchPoisonTarget: null, done: {}, peeked: {} };
  room.privateNotes = {}; room.voteReady = new Set();
  addHistoryEvent(room, { message: room.day === 0 ? "Đêm đầu tiên bắt đầu." : "Đêm " + (room.day + 1) + " bắt đầu.", kind: "phase" });
  setNightStep(room, 0);
}
function advanceNight(room) {
  if (room.status !== "playing" || room.phase !== "night") return;
  if (room.subphase === "wolves" && !room.night.wolfTarget) room.night.wolfTarget = plurality(Object.values(room.night.wolfVotes));
  clearTimer(room); setNightStep(room, room.night.stepIndex + 1);
}
function applyDeathChain(room, ids) {
  const queue = [...ids], visited = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const p = getPlayer(room, id);
    if (!p || !p.alive) continue;
    p.alive = false; room.pendingDeathNames.push(p.name);
    if (p.role === "hunter" && !room.hunterShotUsed.has(p.id) && !room.hunterQueue.includes(p.id)) room.hunterQueue.push(p.id);
    if (room.loverPair && room.loverPair.includes(p.id)) {
      const partnerId = room.loverPair.find(x => x !== p.id);
      const partner = getPlayer(room, partnerId);
      if (partner && partner.alive) queue.push(partnerId);
    }
  }
}
function beginAfterDeaths(room, ids, callbackName) {
  room.pendingDeathNames = [];
  room.afterDeathCallback = callbackName;
  applyDeathChain(room, ids);
  if (room.hunterQueue.length) startHunterShot(room);
  else continueAfterDeaths(room);
}
function startHunterShot(room) {
  const hunterId = room.hunterQueue.shift();
  if (!hunterId) return continueAfterDeaths(room);
  room.currentHunterShot = hunterId; room.phase = "deathshot"; room.subphase = "";
  room.announcement = "Một phát súng cuối cùng sắp vang lên...";
  broadcast(room);
  setTimer(room, 20, () => resolveHunterShot(room, null));
}
function resolveHunterShot(room, targetId) {
  if (room.phase !== "deathshot" || !room.currentHunterShot) return;
  clearTimer(room);
  const hunterId = room.currentHunterShot;
  room.hunterShotUsed.add(hunterId);
  room.currentHunterShot = null;
  const target = targetId && getPlayer(room, targetId);
  if (target && target.alive) {
    addHistoryEvent(room, { message: "Phát súng cuối đã khiến " + target.name + " bị loại.", kind: "result" });
    applyDeathChain(room, [target.id]);
  } else {
    addHistoryEvent(room, { message: "Phát súng cuối đã không được sử dụng.", kind: "result" });
  }
  if (room.hunterQueue.length) startHunterShot(room);
  else continueAfterDeaths(room);
}
function continueAfterDeaths(room) {
  if (room.hunterQueue.length) return startHunterShot(room);
  const callback = room.afterDeathCallback;
  room.afterDeathCallback = null;
  if (callback === "afterNight") finishNightAfterDeaths(room);
  else if (callback === "afterVote") finishVoteAfterDeaths(room);
}
function resolveNight(room) {
  clearTimer(room);
  const deaths = [];
  const target = room.night.wolfTarget;
  if (target && target !== room.night.protectTarget && !(room.night.witchSave && target)) {
    const victim = getPlayer(room, target);
    if (victim && victim.alive && victim.role === "elder" && !room.elderShieldUsed) {
      room.elderShieldUsed = true;
      room.announcement = "Đêm qua, có người đã sống sót sau một đòn tấn công!";
    } else deaths.push(target);
  }
  if (room.night.witchPoisonTarget && !deaths.includes(room.night.witchPoisonTarget)) deaths.push(room.night.witchPoisonTarget);
  if (room.night.protectTarget) room.lastProtected = room.night.protectTarget;
  else room.lastProtected = null;
  beginAfterDeaths(room, deaths, "afterNight");
}
function finishNightAfterDeaths(room) {
  if (room.status !== "playing") return;
  const names = room.pendingDeathNames;
  room.announcement = names.length ? ("Trời sáng! Người không qua khỏi đêm nay: " + names.join(", ") + ".") :
    (room.announcement.includes("sống sót sau") ? room.announcement : "Trời sáng! Đêm qua không có ai bị loại.");
  addHistoryEvent(room, {
    message: names.length
      ? "Bình minh: " + names.join(", ") + " bị loại trong đêm."
      : (room.announcement.includes("sống sót sau") ? "Bình minh: Có người đã sống sót sau một đòn tấn công." : "Bình minh: Đêm qua không có ai bị loại."),
    kind: "result"
  });
  if (checkWin(room)) { broadcast(room); return; }
  room.phase = "discussion"; room.subphase = ""; room.day += 1; room.voteReady = new Set();
  addHistoryEvent(room, { message: "Ngày " + room.day + " bắt đầu. Thảo luận được mở.", kind: "phase" });
  broadcast(room); setTimer(room, room.settings.discussionSeconds, () => startVote(room));
}
function startVote(room) {
  if (room.status !== "playing") return;
  clearTimer(room); room.phase = "vote"; room.subphase = ""; room.votes = {}; room.voteReady = new Set();
  room.announcement = "Thời gian thảo luận kết thúc. Hãy bỏ phiếu kín!";
  addHistoryEvent(room, { message: "Ngày " + room.day + ": bắt đầu bỏ phiếu kín.", kind: "phase" });
  broadcast(room); setTimer(room, room.settings.voteSeconds, () => resolveVote(room));
}
function resolveVote(room) {
  if (room.status !== "playing" || room.phase !== "vote") return;
  clearTimer(room);
  const targetId = weightedVoteWinner(room);
  const target = targetId && getPlayer(room, targetId);
  if (target && target.alive) beginAfterDeaths(room, [target.id], "afterVote");
  else {
    room.pendingDeathNames = [];
    room.announcement = "Kết quả bỏ phiếu hòa hoặc không đủ phiếu. Không ai bị loại.";
    finishVoteAfterDeaths(room);
  }
}
function finishVoteAfterDeaths(room) {
  if (room.status !== "playing") return;
  if (room.pendingDeathNames.length) room.announcement = "Kết quả bỏ phiếu: " + room.pendingDeathNames.join(", ") + " bị loại.";
  addHistoryEvent(room, {
    message: room.pendingDeathNames.length
      ? "Kết quả bỏ phiếu: " + room.pendingDeathNames.join(", ") + " bị loại."
      : "Kết quả bỏ phiếu hòa hoặc không đủ phiếu. Không ai bị loại.",
    kind: "result"
  });
  if (checkWin(room)) { broadcast(room); return; }
  room.phase = "intermission"; room.subphase = "";
  broadcast(room); setTimer(room, 3.5, () => { if (room.status === "playing") startNight(room); });
}
function handleNightAction(socket, room, player, data) {
  if (!player || room.status !== "playing" || room.phase !== "night" || !player.alive) return;
  const sub = room.subphase;
  const target = getPlayer(room, data && data.targetId);
  if (sub === "cupid" && player.role === "cupid") {
    if (room.night.done[player.id]) return sendError(socket, "Bạn đã ghép đôi rồi.");
    const ids = Array.isArray(data.targetIds) ? [...new Set(data.targetIds)] : [];
    if (ids.length !== 2 || ids.some(id => !getPlayer(room, id) || !getPlayer(room, id).alive)) return sendError(socket, "Hãy chọn đúng hai người còn sống.");
    room.loverPair = ids;
    const [a, b] = ids.map(id => getPlayer(room, id));
    room.privateNotes[player.id] = "Bạn đã ghép đôi " + a.name + " và " + b.name + ".";
    room.privateNotes[a.id] = "Bạn là người yêu của " + b.name + ". Nếu người ấy bị loại, bạn cũng sẽ ra đi.";
    room.privateNotes[b.id] = "Bạn là người yêu của " + a.name + ". Nếu người ấy bị loại, bạn cũng sẽ ra đi.";
    addHistoryEvent(room, { message: "Bạn đã ghép đôi " + a.name + " và " + b.name + ".", visibility: "private", playerIds: [player.id, a.id, b.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "wolves" && player.role === "wolf") {
    if (!target || !target.alive || target.role === "wolf") return sendError(socket, "Hãy chọn một người còn sống không thuộc phe Ma sói.");
    room.night.wolfVotes[player.id] = target.id;
    const livingWolves = wolves(room);
    if (livingWolves.every(p => room.night.wolfVotes[p.id])) {
      room.night.wolfTarget = plurality(livingWolves.map(p => room.night.wolfVotes[p.id]));
      const targetPlayer = getPlayer(room, room.night.wolfTarget);
      if (targetPlayer) addHistoryEvent(room, { message: "Bầy sói đã thống nhất chọn " + targetPlayer.name + " làm mục tiêu đêm này.", visibility: "private", playerIds: livingWolves.map(p => p.id), kind: "private" });
      advanceNight(room);
    } else broadcast(room);
    return;
  }
  if (sub === "wolves" && player.role === "littleGirl" && data.action === "peek") {
    if (room.night.peeked[player.id]) return;
    room.privateNotes[player.id] = "Bạn lén nhìn thấy phe Ma sói gồm: " + wolves(room).map(p => p.name).join(", ") + ".";
    addHistoryEvent(room, { message: room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.peeked[player.id] = true; broadcast(room); return;
  }
  if (room.night.done[player.id]) return;
  if (sub === "protect" && player.role === "protector") {
    if (!target || !target.alive || target.id === room.lastProtected) return sendError(socket, "Mục tiêu không hợp lệ hoặc đã được bảo vệ đêm trước.");
    room.night.protectTarget = target.id;
    addHistoryEvent(room, { message: "Bạn đã chọn bảo vệ " + target.name + " trong đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "seer" && player.role === "seer") {
    if (!target || !target.alive || target.id === player.id) return sendError(socket, "Hãy chọn một người chơi khác còn sống.");
    room.privateNotes[player.id] = target.name + (target.role === "wolf" ? " thuộc phe Ma sói." : " không thuộc phe Ma sói.");
    addHistoryEvent(room, { message: "Kết quả soi: " + room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "medium" && player.role === "medium") {
    if (room.mediumUsed) return sendError(socket, "Bạn đã sử dụng năng lực Thầy đồng.");
    if (!target || target.alive || !target.role) return sendError(socket, "Hãy chọn một người đã bị loại.");
    room.privateNotes[player.id] = "Linh hồn " + target.name + " tiết lộ vai trò: " + ROLE_GUIDES[target.role].name + ".";
    addHistoryEvent(room, { message: room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.mediumUsed = true; room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "witch" && player.role === "witch") {
    const action = data && data.action;
    if (action === "save") {
      if (!room.witchSaveAvailable || !room.night.wolfTarget) return sendError(socket, "Không còn bình cứu hoặc đêm nay không có mục tiêu bị cắn.");
      room.night.witchSave = true; room.witchSaveAvailable = false;
      addHistoryEvent(room, { message: "Bạn đã sử dụng bình cứu trong đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    } else if (action === "poison") {
      if (!room.witchPoisonAvailable || !target || !target.alive) return sendError(socket, "Không còn bình độc hoặc mục tiêu không hợp lệ.");
      room.night.witchPoisonTarget = target.id; room.witchPoisonAvailable = false;
      addHistoryEvent(room, { message: "Bạn đã dùng bình độc lên " + target.name + ".", visibility: "private", playerIds: [player.id], kind: "private" });
    } else if (action === "skip") {
      addHistoryEvent(room, { message: "Bạn đã bỏ qua lượt thuốc đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    } else return sendError(socket, "Lựa chọn không hợp lệ.");
    room.night.done[player.id] = true; advanceNight(room); return;
  }
}
function attachPlayer(socket, room, player, token) {
  if (player.socketId && player.socketId !== socket.id) {
    const old = io.sockets.sockets.get(player.socketId); if (old) old.leave(room.code);
  }
  joinPlayer(socket, room, player, token);
}

io.on("connection", (socket) => {
  socket.on("createRoom", (payload) => {
    const name = cleanName(payload && payload.name);
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    let code = makeCode(); while (rooms.has(code)) code = makeCode();
    const token = randomId(18);
    const player = { id: randomId(8), name, token, socketId: null, connected: true, ready: false, alive: true, role: null };
    const room = createRoomObject(code, player); rooms.set(code, room); attachPlayer(socket, room, player, token);
  });
  socket.on("joinRoom", (payload) => {
    const code = String(payload && payload.code || "").trim().toUpperCase();
    const name = cleanName(payload && payload.name);
    const token = String(payload && payload.token || "");
    const room = rooms.get(code);
    if (!room) return sendError(socket, "Không tìm thấy phòng. Kiểm tra lại mã phòng nhé.");
    if (token && room.kickedTokens && room.kickedTokens.has(token)) return sendError(socket, "Bạn đã bị chủ phòng mời ra và không thể dùng lại phiên cũ để vào phòng.");
    if (name && room.kickedNames && room.kickedNames.has(name.toLowerCase())) return sendError(socket, "Tên này đã bị chủ phòng chặn khỏi phòng.");
    let player = token ? room.players.find(p => p.token === token) : null;
    if (player) {
      if (player.name.toLowerCase() !== name.toLowerCase() && name) return sendError(socket, "Tên không khớp với phiên chơi đã lưu.");
      return attachPlayer(socket, room, player, token);
    }
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    if (room.status !== "lobby") return sendError(socket, "Ván chơi đã bắt đầu. Chỉ người chơi cũ có mã phiên mới vào lại được.");
    if (room.players.length >= room.settings.maxPlayers) return sendError(socket, "Phòng đã đạt giới hạn số người do chủ phòng cài đặt.");
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) return sendError(socket, "Tên này đã có trong phòng, hãy chọn tên khác.");
    const newToken = randomId(18);
    player = { id: randomId(8), name, token: newToken, socketId: null, connected: true, ready: false, alive: true, role: null };
    room.players.push(player); attachPlayer(socket, room, player, newToken);
  });
  socket.on("ready", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return;
    const p = room.players.find(x => x.socketId === socket.id); p.ready = !p.ready; broadcast(room);
  });
  socket.on("startGame", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || p.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền bắt đầu ván chơi.");
    if (!startGame(room, p.id)) return sendError(socket, "Cần ít nhất 5 người và tất cả người chơi phải sẵn sàng.");
    broadcast(room);
  });

  socket.on("hostSettings", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể thay đổi cài đặt khi phòng đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới được thay đổi cài đặt.");

    const next = data || {};
    const maxPlayers = Number(next.maxPlayers);
    const discussionSeconds = Number(next.discussionSeconds);
    const voteSeconds = Number(next.voteSeconds);
    const nightSeconds = Number(next.nightSeconds);
    const wolfCount = Number(next.wolfCount);
    const customRoles = next.customRoles === true;
    const enabledRoles = Array.isArray(next.enabledRoles)
      ? [...new Set(next.enabledRoles.filter(role => CONFIGURABLE_ROLES.includes(role)))]
      : room.settings.enabledRoles.slice();

    if (!Number.isInteger(maxPlayers) || maxPlayers < 5 || maxPlayers > 16 || maxPlayers < room.players.length) {
      return sendError(socket, "Số người tối đa phải từ 5 đến 16 và không được thấp hơn số người đang có trong phòng.");
    }
    if (!Number.isInteger(discussionSeconds) || discussionSeconds < 30 || discussionSeconds > 300) {
      return sendError(socket, "Thời gian thảo luận phải từ 30 đến 300 giây.");
    }
    if (!Number.isInteger(voteSeconds) || voteSeconds < 15 || voteSeconds > 120) {
      return sendError(socket, "Thời gian bỏ phiếu phải từ 15 đến 120 giây.");
    }
    if (!Number.isInteger(nightSeconds) || nightSeconds < 10 || nightSeconds > 90) {
      return sendError(socket, "Thời gian mỗi lượt ban đêm phải từ 10 đến 90 giây.");
    }
    if (!Number.isInteger(wolfCount) || wolfCount < 0 || wolfCount > 4) {
      return sendError(socket, "Số Ma sói phải chọn từ Tự động đến 4.");
    }

    room.settings = { discussionSeconds, voteSeconds, nightSeconds, maxPlayers, wolfCount, customRoles, enabledRoles };
    room.announcement = "Chủ phòng đã cập nhật cài đặt ván chơi.";
    broadcast(room);
  });
  socket.on("replayGame", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền tạo ván chơi lại.");
    if (room.status !== "ended") return sendError(socket, "Chỉ có thể chơi lại sau khi ván hiện tại kết thúc.");

    clearTimer(room);
    room.status = "lobby";
    room.phase = "lobby";
    room.subphase = "";
    room.day = 0;
    room.winner = null;
    room.night = null;
    room.votes = {};
    room.voteReady = new Set();
    room.chat = [];
    room.history = [];
    room.privateNotes = {};
    room.witchSaveAvailable = true;
    room.witchPoisonAvailable = true;
    room.lastProtected = null;
    room.elderShieldUsed = false;
    room.mediumUsed = false;
    room.loverPair = null;
    room.hunterShotUsed = new Set();
    room.hunterQueue = [];
    room.currentHunterShot = null;
    room.afterDeathCallback = null;
    room.pendingDeathNames = [];
    room.players.forEach(p => {
      p.role = null;
      p.alive = true;
      p.ready = false;
    });
    room.announcement = "Ván trước đã kết thúc. Chủ phòng đã mở sảnh cho ván mới — mọi người hãy sẵn sàng nhé!";
    broadcast(room);
  });
  socket.on("kickPlayer", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể kick người chơi khi phòng đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền kick người chơi.");
    const target = getPlayer(room, data && data.targetId);
    if (!target || target.id === host.id) return sendError(socket, "Không thể kick người chơi này.");
    room.kickedTokens.add(target.token);
    room.kickedNames.add(target.name.toLowerCase());
    if (target.socketId) {
      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.emit("kicked", { message: "Bạn đã bị chủ phòng mời ra khỏi phòng." });
        targetSocket.leave(room.code);
      }
    }
    room.players = room.players.filter(p => p.id !== target.id);
    room.announcement = target.name + " đã bị chủ phòng mời ra khỏi phòng.";
    broadcast(room);
  });
  socket.on("transferHost", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể chuyển chủ phòng khi đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng hiện tại mới có quyền chuyển quyền.");
    const target = getPlayer(room, data && data.targetId);
    if (!target || target.id === host.id || !target.connected || !target.socketId) return sendError(socket, "Người được chọn không còn kết nối trong phòng.");
    room.hostId = target.id;
    room.announcement = target.name + " đã trở thành chủ phòng mới.";
    broadcast(room);
  });
  socket.on("nightAction", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    handleNightAction(socket, room, p, data || {}); broadcast(room);
  });
  socket.on("hunterShot", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.phase !== "deathshot" || room.currentHunterShot !== (room.players.find(p => p.socketId === socket.id) || {}).id) return;
    resolveHunterShot(room, data && data.targetId); broadcast(room);
  });
  socket.on("vote", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "vote") return;
    const p = room.players.find(x => x.socketId === socket.id);
    const target = getPlayer(room, data && data.targetId);
    if (!p || !p.alive || !target || !target.alive || p.id === target.id) return sendError(socket, "Phiếu không hợp lệ.");
    if (room.votes[p.id]) return sendError(socket, "Bạn đã bỏ phiếu rồi.");
    room.votes[p.id] = target.id;
    if (alive(room).every(x => room.votes[x.id])) resolveVote(room); else broadcast(room);
  });
  socket.on("readyVote", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive) return;
    room.voteReady.add(p.id);
    if (room.voteReady.size > alive(room).length / 2) startVote(room); else broadcast(room);
  });
  socket.on("chat", (payload) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive || (p.lastChatAt && Date.now() - p.lastChatAt < 1200)) return;
    const message = String(payload && payload.message || "").trim().slice(0, 240);
    if (!message) return;
    p.lastChatAt = Date.now(); addChat(room, p, message); broadcast(room);
  });
  socket.on("leaveRoom", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    if (p && p.id === room.hostId) {
      if (room.hostTransferTimer) clearTimeout(room.hostTransferTimer);
      const next = room.players.find(x => x.id !== p.id && x.connected && x.socketId);
      room.hostId = next ? next.id : null;
      room.announcement = next ? (next.name + " đã tiếp quản quyền chủ phòng.") : "Chủ phòng đã rời phòng. Người tham gia tiếp theo sẽ trở thành chủ phòng.";
    }
    socket.leave(room.code); broadcast(room);
  });
  socket.on("disconnect", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    if (p && p.id === room.hostId && room.status === "lobby") {
      if (room.hostTransferTimer) clearTimeout(room.hostTransferTimer);
      room.hostTransferTimer = setTimeout(() => {
        room.hostTransferTimer = null;
        const currentHost = getPlayer(room, room.hostId);
        if (currentHost && !currentHost.connected) {
          const next = room.players.find(x => x.id !== currentHost.id && x.connected && x.socketId);
          room.hostId = next ? next.id : null;
          room.announcement = next ? (next.name + " đã tiếp quản quyền chủ phòng vì chủ cũ mất kết nối.") : "Chủ phòng mất kết nối. Người tham gia tiếp theo sẽ trở thành chủ phòng.";
          broadcast(room);
        }
      }, 15000);
    }
    broadcast(room);
  });
});

server.listen(PORT, () => console.log("Ma Sói Online running on port " + PORT));
