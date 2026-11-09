const ROLE_PALETTES = {
  wolf:["#e5a0a2","#71363f","#241a27"],villager:["#c6ae82","#6c563b","#211f1d"],
  seer:["#a7a0e8","#55458c","#211b3a"],witch:["#c58cdb","#673d7d","#24172e"],
  protector:["#9ebbd8","#42617d","#172637"],hunter:["#d6a36f","#79502f","#241c19"],
  cupid:["#e99ab7","#8d416d","#2c1b31"],elder:["#cbb58a","#776044","#29231e"],
  littleGirl:["#a6c6d8","#536c85","#1c2632"],mayor:["#e2c27b","#80602f","#2b2118"],
  medium:["#a5b6cf","#596d8d","#1d2232"],thief:["#c2a0a1","#69414c","#211923"],
  "white-wolf":["#d5e2ed","#70889d","#202b3c"],"wolf-cub":["#d99b83","#844e48","#281c24"],
  scapegoat:["#c6b0a0","#735c50","#251e1c"],"pied-piper":["#9acbb9","#426f68","#172a2a"],
  knight:["#d4c08e","#806b43","#24231f"],angel:["#e8d9a4","#9b8652","#30291c"]
};
const ROLE_DRAWINGS = {
wolf:'<path d="M60 16 82 29 105 17 98 51Q109 77 88 96 75 108 60 111 45 108 32 96 11 77 22 51L15 17 38 29Z" fill="url(#metal)" stroke="#f4c1a8" stroke-width="2.2"/><path d="m25 47 21 8 14-7 14 7 21-8-10 29-25 22-25-22Z" fill="#251b25"/><path d="m34 59 15 4m37-4-15 4" stroke="#ffcfb1" stroke-width="4" stroke-linecap="round"/><path d="m51 77 9 5 9-5-9 15Z" fill="#e7a0a0"/>',
villager:'<path d="M25 53 60 19 95 53v50H25Z" fill="url(#metal)" stroke="#e5cda1" stroke-width="2"/><path d="M43 103V73q17-20 34 0v30" fill="#302820" stroke="#e5cda1" stroke-width="2"/><path d="M19 55 60 12l41 43M34 59h52" fill="none" stroke="#f0d9aa" stroke-width="3" stroke-linecap="round"/><circle cx="60" cy="56" r="8" fill="#d7b98a"/>',
seer:'<path d="M60 13Q93 32 91 63 87 94 60 108 33 94 29 63 27 32 60 13Z" fill="url(#metal)" stroke="#e0c5ff" stroke-width="2"/><path d="M17 60Q60 19 103 60 60 101 17 60Z" fill="#211a35" stroke="#c3b0ff" stroke-width="2.5"/><ellipse cx="60" cy="60" rx="15" ry="20" fill="#b8a7f4"/><ellipse cx="60" cy="60" rx="6" ry="12" fill="#30234f"/><circle cx="60" cy="60" r="3" fill="#fff0d1"/><path d="M60 5v10m0 90v10M9 60h12m78 0h12" stroke="#e8d5ff" stroke-width="2"/>',
witch:'<path d="M22 44 60 10 99 44 78 39 60 30 42 39Z" fill="url(#metal)" stroke="#e8b9ef" stroke-width="2"/><path d="M37 43q23-12 46 0l-7 12q-1 29-16 37-15-8-16-37Z" fill="#35223f" stroke="#d7a7e5" stroke-width="2"/><path d="M48 67q12-8 24 0l-4 23H52Z" fill="#9a6ca7"/><path d="M60 57v-9m-8 15 8-6 8 6" stroke="#f0d5fa" stroke-width="2" fill="none"/><path d="M29 90q-12-9 0-18m62 18q12-9 0-18" fill="none" stroke="#c48bd7" stroke-width="3" stroke-linecap="round"/>',
protector:'<path d="M60 12 98 27v27q0 34-38 55Q22 88 22 54V27Z" fill="url(#metal)" stroke="#d4e7f7" stroke-width="2.5"/><path d="M60 28v66M35 57h50M60 37 73 57 60 77 47 57Z" fill="none" stroke="#f0e0b5" stroke-width="3"/><path d="M60 42 69 57 60 72 51 57Z" fill="#e8d5a1"/>',
hunter:'<path d="M25 17q70 43 0 86M25 17l70 43-70 43" fill="none" stroke="#e8bd87" stroke-width="5" stroke-linecap="round"/><path d="M16 60h89m-16-13 16 13-16 13" fill="none" stroke="#f4dfbd" stroke-width="3"/><path d="M60 31v58" stroke="#8c5b3c" stroke-width="2"/>',
cupid:'<path d="M60 99 22 64Q4 44 24 27q17-14 36 9 19-23 36-9 20 17 2 37Z" fill="url(#metal)" stroke="#ffd1e1" stroke-width="2.5"/><path d="M18 94 100 25m-21 0h21v21" fill="none" stroke="#ffe2bd" stroke-width="3.5" stroke-linecap="round"/><path d="M60 40v32m-9-9 9 9 9-9" fill="none" stroke="#fff0dc" stroke-width="2"/>',
elder:'<path d="M25 58q-7-34 35-40 42 6 35 40l-7 20H32Z" fill="url(#metal)" stroke="#f0d7a8" stroke-width="2"/><path d="M38 52q22-17 44 0M43 68h4m26 0h4M47 81q13 10 26 0" fill="none" stroke="#f5e4c4" stroke-width="3" stroke-linecap="round"/><path d="M60 78v34m-13-7 13-10 13 10" stroke="#d7bd91" stroke-width="4" fill="none"/>',
littleGirl:'<path d="M60 12q34 19 23 50-5 17-23 23-18-6-23-23Q26 31 60 12Z" fill="url(#metal)" stroke="#d2e4f3" stroke-width="2"/><path d="M29 49q31-32 62 0L82 69 60 87 38 69Z" fill="#263344" stroke="#c4d7e5" stroke-width="2"/><circle cx="48" cy="59" r="4" fill="#f3d7a5"/><circle cx="72" cy="59" r="4" fill="#f3d7a5"/><path d="M42 92h36v13H42Z" fill="#738ba2"/>',
mayor:'<path d="m18 39 24 19 18-35 18 35 24-19-9 58H27Z" fill="url(#metal)" stroke="#f3d89c" stroke-width="2.5"/><circle cx="18" cy="34" r="6" fill="#f3d89c"/><circle cx="60" cy="17" r="7" fill="#f3d89c"/><circle cx="102" cy="34" r="6" fill="#f3d89c"/><path d="M31 73h58M40 86h40" stroke="#fff0bd" stroke-width="3"/>',
medium:'<path d="M60 12q-27 22-17 48L27 81h66L77 60q10-26-17-48Z" fill="url(#metal)" stroke="#d6e0f1" stroke-width="2"/><path d="M42 47q18-14 36 0M48 59h2m20 0h2M49 70q11 8 22 0" fill="none" stroke="#f4e5ca" stroke-width="2.5"/><path d="M60 82v24m-9-8 9 8 9-8" fill="none" stroke="#c4d4ed" stroke-width="3"/><circle cx="60" cy="15" r="5" fill="#fff0c8"/>',
thief:'<path d="M20 44q40-35 80 0l-9 10H29Z" fill="url(#metal)" stroke="#e7c4c5" stroke-width="2"/><path d="M34 55h52l-6 24H40Z" fill="#2a202b"/><path d="M44 65h10m12 0h10" stroke="#f3d8cf" stroke-width="4" stroke-linecap="round"/><path d="M60 80v27m-13-8 13 8 13-8" fill="none" stroke="#d7a9ad" stroke-width="3"/>',
"white-wolf":'<path d="M24 45 17 14 46 31q14-9 28 0l29-17-7 31q12 30-36 64-48-34-36-64Z" fill="url(#metal)" stroke="#edf6ff" stroke-width="2.5"/><path d="m34 58 16 5m36-5-16 5M46 80q14 11 28 0" stroke="#f7fbff" stroke-width="4" stroke-linecap="round"/><path d="M60 5v18m-7-9h14" stroke="#d9ecff" stroke-width="2"/>',
"wolf-cub":'<path d="M28 45 21 20 47 34q13-8 26 0l26-14-7 27q8 29-32 57-40-28-32-59Z" fill="url(#metal)" stroke="#efc0a9" stroke-width="2.5"/><circle cx="47" cy="61" r="4" fill="#ffe3a8"/><circle cx="73" cy="61" r="4" fill="#ffe3a8"/><path d="M51 80q9 7 18 0" stroke="#f4d1b9" stroke-width="3" fill="none" stroke-linecap="round"/>',
scapegoat:'<path d="M60 12 73 40l30 4-22 21 6 31-27-15-27 15 6-31L9 44l30-4Z" fill="url(#metal)" stroke="#e6d4c8" stroke-width="2"/><path d="M60 43v26m0 11v3" stroke="#fff0df" stroke-width="4" stroke-linecap="round"/>',
"pied-piper":'<path d="M18 80q22-38 42 0t42 0" fill="none" stroke="#d1f0df" stroke-width="3"/><path d="M35 47 82 34l5 12-47 13Z" fill="url(#metal)" stroke="#d1f0df" stroke-width="2"/><path d="m49 45 2 12m10-15 2 12m10-15 2 12" stroke="#29413d" stroke-width="2"/><path d="M60 17v14m-8-7h16" stroke="#d1f0df" stroke-width="2"/>',
knight:'<path d="M60 12 91 36v39L60 108 29 75V36Z" fill="url(#metal)" stroke="#f0dfb6" stroke-width="2.5"/><path d="M60 25v66M43 55h34M60 42l12 13-12 13-12-13Z" fill="none" stroke="#fff0ca" stroke-width="3"/><path d="M60 3v15m-8-8h16" stroke="#f0dfb6" stroke-width="3"/>',
angel:'<path d="M60 41Q26 2 14 29q4 35 46 48 42-13 46-48Q94 2 60 41Z" fill="url(#metal)" stroke="#fff0ce" stroke-width="2.5"/><path d="M60 38v69m-14-8 14 8 14-8" fill="none" stroke="#fff4d7" stroke-width="3"/><ellipse cx="60" cy="27" rx="18" ry="7" fill="none" stroke="#f4dfa5" stroke-width="3"/><circle cx="60" cy="28" r="5" fill="#fff4d7"/>'
};
function roleIllustration(role) {
  const p = ROLE_PALETTES[role] || ROLE_PALETTES.villager;
  const accents = {
    wolf:'<path d="M48 56 34 20 66 39Q80 30 94 39L126 20 112 57" fill="#25202a" stroke="#e9a0a0" stroke-width="4" stroke-linejoin="round"/><path d="M49 69 60 74m40-5L89 74" stroke="#ffe1bd" stroke-width="4" stroke-linecap="round"/><path d="M70 88 80 94 90 88 80 105Z" fill="#e99b9e"/>',
    villager:'<path d="M44 50 80 18 116 50" fill="none" stroke="#e8c995" stroke-width="8" stroke-linecap="round"/><path d="M54 43v-8q26-18 52 0v8" fill="#8a6847"/>',
    seer:'<path d="M43 62Q27 15 80 12q53 3 37 50L104 45 80 35 56 45Z" fill="#34264c" stroke="#c3b0ff" stroke-width="3"/><circle cx="80" cy="22" r="7" fill="#e7d8ff"/>',
    witch:'<path d="M40 42 79 4 124 43 96 36 78 30 58 38Z" fill="#372442" stroke="#d7a7e5" stroke-width="3"/><path d="M49 44q30-13 61 0" stroke="#d7a7e5" stroke-width="5" fill="none"/>',
    protector:'<path d="M42 55 43 31 80 12 117 31 118 55 102 45 80 38 58 45Z" fill="#536f8a" stroke="#d4e7f7" stroke-width="3"/><path d="M80 16v27m-16-14h32" stroke="#f4dfb4" stroke-width="3"/>',
    hunter:'<path d="M34 48q46-33 92 0l-8 9H42Z" fill="#76502e" stroke="#e8bd87" stroke-width="3"/><path d="M80 20v20" stroke="#e8bd87" stroke-width="3"/>',
    cupid:'<path d="M48 47Q15 11 23 54q7 24 36 26M112 47q33-36 25 7-7 24-36 26" fill="none" stroke="#f2bfd3" stroke-width="8" stroke-linecap="round"/><path d="M80 17v14m-7-7h14" stroke="#ffe2bd" stroke-width="3"/>',
    elder:'<path d="M48 68q-18 27 2 42 30 22 60 0 20-15 2-42l-12 15-12-7-8 12-8-12-12 7Z" fill="#ded0b9" stroke="#a58d6e" stroke-width="2"/><path d="M48 42q32-26 64 0" stroke="#d9c19a" stroke-width="8" fill="none"/>',
    littleGirl:'<path d="M43 44Q27 8 60 23L80 10 100 23Q133 8 117 44" fill="#35485e" stroke="#c4d7e5" stroke-width="3"/><path d="M80 13q-18-18-27 0 9 16 27 13 18 3 27-13-9-18-27 0Z" fill="#b6cce0"/>',
    mayor:'<path d="m39 45 10-29 22 20 9-31 10 31 22-20 10 29Z" fill="#a98645" stroke="#f3d89c" stroke-width="3"/><circle cx="80" cy="12" r="5" fill="#fff0bd"/>',
    medium:'<path d="M42 52Q28 5 80 7q52-2 38 45L99 39 80 32 61 39Z" fill="#3d4960" stroke="#d6e0f1" stroke-width="3"/><path d="M80 9v18m-8-9h16" stroke="#fff0c8" stroke-width="3"/>',
    thief:'<path d="M35 43q45-40 90 0l-10 12H45Z" fill="#3c3039" stroke="#e7c4c5" stroke-width="3"/><path d="M48 61q32-13 64 0l-5 18H53Z" fill="#211b25" stroke="#d7a9ad" stroke-width="2"/>',
    "white-wolf":'<path d="M47 57 32 13 66 37Q80 28 94 37l34-24-15 44" fill="#dce7ed" stroke="#f3fbff" stroke-width="4"/><path d="M65 20 80 4 95 20" fill="none" stroke="#c9e2f3" stroke-width="3"/>',
    "wolf-cub":'<path d="M49 55 42 25 68 40Q80 33 92 40l26-15-7 31" fill="#9b6458" stroke="#efc0a9" stroke-width="4"/><circle cx="80" cy="24" r="5" fill="#ffe3a8"/>',
    scapegoat:'<path d="M80 9 91 31l25 4-18 18 5 25-23-12-23 12 5-25L44 35l25-4Z" fill="#8a7468" stroke="#e6d4c8" stroke-width="3"/>',
    "pied-piper":'<path d="M41 33 112 55l-5 10-70-22Z" fill="#7ca99b" stroke="#d1f0df" stroke-width="3"/><path d="m60 39 3 16m15-11 3 16m15-11 3 16" stroke="#28453f" stroke-width="2"/>',
    knight:'<path d="M47 51V29L80 10l33 19v22l-13-8H60Z" fill="#a18a5a" stroke="#f0dfb6" stroke-width="3"/><path d="M80 12v35m-15-17h30" stroke="#fff0ca" stroke-width="3"/>',
    angel:'<path d="M50 48Q8 3 18 56q7 22 44 27M110 48q42-45 32 8-7 22-44 27" fill="#d9d0b3" stroke="#fff0ce" stroke-width="3"/><ellipse cx="80" cy="15" rx="23" ry="7" fill="none" stroke="#f4dfa5" stroke-width="4"/>'
  };
  const isWolf = role === "wolf" || role === "white-wolf" || role === "wolf-cub";
  const face = isWolf
    ? '<path d="M53 48 62 41 80 46 98 41 107 48 104 88Q96 111 80 117 64 111 56 88Z" fill="#6b5554" stroke="#e8c4b1" stroke-width="2.5"/><path d="M65 77 73 80m22-3-8 3" stroke="#ffe2bd" stroke-width="4" stroke-linecap="round"/><path d="M74 91 80 95 86 91 80 103Z" fill="#eaa4a2"/>'
    : '<path d="M55 50Q80 31 105 50L102 88Q96 111 80 115 64 111 58 88Z" fill="#d9a27e" stroke="#f0c4a2" stroke-width="2"/><path d="M67 77h2m22 0h2" stroke="#34272a" stroke-width="3.5" stroke-linecap="round"/><path d="M73 96q7 6 14 0" fill="none" stroke="#874f4d" stroke-width="2.5" stroke-linecap="round"/>';
  const hair = isWolf ? '' : '<path d="M53 62Q45 25 80 25q35 0 27 37l-8-13-10 5-9-8-13 9-9-4Z" fill="#342b2c" stroke="#1b1920" stroke-width="2"/>';
  const cloak = '<path d="M31 155Q33 110 58 106L80 117 102 106Q127 110 129 155Z" fill="url(#robe)" stroke="' + p[0] + '" stroke-width="3"/><path d="m80 119-12 36m12-36 12 36" stroke="' + p[0] + '" stroke-opacity=".55" stroke-width="2"/><path d="M67 119 80 132 93 119" fill="none" stroke="#f0d5a0" stroke-width="2"/>';
  const defs = '<defs><linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + p[0] + '"/><stop offset=".55" stop-color="' + p[1] + '"/><stop offset="1" stop-color="' + p[2] + '"/></linearGradient><radialGradient id="portraitHalo"><stop stop-color="' + p[1] + '" stop-opacity=".55"/><stop offset="1" stop-color="' + p[2] + '" stop-opacity="0"/></radialGradient></defs>';
  return '<svg class="role-illustration role-portrait" viewBox="0 0 160 160" role="img" aria-label="Minh họa nhân vật role" xmlns="http://www.w3.org/2000/svg">' + defs +
    '<circle cx="80" cy="80" r="75" fill="url(#portraitHalo)"/><circle cx="80" cy="80" r="70" fill="none" stroke="' + p[0] + '" stroke-opacity=".6" stroke-width="1.5"/>' +
    '<g>' + cloak + '<path d="M48 69Q42 26 80 24q38 2 32 45l-8 17H56Z" fill="#33272b" opacity=".35"/>' +
    (accents[role] || accents.villager) + hair + face +
    '<path d="M56 65q-9-9-9 3m57-3q9-9 9 3" fill="none" stroke="#b77e68" stroke-width="4"/>' +
    '<path d="M80 86v6" stroke="#9c6558" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M61 119q19 11 38 0" fill="none" stroke="' + p[0] + '" stroke-width="2"/>' +
    '</g><path d="M17 80h8m110 0h8M80 7v8m0 130v8" stroke="' + p[0] + '" stroke-opacity=".65" stroke-width="1.5"/></svg>';
}
const GENERIC_AVATAR = '<span class="avatar-3d" aria-hidden="true"><span class="avatar-shadow"></span><span class="avatar-legs"><i></i><i></i></span><span class="avatar-body"><i class="avatar-arm left"></i><i class="avatar-arm right"></i><i class="avatar-coat"></i></span><span class="avatar-neck"></span><span class="avatar-head"><i class="avatar-ear left"></i><i class="avatar-ear right"></i><i class="avatar-hair"></i><i class="avatar-eye left"></i><i class="avatar-eye right"></i><i class="avatar-nose"></i><i class="avatar-mouth"></i></span></span>';



