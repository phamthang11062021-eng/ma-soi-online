const test=require("node:test");
const assert=require("node:assert/strict");
const gameEngine=require("../lib/property-engine");
const players=()=>[{id:"a",name:"An"},{id:"b",name:"Bình"},{id:"c",name:"Chi"}];

test("board has 40 spaces and game supports 2 to 10 players",()=>{
 assert.equal(gameEngine.BOARD.length,40);
 assert.equal(gameEngine.createGame(players()).players.length,3);
 assert.equal(gameEngine.createGame(Array.from({length:10},(_,i)=>({id:String(i),name:"P"+i}))).players.length,10);
 assert.throws(()=>gameEngine.createGame(players().slice(0,1)),/2 đến 10/);
});
test("roll moves current player and pays salary when passing start",()=>{
 const g=gameEngine.createGame(players());
 g.players[0].position=39;
 gameEngine.roll(g,"a",[1,2]);
 assert.equal(g.players[0].position,2);
 assert.equal(g.players[0].money,1700);
});
test("landing on unowned property creates purchase prompt and buy transfers ownership",()=>{
 const g=gameEngine.createGame(players());
 gameEngine.roll(g,"a",[1,2]);
 assert.equal(g.pending.type,"purchase");
 const space=g.pending.spaceId;
 const before=g.players[0].money;
 gameEngine.buy(g,"a");
 assert.equal(g.players[0].money,before-gameEngine.BOARD[space].price);
 assert.equal(g.properties[space].ownerId,"a");
});
test("declining purchase opens auction and highest bidder wins",()=>{
 const g=gameEngine.createGame(players());
 gameEngine.roll(g,"a",[1,2]);
 const id=g.pending.spaceId;
 gameEngine.declinePurchase(g,"a");
 gameEngine.bid(g,"a",100);
 assert.ok(g.auction);
 gameEngine.passBid(g,"b");
 gameEngine.passBid(g,"c");
 assert.equal(g.properties[id].ownerId,"a");
});
test("mortgage and unmortgage adjust cash and ownership state",()=>{
 const g=gameEngine.createGame(players());
 g.players[0].properties=[1];g.properties[1]={ownerId:"a",houses:0,mortgaged:false};
 const cash=g.players[0].money;
 gameEngine.mortgage(g,"a",1);
 assert.equal(g.players[0].money,cash+30);
 gameEngine.unmortgage(g,"a",1);
 assert.equal(g.properties[1].mortgaged,false);
});
test("private state exposes the same public property board to all players",()=>{
 const g=gameEngine.createGame(players());
 assert.equal(gameEngine.publicState(g,"a").board.length,40);
 assert.equal(gameEngine.publicState(g,"b").players.length,3);
});

test("auction allows counter-bids and closes only after remaining players pass",()=>{
 const g=gameEngine.createGame(players());
 gameEngine.roll(g,"a",[1,2]);
 const id=g.pending.spaceId;
 gameEngine.declinePurchase(g,"a");
 gameEngine.bid(g,"a",100);
 gameEngine.bid(g,"b",120);
 gameEngine.bid(g,"a",130);
 gameEngine.passBid(g,"b");
 gameEngine.passBid(g,"c");
 assert.equal(g.properties[id].ownerId,"a");
 assert.equal(g.players[0].money,1370);
 assert.equal(g.auction,null);
});
test("rent is transferred to the property owner",()=>{
 const g=gameEngine.createGame(players());
 g.properties[3]={ownerId:"a",houses:0,mortgaged:false};
 g.players[0].properties=[3];
 g.turnIndex=1;
 const beforeA=g.players[0].money,beforeB=g.players[1].money;
 gameEngine.roll(g,"b",[1,2]);
 assert.equal(g.players[0].money,beforeA+4);
 assert.equal(g.players[1].money,beforeB-4);
});
test("houses must be built evenly across a complete color group",()=>{
 const g=gameEngine.createGame(players());
 g.players[0].properties=[1,3];
 g.properties[1]={ownerId:"a",houses:0,mortgaged:false};
 g.properties[3]={ownerId:"a",houses:0,mortgaged:false};
 gameEngine.build(g,"a",1);
 assert.throws(()=>gameEngine.build(g,"a",1),/cân bằng/);
 gameEngine.build(g,"a",3);
 assert.equal(g.properties[1].houses,1);
 assert.equal(g.properties[3].houses,1);
});
test("mortgaging an asset can settle a rent debt",()=>{
 const g=gameEngine.createGame(players());
 g.properties[3]={ownerId:"a",houses:0,mortgaged:false};
 g.players[0].properties=[3];
 g.properties[1]={ownerId:"b",houses:0,mortgaged:false};
 g.players[1].properties=[1];
 g.players[1].money=2;
 g.turnIndex=1;
 gameEngine.roll(g,"b",[1,2]);
 assert.equal(g.debt.debtorId,"b");
 assert.equal(g.debt.amount,2);
 gameEngine.mortgage(g,"b",1);
 assert.equal(g.debt,null);
 assert.equal(g.players[1].money,28);
});
test("only the trade recipient can accept and property ownership transfers",()=>{
 const g=gameEngine.createGame(players());
 g.properties[1]={ownerId:"a",houses:0,mortgaged:false};
 g.properties[3]={ownerId:"b",houses:0,mortgaged:false};
 g.players[0].properties=[1];g.players[1].properties=[3];
 gameEngine.offerTrade(g,"a",{toId:"b",giveMoney:100,takeMoney:50,givePropertyIds:[1],takePropertyIds:[3]});
 assert.throws(()=>gameEngine.respondTrade(g,"c",true),/dành cho bạn/);
 gameEngine.respondTrade(g,"b",true);
 assert.equal(g.properties[1].ownerId,"b");
 assert.equal(g.properties[3].ownerId,"a");
 assert.equal(g.players[0].money,1450);
 assert.equal(g.players[1].money,1550);
});
test("timed game ends and chooses the player with greatest asset value",()=>{
 const g=gameEngine.createGame(players());
 g.players[0].money=100;g.players[0].properties=[1];
 g.properties[1]={ownerId:"a",houses:0,mortgaged:false};
 g.players[1].money=110;g.players[2].money=50;
 const result=gameEngine.endByTime(g);
 assert.equal(result.winnerId,"a");
 assert.equal(g.status,"ended");
});
