const ROLE_ICONS = {
wolf:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M25 43 17 15l29 17q14-8 28 0l29-17-8 31q8 13 4 31-7 30-39 34-32-4-39-34-4-19 4-34Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m39 55 10 5m32-5L71 60M47 77q13 11 26 0M60 60v8m-10 19 10 8 10-8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
villager:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m18 55 42-34 42 34v48H18Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M45 103V72q15-16 30 0v31M28 60h64M52 46q8-8 16 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
seer:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m60 12 34 35-34 61-34-61Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m26 47 34 13 34-13M60 60v48M45 36l15 24 15-24M60 4v-2M12 47H4m112 0h-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
witch:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M44 18h32v18l13 13v48q0 9-9 9H40q-9 0-9-9V49l13-13Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M44 18h32M45 36h30M32 70q14-9 28 0t29 0M47 82l8 8 18-20" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
protector:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 10 99 25v29q0 35-39 56Q21 89 21 54V25Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M60 32v55M38 54h44M60 40l7 14-7 14-7-14Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
hunter:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M29 14q73 46 0 92M29 14l62 46-62 46" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 60h83m-15-15 15 15-15 15" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
cupid:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 99 20 61C-1 37 30 8 52 31l8 9 8-9c22-23 53 6 32 30Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m18 92 78-63m-17 0 17 0 0 17" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
elder:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 16q-24 0-27 25-20 4-16 25 1 17 20 20h46q19-3 20-20 4-21-16-25-3-25-27-25Z" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M60 86v24m-13-8 13-9 13 9M44 54h2m28 0h2m-30 17q14 10 28 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
littleGirl:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 9q22 23 3 39 17-6 18-19 19 29-3 47-19 16-39 0-20-19 1-43-1 17 12 18Q49 32 60 9Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M39 88h42v18H39zM34 106h52M48 88V78h24v10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
mayor:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m17 40 24 18 19-36 19 36 24-18-9 55H26Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M26 78h68M31 104h58M39 94h42" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="17" cy="34" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="17" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="103" cy="34" r="6" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
medium:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M35 56q0-29 25-29t25 29q0 18 13 27H22q13-9 13-27Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M48 93q3 15 12 15t12-15M60 27V12m-9 0h18M25 46l-9-7m79 7 9-7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="57" r="5" fill="currentColor"/></svg>'
};
const GENERIC_AVATAR='<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="27" r="14" fill="currentColor"/><path d="M13 72q2-25 27-25t27 25" fill="currentColor"/></svg>';