const socket = io();
const $ = (id) => document.getElementById(id);
let state = null, selected = null, myToken = "", myCode = "", toastTimer = null;
let currentGuideRole = null, guideOpen = true, cupidSelected = [], piperSelected = [], renderedSettingsKey = "";
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
  const phaseChanged = previousPhase !== s.phase;
  if (s.phase === "dealing" && phaseChanged) {
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
  const dealDuration = Math.max(2, Number(s.settings && s.settings.dealSeconds || 4));
  $("tableBoard").style.setProperty("--deal-duration", dealDuration + "s");
  if (s.phase === "dealing" && phaseChanged) {
    const total = Math.max(1, s.players.length);
    $("dealFlyLayer").innerHTML = s.players.map((p, i) => {
      const angle = (Math.PI * 2 * i / total) - Math.PI / 2;
      const x = 50 + Math.cos(angle) * 41;
      const y = 50 + Math.sin(angle) * 39;
      const delay = i * (dealDuration * 650 / total);
      return '<div class="dealing-flying-card" style="--seat-x:' + x + '%;--seat-y:' + y + '%;--seat-delay:' + delay + 'ms"><span>☾</span></div>';
    }).join("");
  } else if (s.phase !== "dealing") {
    $("dealFlyLayer").innerHTML = "";
  }
  const dealingCards = s.phase === "roleReveal";
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
    const x = 50 + Math.cos(angle) * 41;
    const y = 50 + Math.sin(angle) * 39;
    const pose = p.pose || (!p.alive ? "dead" : "sitting");
    const poseChanged = lastPoses.has(p.id) && lastPoses.get(p.id) !== pose;
    lastPoses.set(p.id, pose);
    const tileState = !p.alive ? "dead" : (!p.connected ? "disconnected" : "alive");
    const statusText = !p.alive ? "ĐÃ CHẾT" : (!p.connected ? "MẤT KẾT NỐI" : (s.status === "lobby" ? (p.ready ? "SẴN SÀNG" : "ĐANG CHỜ") : "CÒN SỐNG"));
    const dealCard = dealingCards ? '<div class="seat-card-back" aria-hidden="true"><span>☾</span></div>' : "";
    return '<div class="player-tile ' + tileState + ' pose-' + pose + (poseChanged ? " pose-transition" : "") + (me && me.id === p.id ? " is-self" : "") + (p.canManage ? " managed" : "") + (p.isHost ? " is-host" : "") + '" data-player-id="' + esc(p.id) + '" style="--seat-x:' + x + '%;--seat-y:' + y + '%;--seat-delay:' + (i * 95) + 'ms">' +
    dealCard +
    '<div class="tile-art avatar-tone-' + (i % 6) + '"><span class="tile-spark">✦</span><span class="tile-person"><span class="avatar-stage">' + GENERIC_AVATAR + '</span></span><span class="tile-number">' + String(i + 1).padStart(2, "0") + '</span></div>' +
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
  const roleTeams = {
    wolf: "PHE MA SÓI", "white-wolf": "PHE SÓI · MỤC TIÊU RIÊNG", "wolf-cub": "PHE MA SÓI",
    cupid: "ĐÔI TÌNH NHÂN", thief: "ROLE ĐẶC BIỆT", "pied-piper": "PHE ĐỘC LẬP",
    scapegoat: "PHE DÂN LÀNG", knight: "PHE DÂN LÀNG", angel: "PHE ĐỘC LẬP"
  };
  $("roleCard").dataset.role = me.role;
  $("roleCard").classList.toggle("flipped", !!me.roleRevealed);
  $("roleArt").innerHTML = roleIllustration(me.role);
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
  } else if (me && me.actionType === "voteRestricted") {
    html = '<div class="empty-state"><strong>BẠN KHÔNG CÓ QUYỀN BỎ PHIẾU</strong><br><small>' + esc(me.prompt || "Bạn bị mất quyền bỏ phiếu ở vòng này.") + '</small></div>';
  } else if (me && me.actionType && (me.alive || me.actionType === "hunterShot" || me.actionType === "scapegoatChoice")) {
    html = '<div class="action-prompt">' + esc(me.prompt || "") + '</div>';
    if (me.actionDone) {
      html += '<p class="hint">Đã ghi nhận lựa chọn của bạn. Chờ những người khác...</p>';
    } else if (me.actionType === "cupid") {
      cupidSelected = [];
      html += '<p class="selection-count" id="cupidCount">Đã chọn 0/2 người</p><div class="target-grid">' +
        me.targets.map(t => '<button class="target cupid-target" data-target="' + t.id + '">' + esc(t.name) + '</button>').join("") +
        '</div><button class="primary wide" id="cupidConfirm" disabled>Ghép đôi hai người đã chọn</button>';
    } else if (me.actionType === "piper") {
      piperSelected = [];
      html += '<p class="selection-count" id="piperCount">Đã chọn 0/' + Math.min(2, me.targets.length) + ' người</p><div class="target-grid">' +
        me.targets.map(t => '<button class="target piper-target" data-target="' + t.id + '">' + esc(t.name) + '</button>').join("") +
        '</div><button class="primary wide" id="piperConfirm" disabled>Xác nhận mê hoặc</button>';
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
  $("actionArea").querySelectorAll(".piper-target").forEach(b => b.onclick = () => {
    const id = b.dataset.target;
    if (piperSelected.includes(id)) piperSelected = piperSelected.filter(x => x !== id);
    else if (piperSelected.length < 2) piperSelected.push(id);
    b.classList.toggle("selected", piperSelected.includes(id));
    $("piperCount").textContent = "Đã chọn " + piperSelected.length + "/" + Math.min(2, me.targets.length) + " người";
    $("piperConfirm").disabled = piperSelected.length !== Math.min(2, me.targets.length);
  });
  const piperConfirm = $("piperConfirm");
  if (piperConfirm) piperConfirm.onclick = () => {
    if (piperSelected.length !== Math.min(2, me.targets.length)) return;
    socket.emit("nightAction", { targetIds: piperSelected });
    piperConfirm.disabled = true;
  };

  $("actionArea").querySelectorAll("[data-target]:not(.cupid-target):not(.piper-target)").forEach(b => b.onclick = () => {
    if (me && me.actionDone) return showToast("Bạn đã gửi lựa chọn.");
    const targetId = b.dataset.target;
    const action = me && me.actionType;
    b.disabled = true;
    if (action === "vote") socket.emit("vote", { targetId });
    else if (action === "hunterShot") socket.emit("hunterShot", { targetId });
    else if (action === "knightChallenge") socket.emit("knightChallenge", { targetId });
    else if (action === "scapegoatChoice") socket.emit("scapegoatChoice", { targetId });
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
