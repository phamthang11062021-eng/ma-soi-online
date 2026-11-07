const socket = io();
const $ = (id) => document.getElementById(id);
let state = null, selected = null, myToken = "", myCode = "", toastTimer = null, soundOn = false;
const showToast = (msg) => { $("toast").textContent = msg; $("toast").classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2600); };
const saved = (()=>{try{return JSON.parse(sessionStorage.getItem("werewolf-session")||"{}")}catch{return {}}})();
function enterRoom(code, token){myCode=code;myToken=token;sessionStorage.setItem("werewolf-session",JSON.stringify({code,token,name:$("homeName").value.trim()}));$("home").classList.add("hidden");$("game").classList.remove("hidden");$("roomCodeLabel").textContent=code;}
$("createBtn").onclick=()=>{const name=$("homeName").value.trim();if(!name)return showToast("Nhập tên của bạn trước nhé.");socket.emit("createRoom",{name});};
$("joinBtn").onclick=()=>{const name=$("homeName").value.trim(),code=$("roomCode").value.trim().toUpperCase();if(!name||!code)return showToast("Nhập tên và mã phòng nhé.");socket.emit("joinRoom",{name,code});};
$("copyBtn").onclick=async()=>{try{await navigator.clipboard.writeText(myCode);showToast("Đã sao chép mã phòng "+myCode);}catch{showToast("Mã phòng: "+myCode);}};
$("readyBtn").onclick=()=>socket.emit("ready");
$("startBtn").onclick=()=>socket.emit("startGame");
$("leaveBtn").onclick=()=>{socket.emit("leaveRoom");sessionStorage.removeItem("werewolf-session");location.reload();};
$("soundBtn").onclick=()=>{soundOn=!soundOn;$("soundBtn").textContent=soundOn?"♫":"♪";showToast(soundOn?"Đã bật biểu tượng âm thanh":"Đã tắt âm thanh");};
$("chatForm").onsubmit=(e)=>{e.preventDefault();const message=$("chatInput").value.trim();if(message){socket.emit("chat",{message});$("chatInput").value="";}};
socket.on("joined",({code,token})=>enterRoom(code,token));
socket.on("errorMessage",showToast);
socket.on("connect",()=>{if(saved.code&&saved.token){$("homeName").value=saved.name||"";socket.emit("joinRoom",{code:saved.code,token:saved.token,name:saved.name||""});}});
socket.on("state",render);
function render(s){
 state=s;selected=null;
 $("roomCodeLabel").textContent=s.code;$("countLabel").textContent=s.playerCount+"/16";
 $("notice").textContent=s.announcement||"";
 $("phaseLabel").textContent=s.phase==="lobby"?"SẢNH CHỜ":s.phase==="night"?"ĐÊM "+s.day:s.phase==="discussion"?"THẢO LUẬN · NGÀY "+s.day:s.phase==="vote"?"BỎ PHIẾU · NGÀY "+s.day:"KẾT THÚC";
 $("players").innerHTML=s.players.map((p,i)=>'<div class="player '+(!p.alive?'dead':'')+'"><div class="avatar">'+(i+1)+'</div><span>'+esc(p.name)+'</span><span class="status">'+(p.alive?(p.ready?'Sẵn sàng':'Còn sống'):'Đã bị loại')+(p.connected?'':' · Mất kết nối')+'</span>'+(s.isRevealed?'<span>'+esc(p.role||'')+'</span>':'')+'</div>').join("");
 const me=s.self;
 $("selfStatus").textContent=me?("Bạn: "+me.name+(me.alive?" · Còn sống":" · Đã bị loại")):"";
 $("roleCard").classList.toggle("hidden",!me||!me.role);
 if(me&&me.role){$("roleName").textContent=me.roleName;$("roleDesc").textContent=me.roleDescription;$("privateInfo").textContent=[me.privateInfo,me.privateNote,me.wolfMates&&me.wolfMates.length?"Đồng đội: "+me.wolfMates.join(", "):""].filter(Boolean).join(" · ");}
 $("lobbyControls").classList.toggle("hidden",s.status!=="lobby");
 $("readyBtn").textContent=me&&me.ready?"Hủy sẵn sàng":"Tôi đã sẵn sàng";
 $("startBtn").disabled=!s.canStart;$("startBtn").style.opacity=s.canStart?"1":".45";
 $("chatArea").classList.toggle("hidden",s.phase!=="discussion"||!me||!me.alive);
 $("chatMessages").innerHTML=(s.chat||[]).map(m=>'<div class="chat-msg"><b>'+esc(m.name)+'</b>'+esc(m.message)+'</div>').join("");$("chatMessages").scrollTop=$("chatMessages").scrollHeight;
 $("timer").textContent=s.endsAt?formatTime(Math.max(0,Math.ceil((s.endsAt-Date.now())/1000))):"—";
 renderAction(s);
 if(s.phase==="ended"){$("actionTitle").textContent="Ván chơi kết thúc";$("timer").textContent=s.winner==="town"?"PHE DÂN THẮNG":"PHE SÓI THẮNG";}
}
function renderAction(s){
 const me=s.self;let html="";
 if(s.phase==="lobby"){html='<div class="empty-state">Chờ đủ người chơi và cùng sẵn sàng.<br><small>Chia sẻ mã phòng '+s.code+' cho bạn bè.</small></div>';}
 else if(s.phase==="discussion"){html='<div class="action-prompt">Hãy thảo luận để tìm ra Ma sói. Khi đã sẵn sàng, bấm nút bên dưới để chuyển sang bỏ phiếu.</div><button class="primary wide" id="readyVoteBtn">Tôi đã sẵn sàng bỏ phiếu ('+s.voteReadyCount+')</button>'; }
 else if(s.phase==="ended"){html='<div class="empty-state">'+esc(s.announcement)+'<br><small>Vai trò của tất cả người chơi đã được công khai.</small></div>';}
 else if(me&&me.actionType&&me.alive){
  html='<div class="action-prompt">'+esc(me.prompt||"")+'</div>';
  if(me.actionType==="witch"){
    html+='<div class="action-buttons">';
    if(me.witchSaveAvailable)html+='<button class="primary" id="saveBtn">Dùng bình cứu</button>';
    if(me.witchPoisonAvailable)html+='<button class="secondary" id="skipBtn">Không dùng bình độc</button>';
    html+='</div>';
    if(me.witchPoisonAvailable)html+='<div class="target-grid" style="margin-top:10px">'+me.targets.map(t=>'<button class="target" data-target="'+t.id+'">Độc · '+esc(t.name)+'</button>').join("")+'</div>';
  } else {
    html+='<div class="target-grid">'+me.targets.map(t=>'<button class="target" data-target="'+t.id+'">'+esc(t.name)+'</button>').join("")+'</div>';
  }
  if(me.actionDone)html+='<p class="hint">Đã ghi nhận lựa chọn của bạn. Chờ những người khác...</p>';
 } else if(me&&!me.alive){html='<div class="empty-state">Bạn đã bị loại khỏi ván chơi.<br><small>Bạn có thể theo dõi diễn biến nhưng không thể bỏ phiếu hay hành động.</small></div>';}
 else {html='<div class="empty-state">Đang chờ lượt chơi...</div>';}
 $("actionTitle").textContent=s.phase==="night"?"Hành động bí mật":s.phase==="vote"?"Bỏ phiếu kín":s.phase==="discussion"?"Thảo luận":"Diễn biến";
 $("actionArea").innerHTML=html;
 $("actionArea").querySelectorAll("[data-target]").forEach(b=>b.onclick=()=>{if(me.actionDone)return showToast("Bạn đã gửi lựa chọn.");$("actionArea").querySelectorAll("[data-target]").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selected=b.dataset.target;const action=me.actionType;if(action==="vote")socket.emit("vote",{targetId:selected});else if(action==="witch")socket.emit("nightAction",{action:"poison",targetId:selected});else socket.emit("nightAction",{targetId:selected});});
 const save=$("saveBtn");if(save)save.onclick=()=>socket.emit("nightAction",{action:"save"});
 const skip=$("skipBtn");if(skip)skip.onclick=()=>socket.emit("nightAction",{action:"skip"});
 const ready=$("readyVoteBtn");if(ready)ready.onclick=()=>socket.emit("readyVote");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function formatTime(n){return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
setInterval(()=>{if(state&&state.endsAt)$("timer").textContent=formatTime(Math.max(0,Math.ceil((state.endsAt-Date.now())/1000)));},500);