const socket = io();
const $ = (id) => document.getElementById(id);
let state = null, selected = null, myToken = "", myCode = "", toastTimer = null;
let currentGuideRole = null, guideOpen = true, cupidSelected = [], renderedSettingsKey = "";
let lastPoses = new Map(), previousPhase = null;
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
  document.body.dataset.phase = s.phase || "lobby";
  $("tableBoard").dataset.phase = s.phase || "lobby";
  if (s.phase === "dealing" && previousPhase !== "dealing") {
    currentGuideRole = null;
    $("roleCard").classList.remove("flipped", "role-card-reveal");
  }
  previousPhase = s.phase;
  $("roomCodeLabel").textContent = s.code;
  $("countLabel").textContent = s.playerCount + "/" + ((s.settings && s.settings.maxPlayers) || 16);
  $("notice").textContent = s.announcement || "";
  $("phaseLabel").textContent =
    s.phase === "lobby" ? "SẢNH CHỜ" :
    s.phase === "dealing" ? "QUẢN TRÒ ĐANG CHIA BÀI" :
    s.phase === "roleReveal" ? "LẬT THẺ NHÂN VẬT" :
    s.phase === "nightIntro" ? "ĐÊM XUỐNG" :
    s.phase === "daybreak" ? "BÌNH MINH" :
    s.phase === "night" ? "ĐÊM " + (s.day + 1) :
    s.phase === "discussion" ? "THẢO LUẬN · NGÀY " + s.day :
    s.phase === "vote" ? "BỎ PHIẾU · NGÀY " + s.day :
    s.phase === "deathshot" ? "PHÁT SÚNG CUỐI CÙNG" : s.phase === "intermission" ? "KẾT QUẢ BỎ PHIẾU" : "KẾT THÚC";
  const me = s.self;
  const dealingCards = s.phase === "dealing" || s.phase === "roleReveal";
  $("tableStatus").textContent =
    s.phase === "lobby" ? "MỌI NGƯỜI ĐANG TẬP TRUNG" :
    s.phase === "dealing" ? "QUẢN TRÒ ĐANG CHIA BÀI" :
    s.phase === "roleReveal" ? "HÃY LẬT THẺ CỦA BẠN" :
    s.phase === "nightIntro" || s.phase === "night" ? "CẢ NGÔI LÀNG ĐANG NGỦ" :
    s.phase === "daybreak" || s.phase === "discussion" || s.phase === "vote" ? "DÂN LÀNG ĐÃ THỨC DẬY" :
    s.phase === "ended" ? "VÁN CHƠI ĐÃ KẾT THÚC" : "DIỄN BIẾN ĐANG TIẾP TỤC";
  $("players").innerHTML = s.players.map((p, i) => {
    const count = Math.max(1, s.players.length);
    const angle = (Math.PI * 2 * i / count) - Math.PI / 2;
    const x = 50 + Math.cos(angle) * 43;
    const y = 50 + Math.sin(angle) * 39;
    const pose = p.pose || (!p.alive ? "dead" : "sitting");
    const poseChanged = lastPoses.has(p.id) && lastPoses.get(p.id) !== pose;
    lastPoses.set(p.id, pose);
    const tileState = !p.alive ? "dead" : (!p.connected ? "disconnected" : "alive");
    const statusText = !p.alive ? "ĐÃ CHẾT" : (!p.connected ? "MẤT KẾT NỐI" : (s.status === "lobby" ? (p.ready ? "SẴN SÀNG" : "ĐANG CHỜ") : "CÒN SỐNG"));
    const dealCard = dealingCards ? '<div class="seat-card-back" aria-hidden="true"><span>☾</span></div>' : "";
    return '<div class="player-tile ' + tileState + ' pose-' + pose + (poseChanged ? " pose-transition" : "") + (me && me.id === p.id ? " is-self" : "") + (p.canManage ? " managed" : "") + (p.isHost ? " is-host" : "") + '" data-player-id="' + esc(p.id) + '" style="--seat-x:' + x + '%;--seat-y:' + y + '%;--seat-delay:' + (i * 95) + 'ms">' +
    dealCard +
    '<div class="tile-art avatar-tone-' + (i % 6) + '"><span class="tile-spark">✦</span><span class="tile-person">' + GENERIC_AVATAR + '</span><span class="tile-number">' + String(i + 1).padStart(2, "0") + '</span></div>' +
    '<div class="tile-name">' + esc(p.name) + '</div>' +
    (p.isHost ? '<span class="host-badge">♛ CHỦ PHÒNG</span>' : '') +
    '<span class="tile-status">' + (!p.alive ? "✕ " : (!p.connected ? "◌ " : (s.status === "lobby" && p.ready ? "✓ " : "● "))) + statusText + '</span>' +
    (p.canManage ? '<div class="player-actions"><button class="player-action" title="Chuyển chủ phòng" aria-label="Chuyển chủ phòng" data-transfer="' + p.id + '">⇧</button><button class="player-action kick" title="Kick người chơi" aria-label="Kick người chơi" data-kick="' + p.id + '">×</button></div>' : '') +
    (s.isRevealed ? '<span class="revealed-role">' + esc(p.role || "") + '</span>' : "") + '</div>';
  }).join("");
  $("players").querySelectorAll("[data-kick]").forEach(button => button.onclick = () => {
    const target = s.players.find(p => p.id === button.dataset.kick);
    if (target && window.confirm("Mời " + target.name + " ra khỏi phòng?")) socket.emit("kickPlayer", { targetId: target.id });
  });
  $("players").querySelectorAll("[data-transfer]").forEach(button => button.onclick = () => {
    const target = s.players.find(p => p.id === button.dataset.transfer);
    if (target && window.confirm("Chuyển quyền chủ phòng cho " + target.name + "?")) socket.emit("transferHost", { targetId: target.id });
  });

  $("selfStatus").textContent = me ? ("Bạn: " + me.name + (me.alive ? " · Còn sống" : " · Đã bị loại")) : "";
  $("roleCard").classList.toggle("hidden", !me || !me.role);
  if (me && me.role) renderRoleCard(me);
  $("roleCard").classList.toggle("flipped", !!(me && me.roleRevealed));
  $("lobbyControls").classList.toggle("hidden", s.status !== "lobby");
  $("readyBtn").textContent = me && me.ready ? "Hủy sẵn sàng" : "Tôi đã sẵn sàng";
  $("startBtn").classList.toggle("hidden", !(me && me.isHost));
  $("startBtn").disabled = !s.canStart;
  $("startBtn").style.opacity = s.canStart ? "1" : ".45";
  const hostPlayer = s.players.find(p => p.isHost);
  $("hostHint").textContent = me && me.isHost
    ? "👑 Bạn là chủ phòng. Có thể bắt đầu, kick, chuyển quyền và cài đặt ván chơi."
    : "Chủ phòng: " + (hostPlayer ? hostPlayer.name : "đang được chuyển giao") + ". Chỉ chủ phòng mới được bắt đầu và quản lý người chơi.";
  $("hostSettings").classList.toggle("hidden", !(me && me.isHost && s.status === "lobby"));
  syncHostSettings(s.settings || {});
  $("chatArea").classList.toggle("hidden", s.phase !== "discussion" || !me || !me.alive);
  $("chatMessages").innerHTML = (s.chat || []).map(m =>
    '<div class="chat-msg"><b>' + esc(m.name) + '</b>' + esc(m.message) + '</div>'
  ).join("");
  $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
  $("timer").textContent = s.endsAt ? formatTime(Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000))) : "—";
  renderHistory(s);
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
    $("roleCard").classList.remove("role-card-reveal");
    void $("roleCard").offsetWidth;
    $("roleCard").classList.add("role-card-reveal");
  }
  const roleTeams = { wolf: "PHE MA SÓI", cupid: "ĐỘC LẬP / ĐÔI TÌNH NHÂN" };
  $("roleCard").dataset.role = me.role;
  $("roleCard").classList.toggle("flipped", !!me.roleRevealed);
  $("roleArt").innerHTML = ROLE_ICONS[me.role] || '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 12 72 48 108 60 72 72 60 108 48 72 12 60 48 48Z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
  $("roleTeam").textContent = roleTeams[me.role] || "PHE DÂN LÀNG";
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


