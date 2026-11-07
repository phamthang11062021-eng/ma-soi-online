"use strict";

const crypto = require("node:crypto");

const GROUPS = {
  brown: { label:"Nâu", color:"#986447" }, sky:{label:"Xanh da trời",color:"#8ac9df"},
  pink:{label:"Hồng",color:"#d98bb6"}, orange:{label:"Cam",color:"#e99a4e"},
  red:{label:"Đỏ",color:"#d65a5a"}, yellow:{label:"Vàng",color:"#e6c653"},
  green:{label:"Xanh lá",color:"#55a77a"}, blue:{label:"Xanh đậm",color:"#526fb1"}
};
const raw = [
 ["start","XUẤT PHÁT"],["property","Bến Gỗ","brown",60,[2,10,30,90,160,250],50],
 ["community","QUỸ CỘNG ĐỒNG"],["property","Phố Đèn Lồng","brown",60,[4,20,60,180,320,450],50],
 ["tax","THUẾ THÀNH PHỐ",null,200],["transport","Ga Bình Minh",null,200],
 ["property","Đồi Mây","sky",100,[6,30,90,270,400,550],50],["chance","CƠ HỘI"],
 ["property","Hồ Ngọc","sky",100,[6,30,90,270,400,550],50],["property","Vườn Gió","sky",120,[8,40,100,300,450,600],50],
 ["jail","THĂM TÙ"],["property","Phố Hoa","pink",140,[10,50,150,450,625,750],100],
 ["utility","Nhà Máy Điện",null,150],["property","Phố Sách","pink",140,[10,50,150,450,625,750],100],
 ["property","Bến Trăng","pink",160,[12,60,180,500,700,900],100],["transport","Ga Sông Xanh",null,200],
 ["property","Chợ Đêm","orange",180,[14,70,200,550,750,950],100],["community","QUỸ CỘNG ĐỒNG"],
 ["property","Phố Ẩm Thực","orange",180,[14,70,200,550,750,950],100],["property","Quảng Trường","orange",200,[16,80,220,600,800,1000],100],
 ["free","NGHỈ CHÂN"],["property","Đại Lộ Đỏ","red",220,[18,90,250,700,875,1050],150],
 ["chance","CƠ HỘI"],["property","Cầu Ánh Sao","red",220,[18,90,250,700,875,1050],150],
 ["property","Tháp Bình Minh","red",240,[20,100,300,750,925,1100],150],["transport","Ga Cao Nguyên",null,200],
 ["property","Vịnh Ngọc","yellow",260,[22,110,330,800,975,1150],150],["property","Đảo Gió","yellow",260,[22,110,330,800,975,1150],150],
 ["utility","Trạm Nước",null,150],["property","Đồi Hải Đăng","yellow",280,[24,120,360,850,1025,1200],150],
 ["goToJail","VÀO TÙ"],["property","Rừng Ngọc","green",300,[26,130,390,900,1100,1275],200],
 ["property","Thung Lũng","green",300,[26,130,390,900,1100,1275],200],["community","QUỸ CỘNG ĐỒNG"],
 ["property","Thành Phố Xanh","green",320,[28,150,450,1000,1200,1400],200],["transport","Ga Mặt Trời",null,200],
 ["chance","CƠ HỘI"],["property","Đỉnh Mây","blue",350,[35,175,500,1100,1300,1500],200],
 ["tax","THUẾ ĐẶC BIỆT",null,100],["property","Vương Miện","blue",400,[50,200,600,1400,1700,2000],200]
];
const BOARD = raw.map((r,id)=>({
 id,type:r[0],name:r[1],group:r[2]||null,price:r[3]||0,
 rents:r[4]||null,houseCost:r[5]||0
}));
const CHANCE = [
 {text:"Nhận thưởng lễ hội +100",type:"collect",amount:100},
 {text:"Nộp phí sửa đường -80",type:"pay",amount:80},
 {text:"Tiến về Xuất phát",type:"move",position:0},
 {text:"Đi thẳng đến Ga Bình Minh",type:"move",position:5},
 {text:"Bạn được mời tham gia lễ hội. Nhận +50",type:"collect",amount:50},
 {text:"Di chuyển vào tù",type:"jail"}
];
const COMMUNITY = [
 {text:"Quỹ hoàn tiền. Nhận +100",type:"collect",amount:100},
 {text:"Phí y tế. Trả 50",type:"pay",amount:50},
 {text:"Nhận cổ tức. Nhận +75",type:"collect",amount:75},
 {text:"Tiền bảo trì. Trả 40",type:"pay",amount:40},
 {text:"Tiến về Xuất phát",type:"move",position:0},
 {text:"Bạn được miễn phí một lượt. Nhận +25",type:"collect",amount:25}
];

