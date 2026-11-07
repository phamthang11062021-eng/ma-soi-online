const socket = io();
const $ = (id) => document.getElementById(id);
let state = null, selected = null, myToken = "", myCode = "", toastTimer = null;
let currentGuideRole = null, guideOpen = true, cupidSelected = [];
const showToast = (msg) => {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2600);
};
const saved = (() => { try { return JSON.parse(sessionStorage.getItem("werewolf-session") || "{}"); } catch { return {}; } })();

function enterRoom(code, token) {
  myCode = code; myToken = token;
  sessionStorage.setItem("werewolf-session", JSON.stringify({ code, token, name: $("homeName").value.trim() }));
  $("home").classList.add("hidden"); $("game").classList.remove("hidden");
  $("roomCodeLabel").textContent = code;
}
$("createBtn").onclick = () => {
  const name = $("homeName").value.trim();
  if (!name) return showToast("Nhập tên của bạn trước nhé.");
  socket.emit("createRoom", { name });
};
$("joinBtn").onclick = () => {
  const name = $("homeName").value.trim(), code = $("roomCode").value.trim().toUpperCase();
  if (!name || !code) return showToast("Nhập tên và mã phòng nhé.");
  socket.emit("joinRoom", { name, code });
};
$("copyBtn").onclick = async () => {
  try { await navigator.clipboard.writeText(myCode); showToast("Đã sao chép mã phòng " + myCode); }
  catch { showToast("Mã phòng: " + myCode); }
};
$("readyBtn").onclick = () => socket.emit("ready");
$("startBtn").onclick = () => socket.emit("startGame");
$("leaveBtn").onclick = () => {
  socket.emit("leaveRoom"); sessionStorage.removeItem("werewolf-session"); location.reload();
};
$("guideToggle").onclick = () => {
  guideOpen = !guideOpen;
  $("guidePanel").classList.toggle("hidden", !guideOpen);
  $("guideToggle").textContent = guideOpen ? "Ẩn hướng dẫn" : "📖 Xem hướng dẫn cách chơi role này";
};
$("chatForm").onsubmit = (e) => {
  e.preventDefault();
  const message = $("chatInput").value.trim();
  if (message) { socket.emit("chat", { message }); $("chatInput").value = ""; }
};
socket.on("joined", ({ code, token }) => enterRoom(code, token));
socket.on("errorMessage", showToast);
socket.on("kicked", ({ message }) => {
  sessionStorage.removeItem("werewolf-session");
  myCode = ""; myToken = ""; state = null;
  $("game").classList.add("hidden"); $("home").classList.remove("hidden");
  showToast(message || "Bạn đã bị mời ra khỏi phòng.");
});
socket.on("connect", () => {
  if (saved.code && saved.token) {
    $("homeName").value = saved.name || "";
    socket.emit("joinRoom", { code: saved.code, token: saved.token, name: saved.name || "" });
  }
});
socket.on("state", render);