function renderHistory(s) {
  const events = Array.isArray(s.history) ? s.history : [];
  $("historyPanel").classList.toggle("hidden", s.status === "lobby");
  $("historyCount").textContent = events.length + " sự kiện";
  if (!events.length) {
    $("historyList").innerHTML = '<div class="history-empty">Chưa có diễn biến nào được ghi nhận.</div>';
    return;
  }
  const labelFor = event => {
    if (event.phase === "night") return "ĐÊM " + (Number(event.day || 0) + 1);
    if (event.phase === "discussion" || event.phase === "vote" || event.phase === "intermission") return "NGÀY " + Math.max(1, Number(event.day || 0));
    if (event.phase === "ended") return "KẾT QUẢ";
    return "DIỄN BIẾN";
  };
  $("historyList").innerHTML = events.slice().reverse().map(event => {
    const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString("vi-VN", {hour:"2-digit",minute:"2-digit"}) : "";
    const privateEvent = event.visibility === "private";
    const kind = ["phase","result","private"].includes(event.kind) ? event.kind : "system";
    return '<article class="history-item ' + kind + (privateEvent ? ' private-event' : '') + '">' +
      '<div class="history-marker"></div><div class="history-content">' +
      '<div class="history-meta"><span>' + labelFor(event) + '</span>' +
      (privateEvent ? '<b class="private-tag">RIÊNG BẠN</b>' : '<b class="public-tag">CÔNG KHAI</b>') +
      '<time>' + esc(time) + '</time></div>' +
      '<p>' + esc(event.message) + '</p></div></article>';
  }).join("");
}
function renderAction(s) {
  const me = s.self;
  let html = "";
  if (s.phase === "lobby") {
    html = '<div class="empty-state">Chờ đủ người chơi và cùng sẵn sàng.<br><small>Chia sẻ mã phòng ' + esc(s.code) + ' cho bạn bè.</small></div>';
  } else if (s.phase === "dealing") {
    html = '<div class="deal-scene"><div class="deal-deck"><span>☾</span><span>✦</span><span>☽</span></div><h3>QUẢN TRÒ ĐANG CHIA BÀI</h3><p>Những lá bài bí mật đang được gửi đến từng vị trí quanh bàn.</p><div class="deal-progress"><i></i></div><small>' + s.playerCount + ' LÁ BÀI · KHÔNG AI ĐƯỢC XEM ROLE CỦA NGƯỜI KHÁC</small></div>';
  } else if (s.phase === "roleReveal") {
    if (!me || !me.roleRevealed) {
      html = '<div class="role-reveal-prompt"><div class="face-down-card"><span>☾</span><b>?</b><small>THẺ NHÂN VẬT</small></div><h3>BẠN ĐÃ NHẬN ĐƯỢC MỘT LÁ BÀI</h3><p>Hãy lật thẻ để khám phá thân phận bí mật của mình.</p><button class="primary wide" id="flipRoleBtn">LẬT THẺ NHÂN VẬT</button></div>';
    } else if (!me.roleSeen) {
      html = '<div class="role-reveal-prompt"><h3>HÃY ĐỌC KỸ NĂNG CỦA BẠN</h3><p>Thẻ nhân vật của bạn đã được lật. Đọc hướng dẫn ở trên rồi xác nhận để bắt đầu ván chơi.</p><button class="primary wide" id="confirmRoleBtn">TÔI ĐÃ HIỂU ROLE</button></div>';
    } else {
      html = '<div class="empty-state">Bạn đã xác nhận role.<br><small>Đang chờ những người chơi còn lại xem bài...</small></div>';
    }
  } else if (s.phase === "nightIntro") {
    html = '<div class="night-intro"><div class="night-moon">☾</div><h3>TRỜI ĐÃ TỐI</h3><p>Tất cả dân làng hãy cúi mặt xuống bàn và đi ngủ.</p></div>';
  } else if (s.phase === "daybreak") {
    html = '<div class="daybreak-intro"><div class="daybreak-sun">☼</div><h3>TRỜI ĐÃ SÁNG</h3><p>Dân làng từ từ thức dậy. Chuẩn bị nghe thông báo từ quản trò.</p></div>';
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
    s.phase === "dealing" ? "Quản trò chia bài" :
    s.phase === "roleReveal" ? "Thẻ nhân vật của bạn" :
    s.phase === "nightIntro" ? "Dân làng đi ngủ" :
    s.phase === "daybreak" ? "Bình minh" :
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
  const flipRole = $("flipRoleBtn");
  if (flipRole) flipRole.onclick = () => { flipRole.disabled = true; socket.emit("revealRole"); };
  const confirmRole = $("confirmRoleBtn");
  if (confirmRole) confirmRole.onclick = () => { confirmRole.disabled = true; socket.emit("confirmRoleSeen"); };
  const ready = $("readyVoteBtn"); if (ready) ready.onclick = () => socket.emit("readyVote");
}


function syncHostSettings(settings) {
  const key = JSON.stringify(settings);
  if (key === renderedSettingsKey) return;
  renderedSettingsKey = key;
  $("settingMaxPlayers").value = String(settings.maxPlayers || 16);
  $("settingDiscussion").value = String(settings.discussionSeconds || 180);
  $("settingVote").value = String(settings.voteSeconds || 45);
  $("settingNight").value = String(settings.nightSeconds || 35);
  $("settingDeal").value = String(settings.dealSeconds || 4);
  $("settingRoleReveal").value = String(settings.roleRevealSeconds || 25);
  $("settingWolfCount").value = String(settings.wolfCount ?? 0);
  $("settingRoleMode").value = settings.customRoles ? "custom" : "auto";
  $("customRoleSettings").classList.toggle("hidden", !settings.customRoles);
  document.querySelectorAll("input[name='enabledRoles']").forEach(input => {
    input.checked = Array.isArray(settings.enabledRoles) && settings.enabledRoles.includes(input.value);
  });
}
$("settingRoleMode").addEventListener("change", () => {
  $("customRoleSettings").classList.toggle("hidden", $("settingRoleMode").value !== "custom");
});
$("saveHostSettingsBtn").onclick = () => {
  const enabledRoles = Array.from(document.querySelectorAll("input[name='enabledRoles']:checked")).map(input => input.value);
  socket.emit("hostSettings", {
    maxPlayers: Number($("settingMaxPlayers").value),
    discussionSeconds: Number($("settingDiscussion").value),
    voteSeconds: Number($("settingVote").value),
    nightSeconds: Number($("settingNight").value),
    dealSeconds: Number($("settingDeal").value),
    roleRevealSeconds: Number($("settingRoleReveal").value),
    wolfCount: Number($("settingWolfCount").value),
    customRoles: $("settingRoleMode").value === "custom",
    enabledRoles
  });
  showToast("Đã gửi cài đặt lên máy chủ để xác nhận.");
};

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function formatTime(n) { return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0"); }
setInterval(() => {
  if (state && state.endsAt) $("timer").textContent = formatTime(Math.max(0, Math.ceil((state.endsAt - Date.now()) / 1000)));
}, 500);
