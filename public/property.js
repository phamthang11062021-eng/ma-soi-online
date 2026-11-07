const socket=io();
const $=id=>document.getElementById(id);
let state=null,roomCode="",token="",toastTimer=null;
const saved=(()=>{try{return JSON.parse(sessionStorage.getItem("gc-property-session")||"{}")}catch{return {}}})();
const palette=["#efc875","#8bc9df","#d994b8","#eaa05b","#d76a67","#e6ce64","#65b88b","#7189ca","#c5a0dc","#a9b6c1"];
function toast(s){$("mpToast").textContent=s;$("mpToast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("mpToast").classList.remove("show"),2500)}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function enter(code,tok){roomCode=code;token=tok||token;sessionStorage.setItem("gc-property-session",JSON.stringify({code,token,name:$("mpName").value.trim()||saved.name||""}));$("mpHome").classList.add("hidden");$("mpRoom").classList.remove("hidden");$("mpRoomCode").textContent=code}
$("mpCreate").onclick=()=>{const name=$("mpName").value.trim();if(!name)return toast("Nhập tên của bạn trước nhé.");socket.emit("gc:createRoom",{gameType:"property",name})};
$("mpJoin").onclick=()=>{const name=$("mpName").value.trim(),code=$("mpCode").value.trim().toUpperCase();if(!name||!code)return toast("Nhập tên và mã phòng nhé.");socket.emit("gc:joinRoom",{name,code})};
$("mpCopy").onclick=async()=>{try{await navigator.clipboard.writeText(roomCode);toast("Đã sao chép mã "+roomCode)}catch{toast("Mã phòng: "+roomCode)}};
$("mpReady").onclick=()=>socket.emit("gc:ready");
$("mpStart").onclick=()=>socket.emit("gc:host:start");
$("mpSaveSettings").onclick=()=>socket.emit("gc:host:settings",{mode:$("mpMode").value,turnLimit:Number($("mpLimit").value)});
$("mpReplay").onclick=()=>socket.emit("gc:restart");
$("mpLeave").onclick=()=>{socket.emit("gc:leaveRoom");sessionStorage.removeItem("gc-property-session");location.href="/"};
$("mpChatForm").onsubmit=e=>{e.preventDefault();const message=$("mpChatInput").value.trim();if(message){socket.emit("gc:chat",{message});$("mpChatInput").value=""}};
socket.on("connect",()=>{if(saved.code&&saved.token){$("mpName").value=saved.name||"";socket.emit("gc:joinRoom",{code:saved.code,token:saved.token,name:saved.name||""})}});
socket.on("gc:joined",d=>enter(d.code,d.token));
socket.on("gc:error",toast);
socket.on("gc:kicked",d=>{sessionStorage.removeItem("gc-property-session");$("mpRoom").classList.add("hidden");$("mpHome").classList.remove("hidden");toast(d.message||"Bạn đã bị mời khỏi phòng.")});
socket.on("gc:state",render);
function render(s){
 state=s;enter(s.code,token||saved.token||"");$("mpNotice").textContent=s.announcement||"";$("mpCount").textContent=s.playerCount+"/10";$("mpRoomCode").textContent=s.code;$("mpSelf").textContent="Bạn: "+s.self.name+(s.isHost?" · Chủ phòng":"");
 $("mpStatus").textContent=s.status==="lobby"?"SẢNH CHỜ":s.status==="ended"?"KẾT THÚC VÁN":"ĐANG CHƠI";
 $("mpLobby").classList.toggle("hidden",s.status!=="lobby");$("mpGame").classList.toggle("hidden",s.status==="lobby");$("mpResult").classList.toggle("hidden",s.status!=="ended");$("mpReplay").classList.toggle("hidden",!s.isHost);
 $("mpLobbyPlayers").innerHTML=s.players.map((p,i)=>'<div class="mp-lobby-player '+(p.isHost?"host":"")+'"><div class="mp-avatar">'+(i+1)+'</div><strong>'+esc(p.name)+'</strong><small>'+(p.isHost?"CHỦ PHÒNG · ":"")+(p.ready?"✓ SẴN SÀNG":"ĐANG CHỜ")+(p.connected?"":" · MẤT KẾT NỐI")+'</small>'+(s.isHost&&!p.isHost?'<div class="mp-mini-actions"><button data-kick="'+p.id+'">Kick</button><button data-transfer="'+p.id+'">Chuyển chủ</button></div>':"")+'</div>').join("");
 $("mpLobbyPlayers").querySelectorAll("[data-kick]").forEach(b=>b.onclick=()=>{if(confirm("Mời người chơi này ra khỏi phòng?"))socket.emit("gc:host:kick",{targetId:b.dataset.kick})});
 $("mpLobbyPlayers").querySelectorAll("[data-transfer]").forEach(b=>b.onclick=()=>{if(confirm("Chuyển quyền chủ phòng?"))socket.emit("gc:host:transfer",{targetId:b.dataset.transfer})});
 $("mpReady").textContent=s.self.ready?"HỦY SẴN SÀNG":"TÔI ĐÃ SẴN SÀNG";$("mpStart").classList.toggle("hidden",!s.isHost);$("mpStart").disabled=s.playerCount<2||!s.players.every(p=>p.ready&&p.connected);$("mpSettings").classList.toggle("hidden",!s.isHost);
 if(s.isHost){$("mpMode").value=s.settings.mode||"classic";$("mpLimit").value=String(s.settings.turnLimit||60)}
 $("mpChat").innerHTML=s.chat.map(m=>'<div class="mp-chat-msg"><b>'+esc(m.name)+'</b>'+esc(m.message)+'</div>').join("");$("mpChat").scrollTop=$("mpChat").scrollHeight;
 if(s.game){renderGame(s)}
 if(s.status==="ended"){const winner=s.players.find(p=>p.id===s.game?.winnerId);$("mpWinner").textContent=winner?winner.name+" CHIẾN THẮNG!":"VÁN ĐẤU KẾT THÚC";const score=s.game?.players?.find(p=>p.id===s.game.winnerId);$("mpResultText").textContent="Kết thúc ván. "+(score?"Số dư cuối cùng: "+money(score.money)+" xu.":"Chủ phòng có thể mở ván mới.")}
}
function money(n){return new Intl.NumberFormat("vi-VN").format(n||0)}
function tileGrid(id){if(id===0)return [11,11];if(id<10)return [11,11-id];if(id===10)return [11,1];if(id<20)return [21-id,1];if(id===20)return [1,1];if(id<30)return [1,id-19];if(id===30)return [1,11];return [id-29,11]}
function iconFor(type){return ({start:"➜",property:"◆",community:"✉",chance:"?",tax:"$",transport:"🚉",utility:"⚡",jail:"▥",free:"✦",goToJail:"!"})[type]||"◆"}
function renderBoard(g){
 const players=g.players,colors=Object.fromEntries(players.map((p,i)=>[p.id,palette[i%palette.length]]));
 $("mpBoard").innerHTML=g.board.map(space=>{
  const [row,col]=tileGrid(space.id),occupants=players.filter(p=>!p.bankrupt&&p.position===space.id);
  const owner=players.find(p=>p.id===space.ownerId),corner=[0,10,20,30].includes(space.id);
  const label=space.type==="property"||space.type==="transport"||space.type==="utility"?money(space.price)+" xu":"";
  return '<div class="mp-tile '+(corner?"corner ":"")+(owner?"owned ":"")+(space.mortgaged?"mortgaged ":"")+(space.id===players.find(p=>p.id===g.currentPlayerId)?.position?"active-tile":"")+'" style="grid-row:'+row+';grid-column:'+col+'">'+(space.group?'<span class="mp-tile-band" style="background:'+space.groupColor+'"></span>':'')+'<span class="mp-tile-icon">'+iconFor(space.type)+'</span><span class="mp-tile-name">'+esc(space.name)+'</span><span class="mp-tile-price">'+label+'</span><div class="mp-tokens">'+occupants.map(p=>'<span class="mp-token" title="'+esc(p.name)+'" style="background:'+colors[p.id]+'">'+esc(p.name.slice(0,1).toUpperCase())+'</span>').join("")+'</div>'+(space.houses>0?'<span class="mp-tile-price">⌂ '+space.houses+'</span>':"")+(owner?'<span class="mp-tile-price">● '+esc(owner.name.slice(0,7))+'</span>':"")+'</div>'
 }).join("");
}
function renderGame(s){
 const g=s.game,me=g.players.find(p=>p.id===s.self.id),current=g.players.find(p=>p.id===g.currentPlayerId),myTurn=current?.id===s.self.id;
 $("mpTimer").textContent=s.endsAt?formatTime(Math.max(0,Math.ceil((s.endsAt-Date.now())/1000))):"—";
 $("mpPlayerCount").textContent=g.players.length+" NGƯỜI";$("mpCenterTurn").textContent=current?"Lượt của "+current.name:"Đã kết thúc";
 $("mpDice").textContent=g.lastDice?"🎲 "+g.lastDice[0]+"  ·  🎲 "+g.lastDice[1]:"🎲 🎲";
 renderBoard(g);
 $("mpPlayers").innerHTML=g.players.map((p,i)=>'<div class="mp-player '+(p.id===g.currentPlayerId?"current ":"")+(p.bankrupt?"bankrupt":"")+'"><span class="mp-player-color" style="background:'+palette[i%palette.length]+'">'+(i+1)+'</span><span><strong>'+esc(p.name)+(p.inJail?" · TÙ":"")+'</strong><small>'+p.properties.length+' tài sản · '+(p.bankrupt?"PHÁ SẢN":p.position===0?"Xuất phát":esc(g.board[p.position].name))+'</small></span><b class="mp-player-money">'+money(p.money)+' xu</b></div>').join("");
 renderRollArea(g,me,myTurn);renderActions(g,me,myTurn);renderTrade(g,me);
 $("mpLog").innerHTML=g.log.slice().reverse().map(item=>'<div class="mp-log-entry">'+esc(item.message)+'</div>').join("");
}
function formatTime(s){const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h?String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0"):String(m).padStart(2,"0")+":"+String(sec).padStart(2,"0")}
function renderRollArea(g,me,myTurn){
 const area=$("mpRollArea");
 if(myTurn&&g.awaitingRoll&&!g.pending&&!g.auction&&!g.debt&&!me.bankrupt){area.innerHTML='<button id="mpRoll" class="mp-primary">TUNG XÚC XẮC</button>'; $("mpRoll").onclick=()=>socket.emit("gc:property:roll")}
 else area.innerHTML="";
}
function renderActions(g,me,myTurn){
 const box=$("mpActions");let html="";
 if(g.debt&&g.debt.debtorId===me.id){
  html+='<div class="mp-action-note">Bạn đang nợ '+money(g.debt.amount)+' xu. Hãy thế chấp tài sản để trả nợ hoặc tuyên bố phá sản.</div><button id="mpBankrupt" class="mp-secondary">TUYÊN BỐ PHÁ SẢN</button>';
  html+='<div class="mp-assets">'+ownedAssets(g,me,true)+'</div>';
 }else if(g.auction){
  const passed=g.auction.passed.includes(me.id),high=g.auction.highBidderId===me.id;
  html+='<div class="mp-action-note">Đấu giá '+esc(g.board[g.auction.spaceId].name)+'. Giá hiện tại: <b>'+money(g.auction.currentBid)+' xu</b>. '+(g.auction.highBidderId?"Người dẫn giá: "+esc(g.players.find(p=>p.id===g.auction.highBidderId)?.name||""):"Chưa có giá").+'</div>';
  if(!passed&&!high)html+='<div class="mp-action-row"><input id="mpBid" class="mp-bid-input" type="number" min="'+(g.auction.currentBid+1)+'" max="'+me.money+'" placeholder="Giá trả"><button id="mpBidButton" class="mp-primary">TRẢ GIÁ</button></div><button id="mpPassBid" class="mp-secondary">BỎ LƯỢT ĐẤU GIÁ</button>';
  else html+='<p>'+(high?"Bạn đang dẫn giá. Chờ người khác phản hồi.":"Bạn đã bỏ lượt đấu giá.")+'</p>';
 }else if(g.pending?.type==="purchase"){
  if(g.pending.playerId===me.id)html+='<div class="mp-action-note">Bạn vừa đến '+esc(g.pending.space.name)+'. Giá mua: <b>'+money(g.pending.space.price)+' xu</b>.</div><div class="mp-action-row"><button id="mpBuy" class="mp-primary">MUA ĐẤT</button><button id="mpDecline" class="mp-secondary">ĐẤU GIÁ</button></div>';
  else html+='<p>Đang chờ '+esc(g.players.find(p=>p.id===g.pending.playerId)?.name||"người chơi")+' quyết định mua tài sản.</p>';
 }else if(myTurn&&!me.bankrupt){
  if(me.inJail)html+='<div class="mp-action-note">Bạn đang ở tù. Có thể tung đôi để ra tù hoặc trả 50 xu.</div><button id="mpPayJail" class="mp-secondary">TRẢ 50 XU ĐỂ RA TÙ</button>';
  if(g.awaitingRoll)html+='<p>Đến lượt bạn. Nhấn nút tung xúc xắc ở giữa bàn cờ.</p>';
  else html+='<p>Đang xử lý lượt chơi...</p>';
 }else html+='<p>'+(me.bankrupt?"Bạn đã phá sản.":current?"Đang chờ "+esc(current.name)+" thực hiện lượt chơi.":"Ván đã kết thúc.")+'</p>';
 if(g.trade){
  const from=g.players.find(p=>p.id===g.trade.fromId),to=g.players.find(p=>p.id===g.trade.toId);
  html+='<div class="mp-action-note">Đang có đề nghị giao dịch từ '+esc(from?.name||"")+' tới '+esc(to?.name||"")+'.</div>';
  if(g.trade.toId===me.id)html+='<div class="mp-action-row"><button id="mpTradeAccept" class="mp-primary">CHẤP NHẬN</button><button id="mpTradeReject" class="mp-secondary">TỪ CHỐI</button></div>';
 }
 html+='<div class="mp-assets"><b class="mp-eyebrow">TÀI SẢN CỦA BẠN</b>'+ownedAssets(g,me,false)+'</div>';
 box.innerHTML=html;
 const bind=(id,fn)=>{const el=$(id);if(el)el.onclick=fn};
 bind("mpBuy",()=>socket.emit("gc:property:buy"));bind("mpDecline",()=>socket.emit("gc:property:decline"));
 bind("mpPassBid",()=>socket.emit("gc:property:passBid"));bind("mpBidButton",()=>socket.emit("gc:property:bid",{amount:Number($("mpBid").value)}));
 bind("mpBankrupt",()=>{if(confirm("Bạn chắc chắn muốn tuyên bố phá sản?"))socket.emit("gc:property:bankrupt")});
 bind("mpPayJail",()=>socket.emit("gc:property:payJail"));
 bind("mpTradeAccept",()=>socket.emit("gc:property:trade:respond",{accept:true}));bind("mpTradeReject",()=>socket.emit("gc:property:trade:respond",{accept:false}));
 box.querySelectorAll("[data-build]").forEach(b=>b.onclick=()=>socket.emit("gc:property:build",{spaceId:Number(b.dataset.build)}));
 box.querySelectorAll("[data-mortgage]").forEach(b=>b.onclick=()=>socket.emit("gc:property:mortgage",{spaceId:Number(b.dataset.mortgage)}));
 box.querySelectorAll("[data-unmortgage]").forEach(b=>b.onclick=()=>socket.emit("gc:property:unmortgage",{spaceId:Number(b.dataset.unmortgage)}));
}
function ownedAssets(g,me,debtMode){
 if(!me.properties.length)return '<p>Bạn chưa sở hữu tài sản nào.</p>';
 return me.properties.map(id=>{
  const sp=g.board[id],info=sp;
  let controls="";
  if(info.houses>0)controls+='<small>⌂ '+info.houses+'</small>';
  if(!info.mortgaged&&info.type==="property")controls+='<button data-build="'+id+'">+ Nhà</button>';
  if(info.mortgaged)controls+='<button data-unmortgage="'+id+'">Chuộc</button>';
  else if(info.houses===0)controls+='<button data-mortgage="'+id+'">Thế chấp</button>';
  return '<div class="mp-asset"><span>'+esc(sp.name)+'</span><span>'+controls+'</span></div>'
 }).join("");
}
function renderTrade(g,me){
 const box=$("mpTradeArea");
 if(g.trade){const from=g.players.find(p=>p.id===g.trade.fromId),to=g.players.find(p=>p.id===g.trade.toId);box.innerHTML='<div class="mp-trade-pending">'+esc(from?.name||"")+' gửi đề nghị tới '+esc(to?.name||"")+'.<br>Tiền: '+money(g.trade.giveMoney)+' xu ↔ '+money(g.trade.takeMoney)+' xu<br>Tài sản trao đổi: '+g.trade.giveIds.map(id=>esc(g.board[id].name)).join(", ")+' ↔ '+g.trade.takeIds.map(id=>esc(g.board[id].name)).join(", ")+'</div>';return}
 const targets=g.players.filter(p=>p.id!==me.id&&!p.bankrupt);
 if(!targets.length){box.innerHTML='<p class="mp-action-note">Cần thêm người chơi để giao dịch.</p>';return}
 const myProps=me.properties.map(id=>'<option value="'+id+'">'+esc(g.board[id].name)+'</option>').join("");
 const otherProps=g.board.filter(s=>{const owner=g.players.find(p=>p.id===s.ownerId);return owner&&owner.id!==me.id}).map(s=>'<option value="'+s.id+'">'+esc(s.name)+' ('+esc(g.players.find(p=>p.id===s.ownerId)?.name||"") +')</option>').join("");
 box.innerHTML='<form id="mpTradeForm" class="mp-trade-form"><label>Gửi đề nghị cho<select id="mpTradeTarget">'+targets.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join("")+'</select></label><div class="mp-action-row"><label>Tiền bạn đưa<input id="mpGiveMoney" type="number" min="0" value="0"></label><label>Tiền bạn nhận<input id="mpTakeMoney" type="number" min="0" value="0"></label></div><div class="mp-action-row"><label>Đất bạn đưa<select id="mpGiveProperty"><option value="">Không</option>'+myProps+'</select></label><label>Đất bạn nhận<select id="mpTakeProperty"><option value="">Không</option>'+otherProps+'</select></label></div><button class="mp-primary">GỬI ĐỀ NGHỊ</button></form>';
 $("mpTradeForm").onsubmit=e=>{e.preventDefault();const give=$("mpGiveProperty").value,take=$("mpTakeProperty").value;socket.emit("gc:property:trade:offer",{toId:$("mpTradeTarget").value,giveMoney:Number($("mpGiveMoney").value),takeMoney:Number($("mpTakeMoney").value),givePropertyIds:give?[Number(give)]:[],takePropertyIds:take?[Number(take)]:[]})}
}
setInterval(()=>{if(state?.endsAt)$("mpTimer").textContent=formatTime(Math.max(0,Math.ceil((state.endsAt-Date.now())/1000)))},500);