function render(s) {
  state = s; selected = null;
  $("roomCodeLabel").textContent = s.code;
  $("countLabel").textContent = s.playerCount + "/16";
  $("notice").textContent = s.announcement || "";
  $("phaseLabel").textContent =
    s.phase === "lobby" ? "SẢNH CHỜ" :
    s.phase === "night" ? "ĐÊM " + s.day :
    s.phase === "discussion" ? "THẢO LUẬN · NGÀY " + s.day :
    s.phase === "vote" ? "BỎ PHIẾU · NGÀY " + s.day :
    s.phase === "deathshot" ? "PHÁT SÚNG CUỐI CÙNG" : s.phase === "intermission" ? "KẾT QUẢ BỎ PHIẾU" : "KẾT THÚC";
  $("players").innerHTML = s.players.map((p, i) =>
    '<div class="player-tile ' + (!p.alive ? "dead" : "alive") + (p.canManage ? " managed" : "") + '">' +
    '<div class="tile-art"><span class="tile-spark">✦</span><span class="tile-person">♟</span><span class="tile-number">' + String(i + 1).padStart(2, "0") + '</span></div>' +
    '<div class="tile-name">' + esc(p.name) + '</div>' +
    (p.isHost ? '<span class="host-badge">👑 CHỦ PHÒNG</span>' : '') +
    '<span class="tile-status">' + (!p.alive ? "✕ ĐÃ CHẾT" : (p.ready ? "✓ SẴN SÀNG" : "● CÒN SỐNG")) +
    (p.connected ? "" : " · MẤT KẾT NỐI") + '</span>' +
    (p.canManage ? '<div class="player-actions"><button class="player-action" data-transfer="' + p.id + '">Chuyển chủ</button><button class="player-action kick" data-kick="' + p.id + '">Kick</button></div>' : '') +
    (s.isRevealed ? '<span class="revealed-role">' + esc(p.role || "") + '</span>' : "") + '</div>'
  ).join("");
  $("players").querySelectorAll("[data-kick]").forEach(button => button.onclick = () => {
    const target = s.players.find(p => p.id === button.dataset.kick);
    if (target && window.confirm("Mời " + target.name + " ra khỏi phòng?")) socket.emit("kickPlayer", { targetId: target.id });
  });
  $("players").querySelectorAll("[data-transfer]").forEach(button => button.onclick = () => {
    const target = s.players.find(p => p.id === button.dataset.transfer);
    if (target && window.confirm("Chuyển quyền chủ phòng cho " + target.name + "?")) socket.emit("transferHost", { targetId: target.id });
  });

  const me = s.self;
  $("selfStatus").textContent = me ? ("Bạn: " + me.name + (me.alive ? " · Còn sống" : " · Đã bị loại")) : "";
  $("roleCard").classList.toggle("hidden", !me || !me.role);
  if (me && me.role) renderRoleCard(me);
  $("lobbyControls").classList.toggle("hidden", s.status !== "lobby");
  $("readyBtn").textContent = me && me.ready ? "Hủy sẵn sàng" : "Tôi đã sẵn sàng";
  $("startBtn").classList.toggle("hidden", !(me && me.isHost));
  $("startBtn").disabled = !s.canStart;
  $("startBtn").style.opacity = s.canStart ? "1" : ".45";
  const hostPlayer = s.players.find(p => p.isHost);
  $("hostHint").textContent = me && me.isHost
    ? "👑 Bạn là chủ phòng. Có thể bắt đầu, kick hoặc chuyển quyền cho người khác."
    : "Chủ phòng: " + (hostPlayer ? hostPlayer.name : "đang được chuyển giao") + ". Chỉ chủ phòng mới được bắt đầu và quản lý người chơi.";
  $("chatArea").classList.toggle("hidden", s.phase !== "discussion" || !me || !me.alive);
  $("chatMessages").innerHTML = (s.chat || []).map(m =>
    '<div class="chat-msg"><b>' + esc(m.name) + '</b>' + esc(m.message) + '</div>'
  ).join("");
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
  $("timer").textContent = s.endsAt ? formatTime(Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))) : "—";
  renderAction(s);
  if (s.phase === "ended") {
    $("actionTitle").textContent = "Ván chơi kết thúc";
    $("timer").textContent = s.winner === "town" ? "PHE DÂN THẮNG" : s.winner === "wolf" ? "PHE SÓI THẮNG" : "ĐÔI TÌNH NHÂN THẮNG";
  }
}

