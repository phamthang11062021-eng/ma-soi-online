const test=require("node:test");
const assert=require("node:assert/strict");
const {attachGameCenter}=require("../lib/game-center");

class FakeSocket{
 constructor(id){this.id=id;this.handlers=new Map();this.sent=[];this.joined=new Set();}
 on(event,handler){this.handlers.set(event,handler);}
 emit(event,payload){this.sent.push({event,payload});}
 trigger(event,payload){const fn=this.handlers.get(event);if(fn)fn(payload);}
 join(room){this.joined.add(room);}
 leave(room){this.joined.delete(room);}
 last(event){return this.sent.filter(x=>x.event===event).at(-1)?.payload;}
}
function setup(){
 const sockets=new Map();let connectionHandler;
 const io={
  on(event,handler){if(event==="connection")connectionHandler=handler;},
  to(id){return{emit:(event,payload)=>sockets.get(id)?.emit(event,payload)};},
  sockets:{sockets}
 };
 const manager=attachGameCenter(io);
 const connect=id=>{const socket=new FakeSocket(id);sockets.set(id,socket);connectionHandler(socket);return socket;};
 return{manager,connect};
}
function join(socket,code,name,gameType){socket.trigger("gc:joinRoom",{code,name,gameType});}

test("Game Center rejects joining a room for a different game type",()=>{
 const {connect}=setup(),a=connect("a"),b=connect("b");
 a.trigger("gc:createRoom",{name:"An",gameType:"uno"});
 const code=a.last("gc:joined").code;
 join(b,code,"Bình","property");
 assert.match(b.last("gc:error"),/trò chơi khác/);
});
test("UNO room starts only after all players are ready and keeps hands private",()=>{
 const {manager,connect}=setup(),a=connect("a"),b=connect("b");
 a.trigger("gc:createRoom",{name:"An",gameType:"uno"});
 const code=a.last("gc:joined").code;
 join(b,code,"Bình","uno");
 b.trigger("gc:host:start");
 assert.match(b.last("gc:error"),/chủ phòng/);
 b.trigger("gc:ready");
 a.trigger("gc:host:start");
 const room=manager.rooms.get(code);
 assert.equal(room.status,"playing");
 const stateA=a.last("gc:state"),stateB=b.last("gc:state");
 assert.equal(stateA.game.status,"playing");
 assert.equal(stateA.game.players.find(p=>p.id===stateB.self.id).hand,undefined);
 assert.ok(Array.isArray(stateB.game.players.find(p=>p.id===stateB.self.id).hand));
 clearTimeout(room.timer);
});
test("Cờ Tỷ Phú room starts with a 40-space board and transfers host on disconnect",()=>{
 const {manager,connect}=setup(),a=connect("a"),b=connect("b");
 a.trigger("gc:createRoom",{name:"An",gameType:"property"});
 const code=a.last("gc:joined").code;
 join(b,code,"Bình","property");
 b.trigger("gc:ready");
 a.trigger("gc:host:start");
 const room=manager.rooms.get(code);
 assert.equal(room.status,"playing");
 assert.equal(a.last("gc:state").game.board.length,40);
 a.trigger("disconnect");
 assert.equal(room.hostId,room.players.find(p=>p.name==="Bình").id);
 assert.equal(b.last("gc:state").isHost,true);
 clearTimeout(room.timer);
});
