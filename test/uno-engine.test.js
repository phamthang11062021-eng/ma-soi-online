const test = require("node:test");
const assert = require("node:assert/strict");
const uno = require("../lib/uno-engine");

function fixedGame() {
  const game = uno.createGame([{id:"a",name:"A"},{id:"b",name:"B"},{id:"c",name:"C"}]);
  game.players[0].hand = [
    {id:"r1",color:"red",type:"number",value:1,label:"1"},
    {id:"b2",color:"blue",type:"number",value:2,label:"2"},
    {id:"w1",color:null,type:"wild",value:null,label:"ĐỔI MÀU"}
  ];
  game.players[1].hand = [{id:"g3",color:"green",type:"number",value:3,label:"3"}];
  game.players[2].hand = [{id:"y4",color:"yellow",type:"number",value:4,label:"4"}];
  game.topCard = {id:"r0",color:"red",type:"number",value:0,label:"0"};
  game.discardPile = [game.topCard];
  game.activeColor = "red";
  game.currentIndex = 0;
  return game;
}

test("standard deck has 108 unique cards", () => {
  const deck = uno.makeDeck();
  assert.equal(deck.length, 108);
  assert.equal(new Set(deck.map(c => c.id)).size, 108);
});

test("deals seven cards to each player and starts on a number", () => {
  const game = uno.createGame(Array.from({length:10},(_,i)=>({id:String(i),name:"P"+i})));
  assert.equal(game.players.length,10);
  assert.ok(game.players.every(p=>p.hand.length===7));
  assert.equal(game.topCard.type,"number");
  assert.equal(game.drawPile.length + game.discardPile.length + game.players.reduce((n,p)=>n+p.hand.length,0),108);
});

test("rejects player counts outside 2 to 10", () => {
  assert.throws(()=>uno.createGame([{id:"a",name:"A"}]),/2 đến 10/);
  assert.throws(()=>uno.createGame(Array.from({length:11},(_,i)=>({id:String(i),name:"P"+i}))),/2 đến 10/);
});

test("rejects an invalid card and accepts a matching color", () => {
  const game=fixedGame();
  assert.throws(()=>uno.playCard(game,"a","b2"),/không hợp lệ/);
  assert.equal(uno.playCard(game,"a","r1").card.id,"r1");
  assert.equal(uno.currentPlayer(game).id,"b");
});

test("wild card requires a valid color choice", () => {
  const game=fixedGame();
  assert.throws(()=>uno.playCard(game,"a","w1"),/chọn màu/);
  uno.playCard(game,"a","w1","blue");
  assert.equal(game.activeColor,"blue");
});

test("draw two penalizes the next player and skips that turn", () => {
  const game=fixedGame();
  game.players[0].hand=[{id:"d2",color:"red",type:"draw2",label:"+2"},{id:"extra",color:"blue",type:"number",value:5,label:"5"}];
  const before=game.players[1].hand.length;
  uno.playCard(game,"a","d2");
  assert.equal(game.players[1].hand.length,before+2);
  assert.equal(uno.currentPlayer(game).id,"c");
});

test("reverse with two players acts as a skip", () => {
  const game=uno.createGame([{id:"a",name:"A"},{id:"b",name:"B"}]);
  game.players[0].hand=[{id:"rev",color:game.activeColor,type:"reverse",label:"ĐẢO"}];
  uno.playCard(game,"a","rev");
  assert.equal(uno.currentPlayer(game).id,"a");
});

test("drawn playable card can be played, otherwise turn advances", () => {
  const game=fixedGame();
  game.drawPile=[{id:"drawn",color:"red",type:"number",value:8,label:"8"}];
  const result=uno.drawCard(game,"a");
  assert.equal(result.canPlay,true);
  assert.equal(game.drawnCardId,"drawn");
  uno.passTurn(game,"a");
  assert.equal(uno.currentPlayer(game).id,"b");
});

test("UNO call clears pending state and catch adds two cards", () => {
  const game=fixedGame();
  game.players[0].hand=[{id:"one",color:"red",type:"number",value:1,label:"1"},{id:"two",color:"blue",type:"number",value:2,label:"2"}];
  game.drawPile=[{id:"extra1",color:"yellow",type:"number",value:1},{id:"extra2",color:"yellow",type:"number",value:2}];
  uno.playCard(game,"a","one");
  assert.equal(game.unoPendingId,"a");
  uno.catchUno(game,"b");
  assert.equal(game.players[0].hand.length,3);
  assert.equal(game.unoPendingId,null);
});

test("private hand is not exposed to other players", () => {
  const game=fixedGame();
  const state=uno.publicState(game,"a");
  assert.ok(Array.isArray(state.players.find(p=>p.id==="a").hand));
  assert.equal(state.players.find(p=>p.id==="b").hand,undefined);
});