function renderRoleCard(me) {
  if (currentGuideRole !== me.role) {
    currentGuideRole = me.role;
    guideOpen = true;
  }
  const roleArt = {
    wolf: ["🐺", "PHE MA SÓI"], villager: ["🧑‍🌾", "PHE DÂN LÀNG"],
    seer: ["🔮", "PHE DÂN LÀNG"], witch: ["🧙‍♀️", "PHE DÂN LÀNG"],
    protector: ["🛡️", "PHE DÂN LÀNG"], hunter: ["🏹", "PHE DÂN LÀNG"],
    cupid: ["💘", "THẦN TÌNH YÊU"], elder: ["🧓", "PHE DÂN LÀNG"],
    littleGirl: ["🕯️", "PHE DÂN LÀNG"], mayor: ["👑", "PHE DÂN LÀNG"],
    medium: ["🔔", "PHE DÂN LÀNG"]
  };
  const art = roleArt[me.role] || ["✦", "BÍ MẬT"];
  $("roleArt").textContent = art[0];
  $("roleTeam").textContent = art[1];
  $("roleName").textContent = me.roleName;
  $("roleDesc").textContent = me.roleDescription;
  const privateBits = [me.privateInfo, me.privateNote, me.loverName ? "Người yêu của bạn: " + me.loverName : "",
    me.wolfMates && me.wolfMates.length ? "Đồng đội Ma sói: " + me.wolfMates.join(", ") : "",
    me.mayorVoteWeight === 2 ? "Lá phiếu của bạn được tính gấp đôi." : ""].filter(Boolean);
  $("privateInfo").textContent = privateBits.join(" · ");
  const g = me.guide;
  if (g) {
    $("guidePanel").innerHTML =
      '<div class="guide-team">' + esc(g.team) + '</div>' +
      '<section class="guide-section"><b>Mục tiêu</b><p>' + esc(g.objective) + '</p></section>' +
      '<section class="guide-section"><b>Kỹ năng</b><p>' + esc(g.power) + '</p></section>' +
      '<section class="guide-section"><b>Cách chơi từng bước</b><ol>' + g.how.map(x => '<li>' + esc(x) + '</li>').join("") + '</ol></section>' +
      '<section class="guide-section"><b>Mẹo chơi</b><p>' + esc(g.tips) + '</p></section>' +
      '<section class="guide-section"><b>Lưu ý</b><p>' + esc(g.limits) + '</p></section>';
  }
  $("guidePanel").classList.toggle("hidden", !guideOpen);
  $("guideToggle").textContent = guideOpen ? "Ẩn hướng dẫn" : "📖 Xem hướng dẫn cách chơi role này";
}

