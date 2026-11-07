const socket=io();
const $=id=>document.getElementById(id);
let state=null,roomCode="",token="",pendingWildCard=null,toastTimer=null;
const saved=(()=>{try{return JSON.parse(sessionStorage.getItem("gc-uno-session")||"{}")}catch{return {}}})();
const colors={red:"ĐỎ",yellow:"VÀNG",green:"XANH LÁ",blue:"XANH DƯƠNG"};
function toast(message){$("unoToast").textContent=message;$("unoToast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("unoToast").classList.remove("show"),2500)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function enterRoom(code,newToken){roomCode=code;token=newToken;sessionStorage.setItem("gc-uno-session",JSON.stringify({code,token,name:$("unoName").value.trim()}));$("unoHome").classList.add("hidden");$("unoRoom").classList.remove("hidden");$("unoRoomCode").textContent=code}
$("unoCreate").onclick=()=>{const name=$("unoName").value.trim();if(!name)return toast("Nhập tên của bạn trước nhé.");socket.emit("gc:createRoom",{gameType:"uno",name})};
$("unoJoin").onclick=()=>{const name=$("unoName").value.trim(),code=$("unoCode").value.trim().toUpperCase();if(!name||!code)return toast("Nhập tên và mã phòng nhé.");socket.emit("gc:joinRoom",{name,code,gameType:"uno"})};
$("copyUnoCode").onclick=async()=>{try{await navigator.clipboard.writeText(roomCode);toast("Đã sao chép mã phòng "+roomCode)}catch{toast("Mã phòng: "+roomCode)}};
$("unoReady").onclick=()=>socket.emit("gc:ready");
$("unoStart").onclick=()=>socket.emit("gc:host:start");
$("unoSaveSettings").onclick=()=>socket.emit("gc:host:settings",{turnSeconds:Number($("unoTurnSeconds").value),allowPlayDrawnCard:$("unoAllowDraw").checked,unoPenalty:$("unoPenalty").checked});
$("unoLeave").onclick=()=>{socket.emit("gc:leaveRoom");sessionStorage.removeItem("gc-uno-session");location.href="/"};
$("unoChatForm").onsubmit=e=>{e.preventDefault();const message=$("unoChatInput").value.trim();if(message){socket.emit("gc:chat",{message});$("unoChatInput").value=""}};
$("unoReplay").onclick=()=>socket.emit("gc:restart");
socket.on("connect",()=>{if(saved.code&&saved.token){$("unoName").value=saved.name||"";socket.emit("gc:joinRoom",{code:saved.code,token:saved.token,name:saved.name||"",gameType:"uno"})}});
socket.on("gc:joined",data=>enterRoom(data.code,data.token));
socket.on("gc:error",toast);
socket.on("gc:kicked",data=>{sessionStorage.removeItem("gc-uno-session");$("unoRoom").classList.add("hidden");$("unoHome").classList.remove("hidden");toast(data.message||"Bạn đã bị mời khỏi phòng.")});
socket.on("gc:state",render);
function render(s){state=s;enterRoom(s.code,token||saved.token||"");$("unoNotice").textContent=s.announcement||"";$("unoPlayerCount").textContent=s.playerCount+"/10";$("unoSelfStatus").textContent="Bạn: "+s.self.name+(s.isHost?" · Chủ phòng":"");$("unoRoomCode").textContent=s.code;
$("unoLobby").classList.toggle("hidden",s.status!=="lobby");$("unoGame").classList.toggle("hidden",s.status==="lobby");$("unoResult").classList.toggle("hidden",s.status!=="ended");$("unoReplay").classList.toggle("hidden",!s.isHost);
$("roomStatus").textContent=s.status==="lobby"?"SẢNH CHỜ":s.status==="ended"?"KẾT THÚC VÁN":"ĐANG CHƠI";
$("unoLobbyPlayers").innerHTML=s.players.map((p,i)=>'<div class="lobby-player '+(p.isHost?"host":"")+'"><div class="player-avatar">'+(i+1)+'</div><strong>'+esc(p.name)+'</strong><small>'+(p.isHost?"CHỦ PHÒNG · ":"")+(p.ready?"✓ SẴN SÀNG":"ĐANG CHỜ")+(p.connected?"":" · MẤT KẾT NỐI")+'</small>'+(s.isHost&&!p.isHost?'<div class="mini-actions"><button data-kick="'+p.id+'">Kick</button><button data-host="'+p.id+'">Chuyển chủ</button></div>':"")+'</div>').join("");
$("unoLobbyPlayers").querySelectorAll("[data-kick]").forEach(b=>b.onclick=()=>{if(confirm("Mời người chơi này ra khỏi phòng?"))socket.emit("gc:host:kick",{targetId:b.dataset.kick})});
$("unoLobbyPlayers").querySelectorAll("[data-host]").forEach(b=>b.onclick=()=>{if(confirm("Chuyển quyền chủ phòng?"))socket.emit("gc:host:transfer",{targetId:b.dataset.host})});
$("unoReady").textContent=s.self.ready?"HỦY SẴN SÀNG":"TÔI ĐÃ SẴN SÀNG";$("unoStart").classList.toggle("hidden",!s.isHost);$("unoStart").disabled=s.playerCount<2||!s.players.every(p=>p.ready&&p.connected);$("unoHostSettings").classList.toggle("hidden",!s.isHost);
if(s.isHost){$("unoTurnSeconds").value=String(s.settings.turnSeconds);$("unoAllowDraw").checked=s.settings.allowPlayDrawnCard;$("unoPenalty").checked=s.settings.unoPenalty}
$("unoChatMessages").innerHTML=s.chat.map(m=>'<div class="chat-msg"><b>'+esc(m.name)+'</b>'+esc(m.message)+'</div>').join("");$("unoChatMessages").scrollTop=$("unoChatMessages").scrollHeight;
if(s.game)renderGame(s);
if(s.status==="ended"){const winner=s.players.find(p=>p.id===s.game.winnerId);$("unoWinner").textContent=winner?winner.name+" CHIẾN THẮNG!":"VÁN ĐẤU KẾT THÚC";$("unoResultText").textContent="Chúc mừng người chiến thắng. Chủ phòng có thể mở ván mới."}
}
function renderGame(s){const g=s.game,me=g.players.find(p=>p.id===s.self.id),myTurn=g.currentPlayerId===s.self.id;const current=s.players.find(p=>p.id===g.currentPlayerId);$("unoTurnName").textContent=current?current.name:"Đang chờ";$("unoTimer").textContent=s.endsAt?Math.max(0,Math.ceil((s.endsAt-Date.now())/1000))+"s":"—";
$("unoOpponents").innerHTML=g.players.filter(p=>p.id!==s.self.id).map(p=>'<div class="opponent '+(p.isCurrent?"current":"")+'"><strong>'+esc(p.name)+'</strong><small>'+p.cardCount+' lá bài'+(p.isCurrent?" · ĐẾN LƯỢT":"")+'</small></div>').join("");
const top=g.topCard;const label=top.type==="number"?top.value:({skip:"⊘",reverse:"↻",draw2:"+2",wild:"★",wild4:"+4"})[top.type];const colorClass=top.color||"wild";$("unoTopCard").className="playing-card "+colorClass;$("unoTopCard").innerHTML='<span class="card-corner">'+esc(label)+'</span><b>'+esc(label)+'</b><span class="card-corner bottom">'+esc(label)+'</span>';
$("unoDrawCount").textContent=g.drawCount+" LÁ";$("unoColorDot").style.background="var(--"+(g.activeColor==="red"?"red":g.activeColor==="yellow"?"yellow":g.activeColor==="green"?"green":"blue")+")";$("unoColorName").textContent=colors[g.activeColor];$("unoDirection").textContent=g.direction===1?"↻":"↺";
$("unoTurnMessage").textContent=myTurn?(g.drawnCardId?"Bạn đã rút bài. Đánh lá vừa rút hoặc bỏ lượt.":"Đến lượt bạn – hãy chọn một lá bài hợp lệ."):(current? "Đang chờ "+current.name+" đánh bài.":"");
$("unoHandCount").textContent=(me?.hand?.length||0)+" lá";
$("unoHand").innerHTML=(me?.hand||[]).map(card=>{const playable=myTurn&&(!g.drawnCardId||g.drawnCardId===card.id)&&canPlay(g,me,card);const txt=card.type==="number"?card.value:({skip:"⊘",reverse:"↻",draw2:"+2",wild:"★",wild4:"+4"})[card.type];return '<button class="uno-card '+(card.color||"wild")+'" data-card="'+card.id+'" '+(!playable?"disabled":"")+'><small>'+esc(txt)+'</small>'+esc(txt)+'<small class="bottom">'+esc(txt)+'</small></button>'}).join("");
$("unoHand").querySelectorAll("[data-card]").forEach(b=>b.onclick=()=>play(b.dataset.card));
const actions=[];if(myTurn&&!g.drawnCardId)actions.push('<button id="unoDrawButton" class="secondary">RÚT 1 LÁ</button>');if(myTurn&&g.drawnCardId)actions.push('<button id="unoPassButton" class="secondary">BỎ LƯỢT</button>');if(g.unoPendingId===s.self.id)actions.push('<button id="unoCallButton" class="primary">UNO!</button>');if(g.unoPendingId&&g.unoPendingId!==s.self.id)actions.push('<button id="unoCatchButton" class="primary">BẮT LỖI UNO</button>');$("unoActionBar").innerHTML=actions.join("");
const draw=$("unoDrawButton");if(draw)draw.onclick=()=>socket.emit("gc:uno:draw");const pass=$("unoPassButton");if(pass)pass.onclick=()=>socket.emit("gc:uno:pass");const call=$("unoCallButton");if(call)call.onclick=()=>socket.emit("gc:uno:call");const catchBtn=$("unoCatchButton");if(catchBtn)catchBtn.onclick=()=>socket.emit("gc:uno:catch");
}
function canPlay(g,me,card){if(card.type==="wild")return true;if(card.type==="wild4")return !(me.hand||[]).some(c=>c.id!==card.id&&c.color===g.activeColor&&c.type!=="wild"&&c.type!=="wild4");return card.color===g.activeColor||(g.topCard.type==="number"&&card.type==="number"&&card.value===g.topCard.value)||(card.type!=="number"&&card.type===g.topCard.type)}
function play(cardId){const me=state?.game?.players.find(p=>p.id===state.self.id);const card=me?.hand?.find(c=>c.id===cardId);if(!card)return;if(card.type==="wild"||card.type==="wild4"){pendingWildCard=cardId;$("unoColorModal").classList.remove("hidden")}else socket.emit("gc:uno:play",{cardId})}
$("unoColorModal").querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{if(pendingWildCard)socket.emit("gc:uno:play",{cardId:pendingWildCard,chosenColor:b.dataset.color});pendingWildCard=null;$("unoColorModal").classList.add("hidden")});
$("unoColorModal").onclick=e=>{if(e.target.id==="unoColorModal"){$("unoColorModal").classList.add("hidden");pendingWildCard=null}};
setInterval(()=>{if(state?.endsAt)$("unoTimer").textContent=Math.max(0,Math.ceil((state.endsAt-Date.now())/1000))+"s"},300);