function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=crypto.randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function createGame(players,options={}){
 if(!Array.isArray(players)||players.length<2||players.length>10)throw new Error("Cờ Tỷ Phú cần từ 2 đến 10 người chơi.");
 if(new Set(players.map(p=>p.id)).size!==players.length||players.some(p=>!p.id||!p.name))throw new Error("Danh sách người chơi không hợp lệ.");
 return {
  status:"playing",players:players.map(p=>({id:p.id,name:p.name,money:1500,position:0,properties:[],inJail:false,jailTurns:0,bankrupt:false,consecutiveDoubles:0})),
  properties:{},turnIndex:0,awaitingRoll:true,pending:null,auction:null,debt:null,lastDice:null,
  chance:shuffle(CHANCE),community:shuffle(COMMUNITY),turnNumber:1,mode:options.mode==="quick"?"quick":"classic",
  turnLimit:Math.max(10,Math.min(180,Number(options.turnLimit)||60)),startedAt:Date.now(),winnerId:null,
  log:[{message:"Trò chơi bắt đầu. Mỗi người nhận 1.500 xu.",time:Date.now()}]
 };
}
function currentPlayer(g){return g.players[g.turnIndex]||null;}
function player(g,id){return g.players.find(p=>p.id===id)||null;}
function addLog(g,message){g.log.push({message:String(message).slice(0,200),time:Date.now()});g.log=g.log.slice(-100);}
function alive(g){return g.players.filter(p=>!p.bankrupt);}
function nextTurn(g,extra=false){
 if(g.status!=="playing")return;
 if(extra){g.awaitingRoll=true;g.pending=null;return;}
 let i=g.turnIndex;
 for(let n=0;n<g.players.length;n++){i=(i+1)%g.players.length;if(!g.players[i].bankrupt)break;}
 g.turnIndex=i;g.awaitingRoll=true;g.pending=null;g.lastDice=null;g.turnNumber++;
}
function transfer(g,from,to,amount){
 amount=Math.max(0,Math.floor(amount));
 if(from.money<amount){
  const available=from.money;from.money=0;if(to)to.money+=available;
  g.debt={debtorId:from.id,creditorId:to?to.id:null,amount:amount-available,reason:"payment"};return false;
 }
 from.money-=amount;if(to)to.money+=amount;return true;
}
function goToJail(g,p){p.position=10;p.inJail=true;p.jailTurns=0;p.consecutiveDoubles=0;addLog(g,p.name+" phải vào tù.");}
function propertyInfo(g,id){return g.properties[id]||(g.properties[id]={ownerId:null,houses:0,mortgaged:false});}
function groupOwned(g,p,group){const items=BOARD.filter(s=>s.type==="property"&&s.group===group);return items.length>0&&items.every(s=>propertyInfo(g,s.id).ownerId===p.id);}
function rentFor(g,space,owner,diceTotal){
 const info=propertyInfo(g,space.id);
 if(info.mortgaged)return 0;
 if(space.type==="property"){
  if(info.houses===0&&groupOwned(g,owner,space.group))return space.rents[0]*2;
  return space.rents[info.houses]||space.rents[0];
 }
 if(space.type==="transport"){
  const count=BOARD.filter(s=>s.type==="transport"&&propertyInfo(g,s.id).ownerId===owner.id&&!propertyInfo(g,s.id).mortgaged).length;
  return 25*Math.pow(2,Math.max(0,count-1));
 }
 if(space.type==="utility"){
  const count=BOARD.filter(s=>s.type==="utility"&&propertyInfo(g,s.id).ownerId===owner.id&&!propertyInfo(g,s.id).mortgaged).length;
  return diceTotal*(count===2?10:4);
 }
 return 0;
}
function applyCard(g,p,card){
 addLog(g,p.name+" rút thẻ: "+card.text+".");
 if(card.type==="collect")p.money+=card.amount;
 else if(card.type==="pay"){if(!transfer(g,p,null,card.amount))return;}
 else if(card.type==="jail")goToJail(g,p);
 else if(card.type==="move"){
  if(card.position<p.position)p.money+=200;
  p.position=card.position;
 }
}
function resolveSpace(g,p,diceTotal,allowExtra){
 const space=BOARD[p.position];
 if(space.type==="property"||space.type==="transport"||space.type==="utility"){
  const info=propertyInfo(g,space.id);
  if(!info.ownerId){g.pending={type:"purchase",playerId:p.id,spaceId:space.id,extraTurn:allowExtra};g.awaitingRoll=false;return;}
  if(info.ownerId!==p.id){
   const owner=player(g,info.ownerId),rent=owner?rentFor(g,space,owner,diceTotal):0;
   if(owner&&rent>0){
    if(!transfer(g,p,owner,rent)){addLog(g,p.name+" chưa đủ tiền trả "+rent+" xu cho "+owner.name+".");return;}
    addLog(g,p.name+" trả "+rent+" xu tiền thuê cho "+owner.name+".");
   }
  }
 }else if(space.type==="tax"){
  if(!transfer(g,p,null,space.price)){addLog(g,p.name+" chưa đủ tiền nộp thuế.");return;}
  addLog(g,p.name+" đã nộp "+space.price+" xu tiền thuế.");
 }else if(space.type==="goToJail"){goToJail(g,p);nextTurn(g,false);return;}
 else if(space.type==="chance"||space.type==="community"){
  const deck=space.type==="chance"?g.chance:g.community;
  const card=deck.shift();deck.push(card);applyCard(g,p,card);
  if(g.debt)return;
  if(p.inJail){nextTurn(g,false);return;}
 }
 if(!g.pending&&!g.debt&&!p.inJail)nextTurn(g,allowExtra);
}
function roll(g,playerId,dice){
 const p=currentPlayer(g);
 if(!p||p.id!==playerId||g.status!=="playing"||!g.awaitingRoll||g.pending||g.auction||g.debt)throw new Error("Hiện tại bạn chưa thể tung xúc xắc.");
 if(p.bankrupt)throw new Error("Bạn đã phá sản.");
 const d=dice||[crypto.randomInt(1,7),crypto.randomInt(1,7)];
 if(!Array.isArray(d)||d.length!==2||d.some(x=>!Number.isInteger(x)||x<1||x>6))throw new Error("Kết quả xúc xắc không hợp lệ.");
 const total=d[0]+d[1],double=d[0]===d[1];g.lastDice=d;g.awaitingRoll=false;
 if(p.inJail){
  p.jailTurns++;
  if(double||p.jailTurns>=3){
   p.inJail=false;p.jailTurns=0;
   if(!double){if(!transfer(g,p,null,50))return {dice:d,jailed:true};}
   addLog(g,p.name+" đã ra tù.");
  }else{addLog(g,p.name+" chưa tung được đôi, tiếp tục ở tù.");nextTurn(g);return {dice:d,jailed:true};}
 }else if(double){p.consecutiveDoubles++;if(p.consecutiveDoubles>=3){goToJail(g,p);nextTurn(g);return {dice:d,jailed:true};}}
 else p.consecutiveDoubles=0;
 const old=p.position;p.position=(p.position+total)%BOARD.length;
 if(p.position<old){p.money+=200;addLog(g,p.name+" đi qua Xuất phát và nhận 200 xu.");}
 addLog(g,p.name+" tung "+d[0]+" và "+d[1]+", di chuyển đến "+BOARD[p.position].name+".");
 resolveSpace(g,p,total,double&&!p.inJail);
 return {dice:d,space:BOARD[p.position]};
}
function buy(g,playerId){
 const p=currentPlayer(g),pending=g.pending;
 if(!p||p.id!==playerId||!pending||pending.type!=="purchase"||pending.playerId!==playerId)throw new Error("Không có tài sản chờ mua.");
 const space=BOARD[pending.spaceId];if(p.money<space.price)throw new Error("Bạn không đủ tiền mua tài sản này.");
 p.money-=space.price;p.properties.push(space.id);propertyInfo(g,space.id).ownerId=p.id;
 addLog(g,p.name+" mua "+space.name+" với giá "+space.price+" xu.");
 nextTurn(g,!!pending.extraTurn);return space;
}
function declinePurchase(g,playerId){
 const p=currentPlayer(g),pending=g.pending;
 if(!p||p.id!==playerId||!pending||pending.type!=="purchase")throw new Error("Không có tài sản chờ đấu giá.");
 const space=BOARD[pending.spaceId];
 g.auction={spaceId:space.id,currentBid:0,highBidderId:null,bidders:g.players.filter(x=>!x.bankrupt).map(x=>x.id),passed:[],extraTurn:!!pending.extraTurn};
 g.pending=null;g.awaitingRoll=false;addLog(g,p.name+" không mua "+space.name+". Tài sản được đưa ra đấu giá.");
}
function bid(g,playerId,amount){
 const a=g.auction,p=player(g,playerId);amount=Math.floor(Number(amount));
 if(!a||!p||!a.bidders.includes(playerId)||a.passed.includes(playerId))throw new Error("Bạn không tham gia phiên đấu giá này.");
 if(!Number.isInteger(amount)||amount<=a.currentBid||amount>p.money)throw new Error("Giá đấu không hợp lệ hoặc vượt quá số tiền hiện có.");
 a.currentBid=amount;a.highBidderId=playerId;a.passed=a.passed.filter(id=>id!==playerId);
 addLog(g,p.name+" trả giá "+amount+" xu.");
 const active=a.bidders.filter(id=>!a.passed.includes(id));
 if(active.length===1)finishAuction(g);
}
function passBid(g,playerId){
 const a=g.auction;if(!a||!a.bidders.includes(playerId)||a.passed.includes(playerId))throw new Error("Bạn không thể bỏ lượt đấu giá.");
 a.passed.push(playerId);const active=a.bidders.filter(id=>!a.passed.includes(id));
 if(active.length<=1)finishAuction(g);
}
function finishAuction(g){
 const a=g.auction;if(!a)return;
 const winner=player(g,a.highBidderId),space=BOARD[a.spaceId];
 if(winner&&a.currentBid>0){winner.money-=a.currentBid;winner.properties.push(space.id);propertyInfo(g,space.id).ownerId=winner.id;addLog(g,winner.name+" thắng đấu giá "+space.name+" với "+a.currentBid+" xu.");}
 else addLog(g,space.name+" không có người mua.");
 const extra=!!a.extraTurn;g.auction=null;nextTurn(g,extra);
}
function mortgage(g,playerId,spaceId){
 const p=player(g,playerId),info=propertyInfo(g,spaceId),space=BOARD[spaceId];
 if(!p||info.ownerId!==playerId||!space||info.houses>0||info.mortgaged)throw new Error("Không thể thế chấp tài sản này.");
 const value=Math.floor(space.price/2);info.mortgaged=true;p.money+=value;addLog(g,p.name+" thế chấp "+space.name+" và nhận "+value+" xu.");settleDebt(g,p);
}
function settleDebt(g,p){
 const debt=g.debt;if(!debt||debt.debtorId!==p.id)return;
 const paid=Math.min(p.money,debt.amount);p.money-=paid;
 const creditor=player(g,debt.creditorId);if(creditor)creditor.money+=paid;
 debt.amount-=paid;
 if(debt.amount<=0){g.debt=null;addLog(g,p.name+" đã thanh toán khoản nợ.");if(currentPlayer(g)?.id===p.id)nextTurn(g,false);}
}
function unmortgage(g,playerId,spaceId){
 const p=player(g,playerId),space=BOARD[spaceId];
 if(!p||!space)throw new Error("Tài sản không hợp lệ.");
 const info=propertyInfo(g,spaceId),cost=Math.ceil(space.price*.55);
 if(info.ownerId!==playerId||!info.mortgaged||p.money<cost)throw new Error("Không đủ điều kiện chuộc tài sản.");
 p.money-=cost;info.mortgaged=false;addLog(g,p.name+" chuộc lại "+space.name+".");
}
function build(g,playerId,spaceId){
 const p=player(g,playerId),space=BOARD[spaceId],info=propertyInfo(g,spaceId);
 if(!p||!space||space.type!=="property"||info.ownerId!==playerId||info.mortgaged||!groupOwned(g,p,space.group))throw new Error("Bạn chưa sở hữu toàn bộ nhóm đất hoặc tài sản đang bị thế chấp.");
 const group=BOARD.filter(s=>s.type==="property"&&s.group===space.group);
 if(group.some(s=>propertyInfo(g,s.id).mortgaged))throw new Error("Không thể xây khi một tài sản trong nhóm đang thế chấp.");
 const min=Math.min(...group.map(s=>propertyInfo(g,s.id).houses));
 if(info.houses!==min)throw new Error("Phải xây nhà cân bằng trong cùng nhóm màu.");
 if(info.houses>=5||p.money<space.houseCost)throw new Error("Không đủ tiền hoặc đã đạt giới hạn xây dựng.");
 p.money-=space.houseCost;info.houses++;addLog(g,p.name+" xây cấp "+info.houses+" tại "+space.name+".");
}
function payJail(g,playerId){
 const p=currentPlayer(g);if(!p||p.id!==playerId||!p.inJail||p.money<50)throw new Error("Không thể trả tiền để ra tù.");
 p.money-=50;p.inJail=false;p.jailTurns=0;addLog(g,p.name+" trả 50 xu để ra tù.");
}
function declareBankruptcy(g,playerId){
 const p=player(g,playerId);if(!p||!g.debt||g.debt.debtorId!==playerId)throw new Error("Bạn không ở trạng thái cần tuyên bố phá sản.");
 const creditor=player(g,g.debt.creditorId);
 p.bankrupt=true;p.money=0;
 for(const id of p.properties){const info=propertyInfo(g,id);info.ownerId=creditor?creditor.id:null;info.houses=0;info.mortgaged=false;if(creditor)creditor.properties.push(id);}
 p.properties=[];addLog(g,p.name+" đã phá sản.");
 g.debt=null;
 if(alive(g).length<=1){g.status="ended";g.winnerId=alive(g)[0]?.id||null;return;}
 if(currentPlayer(g)?.id===playerId)nextTurn(g,false);
}
function offerTrade(g,playerId,offer){
 const from=player(g,playerId),to=player(g,offer&&offer.toId);
 if(!from||!to||from.id===to.id||from.bankrupt||to.bankrupt)throw new Error("Người nhận giao dịch không hợp lệ.");
 const giveIds=Array.isArray(offer.givePropertyIds)?offer.givePropertyIds.map(Number):[];
 const takeIds=Array.isArray(offer.takePropertyIds)?offer.takePropertyIds.map(Number):[];
 if(giveIds.some(id=>!from.properties.includes(id))||takeIds.some(id=>!to.properties.includes(id)))throw new Error("Giao dịch chứa tài sản không thuộc sở hữu.");
 const giveMoney=Math.floor(Number(offer.giveMoney)||0),takeMoney=Math.floor(Number(offer.takeMoney)||0);
 if(giveMoney<0||takeMoney<0||giveMoney>from.money||takeMoney>to.money)throw new Error("Số tiền giao dịch không hợp lệ.");
 g.trade={id:crypto.randomBytes(6).toString("hex"),fromId:from.id,toId:to.id,giveIds,takeIds,giveMoney,takeMoney};
 return g.trade;
}
function respondTrade(g,playerId,accept){
 const t=g.trade;if(!t||t.toId!==playerId)throw new Error("Không có lời đề nghị dành cho bạn.");
 if(accept){
  const from=player(g,t.fromId),to=player(g,t.toId);
  if(!from||!to||from.money<t.giveMoney||to.money<t.takeMoney||t.giveIds.some(id=>!from.properties.includes(id))||t.takeIds.some(id=>!to.properties.includes(id)))throw new Error("Tài sản đã thay đổi, giao dịch bị hủy.");
  from.money-=t.giveMoney;to.money+=t.giveMoney;to.money-=t.takeMoney;from.money+=t.takeMoney;
  for(const id of t.giveIds){from.properties=from.properties.filter(x=>x!==id);to.properties.push(id);propertyInfo(g,id).ownerId=to.id;}
  for(const id of t.takeIds){to.properties=to.properties.filter(x=>x!==id);from.properties.push(id);propertyInfo(g,id).ownerId=from.id;}
  addLog(g,from.name+" và "+to.name+" đã hoàn tất giao dịch.");
 }else addLog(g,player(g,t.fromId).name+" bị từ chối giao dịch.");
 g.trade=null;
}
function publicState(g,viewerId){
 return {
  status:g.status,board:BOARD.map(s=>({...s,groupColor:s.group?GROUPS[s.group].color:null,ownerId:propertyInfo(g,s.id).ownerId,houses:propertyInfo(g,s.id).houses,mortgaged:propertyInfo(g,s.id).mortgaged})),
  players:g.players.map(p=>({id:p.id,name:p.name,money:p.money,position:p.position,properties:p.properties.slice(),inJail:p.inJail,jailTurns:p.jailTurns,bankrupt:p.bankrupt,isCurrent:p.id===currentPlayer(g)?.id,netWorth:p.money+p.properties.reduce((n,id)=>n+Math.floor(BOARD[id].price/2),0)})),
  currentPlayerId:currentPlayer(g)?.id||null,turnIndex:g.turnIndex,awaitingRoll:g.awaitingRoll,
  pending:g.pending?{...g.pending,space:BOARD[g.pending.spaceId]}:null,
  auction:g.auction?{...g.auction,bidders:g.auction.bidders.slice(),passed:g.auction.passed.slice()}:null,
  debt:g.debt?{...g.debt}:null,lastDice:g.lastDice,winnerId:g.winnerId,mode:g.mode,turnLimit:g.turnLimit,
  trade:g.trade?{...g.trade}:null,log:g.log.slice(-40)
 };
}
module.exports={BOARD,GROUPS,createGame,currentPlayer,roll,buy,declinePurchase,bid,passBid,mortgage,unmortgage,build,payJail,declareBankruptcy,offerTrade,respondTrade,publicState};