function renderAction(s) {
  const me = s.self;
  let html = "";
  if (s.phase === "lobby") {
    html = '<div class="empty-state">Chờ đủ người chơi và cùng sẵn sàng.<br><small>Chia sẻ mã phòng ' + esc(s.code) + ' cho bạn bè.</small></div>';
  } else if (s.phase === "discussion") {
    html = '<div class="action-prompt">Hãy thảo luận để tìm ra Ma sói. Khi đã sẵn sàng, bấm nút bên dưới để chuyển sang bỏ phiếu.</div>' +
      '<button class="primary wide" id="readyVoteBtn">Tôi đã sẵn sàng bỏ phiếu (' + s.voteReadyCount + ')</button>';
  } else if (s.phase === "ended") {
    html = '<div class="empty-state">' + esc(s.announcement) + '<br><small>Vai trò của tất cả người chơi đã được công khai.</small></div>' +
      (me && me.isHost
        ? '<button class="primary wide replay-button" id="replayBtn">🔄 CHƠI LẠI VÁN MỚI</button><p class="hint">Bạn sẽ trở về sảnh chờ. Mọi người cần sẵn sàng lại trước khi bắt đầu.</p>'
        : '<p class="hint">Đang chờ chủ phòng mở ván mới...</p>');
  } else if (s.phase === "deathshot") {
    if (me && me.actionType === "hunterShot") {
      html = '<div class="action-prompt">Bạn đã bị loại nhưng còn một phát súng cuối. Chọn mục tiêu trong 20 giây.</div>' +
        '<div class="target-grid">' + me.targets.map(t => '<button class="target" data-target="' + t.id + '">' + esc(t.name) + '</button>').join("") + '</div>';
    } else {
      html = '<div class="empty-state">Một Thợ săn đang quyết định phát súng cuối cùng.<br><small>Hãy chờ kết quả.</small></div>';
    }
  } else if (me && me.actionType && (me.alive || me.actionType === "hunterShot")) {
    html = '<div class="action-prompt">' + esc(me.prompt || "") + '</div>';
    if (me.actionDone) {
      html += '<p class="hint">Đã ghi nhận lựa chọn của bạn. Chờ những người khác...</p>';
    } else if (me.actionType === "cupid") {
      cupidSelected = [];
      html += '<p class="selection-count" id="cupidCount">Đã chọn 0/2 người</p><div class="target-grid">' +
        me.targets.map(t => '<button class="target cupid-target" data-target="' + t.id + '">' + esc(t.name) + '</button>').join("") +
        '</div><button class="primary wide" id="cupidConfirm" disabled>Ghép đôi hai người đã chọn</button>';
    } else if (me.actionType === "witch") {
      html += '<div class="action-buttons">';
      if (me.witchSaveAvailable) html += '<button class="primary" id="saveBtn">Dùng bình cứu</button>';
      html += '<button class="secondary" id="skipBtn">Bỏ qua đêm nay</button></div>';
      if (me.witchPoisonAvailable) {
        html += '<p class="hint">Hoặc chọn một người để dùng bình độc:</p><div class="target-grid">' +
          me.targets.map(t => '<button class="target" data-target="' + t.id + '">' + esc(t.name) + '</button>').join("") + '</div>';
      }
    } else if (me.actionType === "peek") {
      html += '<button class="primary wide" id="peekBtn">👁 Quan sát lén Ma sói</button>';
    } else {
      html += '<div class="target-grid">' + me.targets.map(t =>
        '<button class="target" data-target="' + t.id + '">' + esc(t.name) + '</button>'
      ).join("") + '</div>';
    }
  } else if (me && !me.alive) {
    html = '<div class="empty-state">Bạn đã bị loại khỏi ván chơi.<br><small>Bạn có thể theo dõi diễn biến nhưng không thể bỏ phiếu hay dùng kỹ năng.</small></div>';
  } else {
    html = '<div class="empty-state">Đang chờ lượt chơi của vai khác...</div>';
  }

  $("actionTitle").textContent =
    s.phase === "night" ? "Hành động bí mật" :
    s.phase === "vote" ? "Bỏ phiếu kín" :
    s.phase === "discussion" ? "Thảo luận" :
    s.phase === "deathshot" ? "Phát súng cuối cùng" : "Diễn biến";
  $("actionArea").innerHTML = html;

  $("actionArea").querySelectorAll(".cupid-target").forEach(b => b.onclick = () => {
    const id = b.dataset.target;
    if (cupidSelected.includes(id)) cupidSelected = cupidSelected.filter(x => x !== id);
    else if (cupidSelected.length < 2) cupidSelected.push(id);
    b.classList.toggle("selected", cupidSelected.includes(id));
    $("cupidCount").textContent = "Đã chọn " + cupidSelected.length + "/2 người";
    $("cupidConfirm").disabled = cupidSelected.length !== 2;
  });
  const cupidConfirm = $("cupidConfirm");
  if (cupidConfirm) cupidConfirm.onclick = () => {
    if (cupidSelected.length !== 2) return;
    socket.emit("nightAction", { targetIds: cupidSelected });
    cupidConfirm.disabled = true;
  };

  $("actionArea").querySelectorAll("[data-target]:not(.cupid-target)").forEach(b => b.onclick = () => {
    if (me && me.actionDone) return showToast("Bạn đã gửi lựa chọn.");
    const targetId = b.dataset.target;
    const action = me && me.actionType;
    b.disabled = true;
    if (action === "vote") socket.emit("vote", { targetId });
    else if (action === "hunterShot") socket.emit("hunterShot", { targetId });
    else if (action === "witch") socket.emit("nightAction", { action: "poison", targetId });
    else socket.emit("nightAction", { targetId });
  });
  const save = $("saveBtn"); if (save) save.onclick = () => socket.emit("nightAction", { action: "save" });
  const skip = $("skipBtn"); if (skip) skip.onclick = () => socket.emit("nightAction", { action: "skip" });
  const peek = $("peekBtn"); if (peek) peek.onclick = () => { peek.disabled = true; socket.emit("nightAction", { action: "peek" }); };
  const replay = $("replayBtn");
  if (replay) replay.onclick = () => {
    if (window.confirm("Mở lại sảnh chờ cho ván mới? Tất cả người chơi sẽ cần sẵn sàng lại.")) {
      replay.disabled = true;
      socket.emit("replayGame");
    }
  };
  const ready = $("readyVoteBtn"); if (ready) ready.onclick = () => socket.emit("readyVote");
}

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function formatTime(n) { return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0"); }
setInterval(() => {
  if (state && state.endsAt) $("timer").textContent = formatTime(Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000)));
}, 500);
