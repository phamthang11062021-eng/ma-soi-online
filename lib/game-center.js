"use strict";

const crypto = require("node:crypto");
const uno = require("./uno-engine");
const property = require("./property-engine");

function attachGameCenter(io) {
  const rooms = new Map();
  const randomToken = () => crypto.randomBytes(24).toString("hex");
  const randomId = () => crypto.randomBytes(8).toString("hex");
  const makeCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
  const cleanName = value => String(value || "").replace(/[<>]/g, "").trim().slice(0, 18);
  const error = (socket, message) => socket.emit("gc:error", message);

  function findRoomBySocket(socketId) {
    for (const room of rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  function publicState(room, viewer) {
    const game = room.game ? (room.gameType === "uno" ? uno.publicState(room.game, viewer.id) : property.publicState(room.game, viewer.id)) : null;
    return {
      code: room.code,
      gameType: room.gameType,
      status: room.status,
      hostId: room.hostId,
      isHost: viewer.id === room.hostId,
      playerCount: room.players.length,
      settings: { ...room.settings },
      announcement: room.announcement,
      players: room.players.map(p => ({
        id: p.id, name: p.name, ready: p.ready,
        connected: p.connected, isHost: p.id === room.hostId
      })),
      self: { id: viewer.id, name: viewer.name, ready: viewer.ready },
      game,
      chat: room.chat.slice(-40),
      endsAt: room.endsAt
    };
  }

  function broadcast(room) {
    for (const player of room.players) {
      if (player.socketId) io.to(player.socketId).emit("gc:state", publicState(room, player));
    }
  }

  function clearTurnTimer(room) {
    if (room.timer) clearTimeout(room.timer);
    room.timer = null;
    room.endsAt = null;
  }

  function scheduleTurn(room) {
    clearTurnTimer(room);
    if (!room.game || room.game.status !== "playing" || room.gameType !== "uno") return;
    room.endsAt = Date.now() + room.settings.turnSeconds * 1000;
    room.timer = setTimeout(() => {
      room.timer = null;
      room.endsAt = null;
      if (!room.game || room.game.status !== "playing" || room.gameType !== "uno") return;
      const expired = uno.timeoutTurn(room.game);
      room.announcement = expired
        ? expired.playerId + " đã hết thời gian và lượt được tự động kết thúc."
        : "Lượt chơi đã hết thời gian.";
      if (room.game.status === "ended") finishGame(room);
      else scheduleTurn(room);
      broadcast(room);
    }, room.settings.turnSeconds * 1000);
  }

  function finishGame(room) {
    clearTurnTimer(room);
    room.status = "ended";
    const winner = room.players.find(p => p.id === room.game?.winnerId);
    room.announcement = winner ? winner.name + (room.gameType === "uno" ? " đã thắng Bài Màu Số!" : " đã chiến thắng Cờ Tỷ Phú!") : "Ván chơi đã kết thúc.";
  }

  function schedulePropertyEnd(room) {
    clearTurnTimer(room);
    if (!room.game || room.game.status !== "playing" || room.gameType !== "property") return;
    const duration = room.settings.turnLimit * 60 * 1000;
    room.endsAt = Date.now() + duration;
    room.timer = setTimeout(() => {
      room.timer = null;
      room.endsAt = null;
      if (!room.game || room.game.status !== "playing" || room.gameType !== "property") return;
      property.endByTime(room.game);
      finishGame(room);
      broadcast(room);
    }, duration);
  }

  function sendStateToSocket(socket, room, player) {
    socket.join("gc:" + room.code);
    socket.emit("gc:joined", { code: room.code, token: player.token, playerId: player.id });
    broadcast(room);
  }

  function createRoom(socket, payload) {
    const name = cleanName(payload && payload.name);
    const gameType = String(payload && payload.gameType || "uno");
    if (!name) return error(socket, "Nhập tên hiển thị trước nhé.");
    if (!["uno", "property"].includes(gameType)) return error(socket, "Trò chơi không hợp lệ.");
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    const player = {
      id: randomId(), name, token: randomToken(), socketId: socket.id,
      connected: true, ready: true, joinedAt: Date.now()
    };
    const room = {
      code, gameType, players: [player], hostId: player.id, kickedTokens: new Set(),
      status: "lobby", game: null, timer: null, endsAt: null,
      settings: gameType === "uno" ? {
        maxPlayers: 10, turnSeconds: 30,
        allowPlayDrawnCard: true, unoPenalty: true, stacking: false
      } : {
        maxPlayers: 10, mode: "classic", turnLimit: 60
      },
      announcement: "Đã tạo phòng. Gửi mã cho bạn bè để cùng chơi.",
      chat: []
    };
    rooms.set(code, room);
    sendStateToSocket(socket, room, player);
  }

  function joinRoom(socket, payload) {
    const code = String(payload && payload.code || "").trim().toUpperCase();
    const name = cleanName(payload && payload.name);
    const token = String(payload && payload.token || "");
    const room = rooms.get(code);
    if (!room) return error(socket, "Không tìm thấy phòng. Kiểm tra lại mã nhé.");
    if (token && room.kickedTokens.has(token)) return error(socket, "Bạn đã bị mời khỏi phòng.");
    let player = token ? room.players.find(p => p.token === token) : null;
    if (player) {
      if (name && player.name.toLowerCase() !== name.toLowerCase()) {
        return error(socket, "Tên không khớp với phiên chơi đã lưu.");
      }
      if (player.socketId && player.socketId !== socket.id) {
        const old = io.sockets.sockets.get(player.socketId);
        if (old) old.leave("gc:" + room.code);
      }
      player.socketId = socket.id;
      player.connected = true;
      sendStateToSocket(socket, room, player);
      return;
    }
    if (!name) return error(socket, "Nhập tên hiển thị trước nhé.");
    if (room.status !== "lobby") return error(socket, "Ván đã bắt đầu. Chỉ người chơi cũ có thể kết nối lại.");
    if (room.players.length >= room.settings.maxPlayers) return error(socket, "Phòng đã đủ 10 người.");
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      return error(socket, "Tên này đã có trong phòng.");
    }
    player = {
      id: randomId(), name, token: randomToken(), socketId: socket.id,
      connected: true, ready: false, joinedAt: Date.now()
    };
    room.players.push(player);
    room.announcement = name + " đã tham gia phòng.";
    sendStateToSocket(socket, room, player);
  }

  function requirePlayer(socket) {
    const found = findRoomBySocket(socket.id);
    if (!found) {
      error(socket, "Bạn chưa tham gia phòng Game Center.");
      return null;
    }
    return found;
  }

  function requireHost(socket) {
    const found = requirePlayer(socket);
    if (!found) return null;
    if (found.player.id !== found.room.hostId) {
      error(socket, "Chỉ chủ phòng mới có quyền thực hiện thao tác này.");
      return null;
    }
    return found;
  }

  function applyUnoAction(socket, action) {
    const found = requirePlayer(socket);
    if (!found) return;
    const { room, player } = found;
    if (room.gameType !== "uno" || !room.game || room.status !== "playing") {
      return error(socket, "Ván Bài Màu Số chưa bắt đầu.");
    }
    try {
      action(room.game, player);
      if (room.game.status === "ended") finishGame(room);
      else scheduleTurn(room);
      broadcast(room);
    } catch (err) {
      error(socket, err.message || "Không thể thực hiện thao tác.");
    }
  }

  io.on("connection", socket => {
    socket.on("gc:createRoom", payload => createRoom(socket, payload || {}));
    socket.on("gc:joinRoom", payload => joinRoom(socket, payload || {}));

    socket.on("gc:ready", () => {
      const found = requirePlayer(socket);
      if (!found || found.room.status !== "lobby") return;
      found.player.ready = !found.player.ready;
      broadcast(found.room);
    });

    socket.on("gc:host:start", () => {
      const found = requireHost(socket);
      if (!found) return;
      const { room } = found;
      if (room.status !== "lobby") return error(socket, "Phòng không ở trạng thái chờ.");
      if (room.players.length < 2) return error(socket, "Cần ít nhất 2 người để bắt đầu.");
      if (room.players.length > 10) return error(socket, "Trò chơi chỉ hỗ trợ tối đa 10 người.");
      if (!room.players.every(p => p.ready && p.connected)) return error(socket, "Tất cả người chơi cần sẵn sàng và đang kết nối.");
      try {
        room.game = room.gameType === "uno"
          ? uno.createGame(room.players, room.settings)
          : property.createGame(room.players, room.settings);
        room.status = "playing";
        room.announcement = room.gameType === "uno"
          ? "Ván Bài Màu Số bắt đầu! Hãy đánh bài theo lượt."
          : "Ván Cờ Tỷ Phú bắt đầu! Chủ động xây dựng tài sản.";
        if (room.gameType === "uno") scheduleTurn(room);
        else schedulePropertyEnd(room);
        broadcast(room);
      } catch (err) {
        error(socket, err.message);
      }
    });

    socket.on("gc:host:settings", payload => {
      const found = requireHost(socket);
      if (!found) return;
      const { room } = found;
      if (room.status !== "lobby") return error(socket, "Không thể đổi cài đặt khi ván đã bắt đầu.");
      if (room.gameType === "uno") {
        const turnSeconds = Number(payload && payload.turnSeconds);
        if (!Number.isInteger(turnSeconds) || turnSeconds < 10 || turnSeconds > 120) {
          return error(socket, "Thời gian lượt phải từ 10 đến 120 giây.");
        }
        room.settings = {
          ...room.settings, turnSeconds,
          allowPlayDrawnCard: payload.allowPlayDrawnCard !== false,
          unoPenalty: payload.unoPenalty !== false, stacking: false
        };
      } else {
        const turnLimit = Number(payload && payload.turnLimit);
        const mode = payload && payload.mode === "quick" ? "quick" : "classic";
        if (!Number.isInteger(turnLimit) || turnLimit < 10 || turnLimit > 180) {
          return error(socket, "Thời lượng ván nhanh phải từ 10 đến 180 phút.");
        }
        room.settings = { ...room.settings, mode, turnLimit };
      }
      room.announcement = "Chủ phòng đã cập nhật luật chơi.";
      broadcast(room);
    });

    socket.on("gc:host:kick", payload => {
      const found = requireHost(socket);
      if (!found) return;
      const { room } = found;
      if (room.status !== "lobby") return error(socket, "Chỉ có thể kick người chơi trong sảnh chờ.");
      const target = room.players.find(p => p.id === String(payload && payload.targetId || ""));
      if (!target || target.id === room.hostId) return error(socket, "Không tìm thấy người chơi hợp lệ.");
      room.kickedTokens.add(target.token);
      if (target.socketId) {
        io.to(target.socketId).emit("gc:kicked", { message: "Chủ phòng đã mời bạn ra khỏi phòng." });
        const targetSocket = io.sockets.sockets.get(target.socketId);
        if (targetSocket) targetSocket.leave("gc:" + room.code);
      }
      room.players = room.players.filter(p => p.id !== target.id);
      room.announcement = target.name + " đã được mời ra khỏi phòng.";
      broadcast(room);
    });

    socket.on("gc:host:transfer", payload => {
      const found = requireHost(socket);
      if (!found) return;
      const { room } = found;
      if (room.status !== "lobby") return error(socket, "Chỉ chuyển chủ phòng trong sảnh chờ.");
      const target = room.players.find(p => p.id === String(payload && payload.targetId || "") && p.connected);
      if (!target) return error(socket, "Người nhận quyền chủ phòng không hợp lệ.");
      room.hostId = target.id;
      room.announcement = target.name + " đã trở thành chủ phòng.";
      broadcast(room);
    });

    socket.on("gc:uno:play", payload => applyUnoAction(socket, (game, player) => {
      const result = uno.playCard(game, player.id, String(payload && payload.cardId || ""), payload && payload.chosenColor);
      if (result.winnerId) return;
      roomAnnouncementForPlayer(player, result, "đã đánh một lá bài.");
    }));

    socket.on("gc:uno:draw", () => applyUnoAction(socket, (game, player) => {
      const result = uno.drawCard(game, player.id);
      roomAnnouncementForPlayer(player, result, result.canPlay ? "đã rút một lá và có thể đánh." : "đã rút bài và kết thúc lượt.");
    }));

    socket.on("gc:uno:pass", () => applyUnoAction(socket, (game, player) => {
      uno.passTurn(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã bỏ lượt.");
    }));

    socket.on("gc:uno:call", () => applyUnoAction(socket, (game, player) => {
      uno.callUno(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã gọi UNO!");
    }));

    socket.on("gc:uno:catch", () => applyUnoAction(socket, (game, player) => {
      const result = uno.catchUno(game, player.id);
      const offender = game.players.find(p => p.id === result.offenderId);
      roomAnnouncementForPlayer(player, null, "đã bắt lỗi UNO của " + (offender ? offender.name : "người chơi") + ".");
    }));

    socket.on("gc:property:roll", payload => applyPropertyAction(socket, (game, player) => {
      const result = property.roll(game, player.id);
      roomAnnouncementForPlayer(player, result, "đã tung xúc xắc.");
    }));
    socket.on("gc:property:buy", () => applyPropertyAction(socket, (game, player) => {
      const space = property.buy(game, player.id);
      roomAnnouncementForPlayer(player, space, "đã mua " + space.name + ".");
    }));
    socket.on("gc:property:decline", () => applyPropertyAction(socket, (game, player) => {
      property.declinePurchase(game, player.id);
      roomAnnouncementForPlayer(player, null, "đưa tài sản ra đấu giá.");
    }));
    socket.on("gc:property:bid", payload => applyPropertyAction(socket, (game, player) => {
      property.bid(game, player.id, payload && payload.amount);
      roomAnnouncementForPlayer(player, null, "đã trả giá trong phiên đấu giá.");
    }));
    socket.on("gc:property:passBid", () => applyPropertyAction(socket, (game, player) => {
      property.passBid(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã bỏ lượt đấu giá.");
    }));
    socket.on("gc:property:mortgage", payload => applyPropertyAction(socket, (game, player) => {
      property.mortgage(game, player.id, Number(payload && payload.spaceId));
      roomAnnouncementForPlayer(player, null, "đã thế chấp tài sản.");
    }));
    socket.on("gc:property:unmortgage", payload => applyPropertyAction(socket, (game, player) => {
      property.unmortgage(game, player.id, Number(payload && payload.spaceId));
      roomAnnouncementForPlayer(player, null, "đã chuộc lại tài sản.");
    }));
    socket.on("gc:property:sellHouse", payload => applyPropertyAction(socket, (game, player) => {
      property.sellHouse(game, player.id, Number(payload && payload.spaceId));
      roomAnnouncementForPlayer(player, null, "đã bán một cấp nhà.");
    }));
    socket.on("gc:property:trade:cancel", () => applyPropertyAction(socket, (game, player) => {
      property.cancelTrade(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã hủy đề nghị giao dịch.");
    }));
    socket.on("gc:property:build", payload => applyPropertyAction(socket, (game, player) => {
      property.build(game, player.id, Number(payload && payload.spaceId));
      roomAnnouncementForPlayer(player, null, "đã xây nhà.");
    }));
    socket.on("gc:property:payJail", () => applyPropertyAction(socket, (game, player) => {
      property.payJail(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã trả phí để ra tù.");
    }));
    socket.on("gc:property:bankrupt", () => applyPropertyAction(socket, (game, player) => {
      property.declareBankruptcy(game, player.id);
      roomAnnouncementForPlayer(player, null, "đã tuyên bố phá sản.");
    }));
    socket.on("gc:property:trade:offer", payload => applyPropertyAction(socket, (game, player) => {
      property.offerTrade(game, player.id, payload || {});
      roomAnnouncementForPlayer(player, null, "đã gửi đề nghị giao dịch.");
    }));
    socket.on("gc:property:trade:respond", payload => applyPropertyAction(socket, (game, player) => {
      property.respondTrade(game, player.id, !!(payload && payload.accept));
      roomAnnouncementForPlayer(player, null, "đã phản hồi đề nghị giao dịch.");
    }));

    socket.on("gc:chat", payload => {
      const found = requirePlayer(socket);
      if (!found) return;
      const message = String(payload && payload.message || "").replace(/[<>]/g, "").trim().slice(0, 240);
      if (!message) return;
      const now = Date.now();
      if (found.player.lastChatAt && now - found.player.lastChatAt < 1000) return;
      found.player.lastChatAt = now;
      found.room.chat.push({ id: randomId(), name: found.player.name, message, time: now });
      found.room.chat = found.room.chat.slice(-40);
      broadcast(found.room);
    });

    socket.on("gc:restart", () => {
      const found = requireHost(socket);
      if (!found) return;
      const { room } = found;
      if (room.status !== "ended") return error(socket, "Chỉ có thể chơi lại sau khi ván kết thúc.");
      clearTurnTimer(room);
      room.status = "lobby";
      room.game = null;
      room.players.forEach(p => { p.ready = p.id === room.hostId; });
      room.announcement = "Ván đã kết thúc. Hãy sẵn sàng để chơi lại.";
      broadcast(room);
    });

    socket.on("gc:leaveRoom", () => {
      const found = findRoomBySocket(socket.id);
      if (!found) return;
      const { room, player } = found;
      player.connected = false;
      player.socketId = null;
      socket.leave("gc:" + room.code);
      if (player.id === room.hostId) {
        const next = room.players.find(p => p.id !== player.id && p.connected);
        if (next) room.hostId = next.id;
      }
      if (room.players.every(p => !p.connected) && room.status === "lobby") {
        clearTurnTimer(room);
        rooms.delete(room.code);
        return;
      }
      room.announcement = player.name + " đã rời kết nối.";
      broadcast(room);
    });

    socket.on("disconnect", () => {
      const found = findRoomBySocket(socket.id);
      if (!found) return;
      const { room, player } = found;
      player.connected = false;
      player.socketId = null;
      room.announcement = player.name + " mất kết nối. Có thể quay lại bằng phiên cũ.";
      broadcast(room);
    });
  });

  function applyPropertyAction(socket, action) {
    const found = requirePlayer(socket);
    if (!found) return;
    const { room, player } = found;
    if (room.gameType !== "property" || !room.game || room.status !== "playing") {
      return error(socket, "Ván Cờ Tỷ Phú chưa bắt đầu.");
    }
    try {
      action(room.game, player);
      if (room.game.status === "ended") finishGame(room);
      else room.status = room.game.status;
      broadcast(room);
    } catch (err) {
      error(socket, err.message || "Không thể thực hiện thao tác.");
    }
  }

  function roomAnnouncementForPlayer(player, result, message) {
    const room = [...rooms.values()].find(r => r.players.some(p => p.id === player.id));
    if (!room) return;
    room.announcement = player.name + " " + message;
  }

  return { rooms };
}

module.exports = { attachGameCenter };
