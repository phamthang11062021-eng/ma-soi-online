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
 gameEngine.roll(g,"a",[1,0+1]);
 assert.equal(g.pending.type,"purchase");
 const space=g.pending.spaceId;
 const before=g.players[0].money;
 gameEngine.buy(g,"a");
 assert.equal(g.players[0].money,before-gameEngine.BOARD[space].price);
 assert.equal(g.properties[space].ownerId,"a");
});
test("declining purchase opens auction and highest bidder wins",()=>{
 const g=gameEngine.createGame(players());
 gameEngine.roll(g,"a",[1,1]);
 const id=g.pending.spaceId;
 gameEngine.declinePurchase(g,"a");
 gameEngine.bid(g,"a",100);
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
