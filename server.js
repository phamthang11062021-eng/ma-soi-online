const express = require("express");
const http = require("http");
const crypto = require("crypto");
const path = require("path");
const { Server } = require("socket.io");
const { addHistoryEvent, visibleHistory } = require("./lib/history");
const { playerPose, allConnectedPlayersConfirmed } = require("./lib/table-presentation");
const { isWolfTeam, piperHasWon, angelWinsOnVote, chooseScapegoat } = require("./lib/role-rules");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true }, pingInterval: 25000, pingTimeout: 20000 });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (req, res) => res.json({ ok: true, rooms: rooms.size }));
app.get("/werewolf", (req, res) => res.sendFile(path.join(__dirname, "public", "werewolf.html")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

const randomId = (n = 8) => crypto.randomBytes(n).toString("hex");
const makeCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();
const cleanName = (s) => String(s || "").replace(/[<>]/g, "").trim().slice(0, 18);

const ROLE_GUIDES = {
  wolf: {
    name: "Ma sói", team: "Phe Ma sói", summary: "Ẩn mình giữa dân làng và loại bỏ phe dân vào ban đêm.",
    objective: "Sống sót đến khi số Ma sói còn sống bằng hoặc nhiều hơn số người phe dân còn sống.",
    power: "Mỗi đêm, các Ma sói cùng bỏ phiếu chọn một người để cắn. Bạn nhìn thấy tên đồng đội Ma sói.",
    how: ["Khi đến lượt Ma sói, chọn một người không thuộc phe sói.", "Nếu có nhiều sói, hãy thống nhất mục tiêu bằng phiếu kín.", "Ban ngày, tham gia thảo luận như người bình thường và tránh để lộ thân phận."],
    tips: "Đừng bỏ phiếu quá khác biệt với đồng đội một cách bất thường. Quan sát cách người khác lập luận.",
    limits: "Không thể cắn đồng đội. Người đã chết không thể hành động."
  },
  villager: {
    name: "Dân làng", team: "Phe Dân làng", summary: "Dùng suy luận và biểu quyết để tìm ra Ma sói.",
    objective: "Giúp phe dân loại bỏ toàn bộ Ma sói.",
    power: "Không có kỹ năng ban đêm. Sức mạnh của bạn là thảo luận, quan sát và lá phiếu.",
    how: ["Ban đêm, chờ các vai có kỹ năng hành động.", "Ban ngày, đọc thông báo và trao đổi với người còn sống.", "Khi đến lượt bỏ phiếu, chọn người bạn nghi ngờ nhất."],
    tips: "Ghi nhớ ai bảo vệ ai, ai thay đổi lời khai và ai thường né tránh câu hỏi.",
    limits: "Không được chat hoặc bỏ phiếu sau khi bị loại."
  },
  seer: {
    name: "Tiên tri", team: "Phe Dân làng", summary: "Mỗi đêm kiểm tra bí mật một người.",
    objective: "Tìm Ma sói và giúp dân làng có căn cứ để bỏ phiếu.",
    power: "Mỗi đêm chọn một người còn sống để soi. Kết quả chỉ gửi riêng cho bạn: thuộc phe sói hoặc không thuộc phe sói.",
    how: ["Khi màn hình hiện lượt Tiên tri, chọn một người còn sống.", "Đọc kết quả riêng trong phần thông tin bí mật của bạn.", "Ban ngày, cân nhắc cách chia sẻ thông tin để không bị Ma sói phát hiện quá sớm."],
    tips: "Ưu tiên soi người có ảnh hưởng hoặc có lời nói đáng ngờ. Ghi nhớ kết quả qua từng đêm.",
    limits: "Bạn không biết chính xác vai của người được soi; chỉ biết họ có thuộc phe Ma sói hay không."
  },
  witch: {
    name: "Phù thủy", team: "Phe Dân làng", summary: "Sở hữu một bình cứu và một bình độc cho cả ván.",
    objective: "Dùng thuốc đúng lúc để cứu phe dân và loại bỏ Ma sói.",
    power: "Có một bình cứu người bị sói nhắm đến và một bình độc để chọn một người còn sống. Mỗi bình chỉ dùng một lần trong cả ván; mỗi đêm chỉ chọn một hành động.",
    how: ["Khi đến lượt Phù thủy, đọc thông tin người bị sói nhắm đến (nếu có).", "Chọn Dùng bình cứu, chọn một người để dùng bình độc, hoặc Bỏ qua.", "Hãy cân nhắc kỹ vì bình thuốc đã dùng sẽ không hồi lại."],
    tips: "Không cần dùng thuốc ngay đêm đầu. Hãy cân nhắc thông tin và số người còn sống.",
    limits: "Mỗi bình chỉ dùng một lần. Trong phiên bản hiện tại, mỗi đêm chỉ thực hiện một lựa chọn thuốc."
  },
  protector: {
    name: "Bảo vệ", team: "Phe Dân làng", summary: "Chọn một người để che chở khỏi đòn cắn của Ma sói.",
    objective: "Giữ những người có ích cho phe dân sống sót.",
    power: "Mỗi đêm chọn một người còn sống để bảo vệ khỏi bị sói cắn. Không thể chọn cùng một người trong hai đêm liên tiếp.",
    how: ["Khi đến lượt Bảo vệ, chọn một người trong danh sách.", "Lựa chọn được giữ bí mật.", "Sang đêm tiếp theo, hãy đổi mục tiêu nếu người vừa bảo vệ vẫn còn sống."],
    tips: "Cân nhắc bảo vệ người có thông tin quan trọng hoặc người đang bị nghi ngờ nhiều.",
    limits: "Không thể bảo vệ cùng một người hai đêm liên tiếp. Bảo vệ không chặn được bình độc."
  },
  hunter: {
    name: "Thợ săn", team: "Phe Dân làng", summary: "Khi bị loại, có một phát súng cuối cùng.",
    objective: "Dùng phát súng cuối để kéo Ma sói ra ánh sáng và giúp phe dân thắng.",
    power: "Khi bị loại bởi bất kỳ nguyên nhân nào, bạn có 20 giây để chọn một người còn sống bắn theo. Mỗi ván chỉ có một phát súng.",
    how: ["Nếu bị loại, màn hình sẽ hiện lượt cuối của Thợ săn.", "Chọn một người còn sống mà bạn nghi ngờ nhất.", "Nếu không chọn trong thời gian cho phép, lượt bắn sẽ bị bỏ qua."],
    tips: "Ghi nhớ các biểu hiện đáng ngờ từ đầu ván; đừng chọn theo cảm tính ở giây cuối.",
    limits: "Chỉ có một phát súng. Không thể bắn người đã bị loại."
  },
  cupid: {
    name: "Thần tình yêu", team: "Phe Dân làng (trừ khi ghép đôi khác phe)", summary: "Ghép hai người thành một đôi định mệnh.",
    objective: "Giúp phe của đôi tình nhân chiến thắng. Nếu ghép một người sói với một người dân và chỉ còn hai người yêu sống, đôi tình nhân thắng riêng.",
    power: "Trong đêm đầu tiên, chọn hai người còn sống làm đôi tình nhân. Hai người được ghép sẽ biết nhau; nếu một người chết, người kia cũng chết vì đau lòng.",
    how: ["Ở đêm đầu tiên, chọn người thứ nhất.", "Chọn người thứ hai khác người thứ nhất rồi xác nhận ghép đôi.", "Sau đó, quan sát để bảo vệ đôi tình nhân và tránh để họ bị loại."],
    tips: "Bạn có thể ghép bất kỳ hai người còn sống, kể cả chính mình.",
    limits: "Chỉ ghép đôi một lần vào đêm đầu tiên. Khi một người yêu chết, người còn lại cũng bị loại."
  },
  elder: {
    name: "Già làng", team: "Phe Dân làng", summary: "Có thể sống sót sau đòn cắn đầu tiên của Ma sói.",
    objective: "Sống sót và dùng kinh nghiệm giúp phe dân tìm ra sói.",
    power: "Lần đầu bị Ma sói cắn, bạn sống sót và lớp bảo hộ mất đi. Nếu bị cắn lần nữa, bị bỏ phiếu loại hoặc trúng độc, bạn sẽ chết bình thường.",
    how: ["Bạn không cần bấm gì vào ban đêm.", "Nếu sống sót sau một đêm bị tấn công, hãy tiếp tục thảo luận vào ban ngày.", "Dùng thông tin và kinh nghiệm để giúp dân làng."],
    tips: "Đừng vội tiết lộ vai trò nếu chưa cần thiết; việc lộ vai có thể khiến sói đổi mục tiêu.",
    limits: "Chỉ chặn được một lần Ma sói cắn. Không chống được bình độc hay bỏ phiếu."
  },
  littleGirl: {
    name: "Cô bé", team: "Phe Dân làng", summary: "Có thể lén quan sát Ma sói trong đêm.",
    objective: "Thu thập thông tin về phe sói mà không để lộ thân phận.",
    power: "Trong lượt Ma sói, bạn có thể bấm Quan sát lén để nhận danh sách những người thuộc phe sói.",
    how: ["Khi màn hình hiện lượt Ma sói, tìm nút Quan sát lén.", "Bấm nút để xem thông tin riêng về những người thuộc phe sói.", "Dùng thông tin đó một cách khéo léo khi thảo luận ban ngày."],
    tips: "Không nên công khai ngay rằng bạn biết danh tính sói; hãy dùng câu hỏi và lập luận để kiểm chứng.",
    limits: "Quan sát chỉ dùng trong lúc Ma sói thức dậy. Thông tin chỉ hiển thị cho bạn."
  },
  mayor: {
    name: "Thị trưởng", team: "Phe Dân làng", summary: "Lá phiếu của bạn có trọng số gấp đôi.",
    objective: "Dùng tiếng nói có trọng lượng để giúp dân làng loại đúng người.",
    power: "Khi còn sống, phiếu bầu ban ngày của bạn được tính là hai phiếu.",
    how: ["Tham gia thảo luận như bình thường.", "Trong lượt bỏ phiếu, chọn một người như mọi người khác.", "Hệ thống tự động tính lá phiếu của bạn gấp đôi."],
    tips: "Hãy giải thích rõ lý do trước khi bỏ phiếu để người khác có thể cân nhắc.",
    limits: "Chỉ tăng trọng số phiếu ban ngày; không có tác dụng khi bạn đã bị loại."
  },
  medium: {
    name: "Thầy đồng", team: "Phe Dân làng", summary: "Một lần trong ván, hỏi thân phận của một người đã chết.",
    objective: "Dùng manh mối từ người đã khuất để tìm Ma sói.",
    power: "Một lần trong cả ván, vào ban đêm bạn có thể chọn một người đã bị loại để biết chính xác vai trò của họ.",
    how: ["Sau khi có người bị loại, chờ lượt Thầy đồng vào ban đêm.", "Chọn một người đã chết trong danh sách.", "Đọc kết quả riêng; bạn không thể dùng năng lực lần thứ hai."],
    tips: "Hãy chọn người mà vai trò của họ có thể giúp giải đáp nhiều nghi vấn nhất.",
    limits: "Chỉ dùng một lần trong cả ván và chỉ chọn người đã bị loại."
  }
  thief: {
    name: "Kẻ trộm", team: "Đặc biệt", summary: "Được đổi thân phận bằng một trong hai lá bài dự phòng ở đêm đầu tiên.",
    objective: "Tiếp tục chơi theo phe và điều kiện thắng của role mà bạn chọn.",
    power: "Ở đêm đầu tiên, chọn một trong hai role dự phòng. Role mới thay thế Kẻ trộm ngay lập tức.",
    how: ["Chờ lượt Kẻ trộm trong đêm đầu.", "Chọn một trong hai lá bài dự phòng.", "Đọc lại hướng dẫn của role mới."],
    tips: "Chọn role phù hợp với số người và diễn biến ván chơi.",
    limits: "Nếu hết giờ, bạn tự động trở thành Dân làng. Hai role dự phòng không được chia cho người khác."
  },
  "white-wolf": {
    name: "Sói trắng", team: "Phe Sói · mục tiêu riêng", summary: "Một biến thể sói có thể săn đồng đội vào các đêm xen kẽ.",
    objective: "Trở thành người sống sót cuối cùng để giành chiến thắng riêng.",
    power: "Từ đêm thứ hai, cứ cách một đêm bạn được chọn một người thuộc phe Sói khác để tấn công. Nếu không còn Sói khác, bạn có thể tấn công một người bất kỳ.",
    how: ["Ban đêm, chờ lượt Sói trắng.", "Chọn mục tiêu hợp lệ.", "Tiếp tục ẩn thân và tìm cách sống sót đến cuối cùng."],
    tips: "Đừng để bầy sói phát hiện mục tiêu riêng của bạn.",
    limits: "Chỉ hành động vào các đêm xen kẽ. Chỉ thắng riêng khi là người sống sót cuối cùng."
  },
  "wolf-cub": {
    name: "Sói con", team: "Phe Ma sói", summary: "Cái chết do dân làng bỏ phiếu loại giúp bầy sói có thêm một đòn tấn công.",
    objective: "Cùng phe Ma sói loại bỏ phe dân.",
    power: "Nếu bị loại bởi bỏ phiếu ban ngày, bầy sói được thêm một lượt tấn công trong đêm kế tiếp.",
    how: ["Tham gia thảo luận như Ma sói.", "Nếu bị dân làng bỏ phiếu loại, hiệu ứng thêm đòn tự kích hoạt.", "Đồng đội dùng lượt tấn công bổ sung vào đêm kế tiếp."],
    tips: "Đồng đội có thể tận dụng lượt tấn công thêm để tạo lợi thế.",
    limits: "Chỉ kích hoạt khi bị loại bằng bỏ phiếu, không kích hoạt khi chết ban đêm hoặc do kỹ năng."
  },
  scapegoat: {
    name: "Người thế thân", team: "Phe Dân làng", summary: "Bị đưa ra thay dân làng khi kết quả bỏ phiếu hòa.",
    objective: "Giúp phe dân tìm và loại bỏ Ma sói.",
    power: "Nếu lượt bỏ phiếu có phiếu nhưng hòa và bạn còn sống, bạn bị loại thay cho kết quả hòa. Trước khi ván tiếp tục, bạn chọn một người không được bỏ phiếu ở lượt kế tiếp.",
    how: ["Không cần hành động ban đêm.", "Nếu bị loại do hòa phiếu, chọn một người còn sống.", "Người được chọn sẽ mất quyền bỏ phiếu ở vòng kế tiếp."],
    tips: "Cân nhắc người có ảnh hưởng lớn đến kết quả bỏ phiếu.",
    limits: "Quyền chọn chỉ dùng một lần khi bị loại do hòa phiếu."
  },
  "pied-piper": {
    name: "Người thổi sáo", team: "Độc lập", summary: "Mỗi đêm mê hoặc hai người chưa bị mê hoặc.",
    objective: "Mê hoặc tất cả người chơi còn sống khác để giành chiến thắng riêng.",
    power: "Mỗi đêm chọn tối đa hai người còn sống khác chưa bị mê hoặc. Trạng thái mê hoặc được giữ qua các ngày.",
    how: ["Chờ lượt Người thổi sáo.", "Chọn hai người chưa bị mê hoặc.", "Tiếp tục cho đến khi tất cả người chơi còn sống khác đều bị mê hoặc."],
    tips: "Ưu tiên mê hoặc những người có khả năng sống lâu.",
    limits: "Không thể tự mê hoặc mình hoặc chọn người đã chết."
  },
  knight: {
    name: "Hiệp sĩ", team: "Phe Dân làng", summary: "Một lần trong ván có thể thách đấu một người vào ban ngày.",
    objective: "Dùng một lần thách đấu để giúp dân làng loại bỏ Ma sói.",
    power: "Trong lúc thảo luận, chọn một người để thách đấu. Nếu mục tiêu thuộc phe Sói, mục tiêu bị loại; nếu không, Hiệp sĩ bị loại.",
    how: ["Chọn một người còn sống trong giai đoạn thảo luận.", "Xác nhận thách đấu một lần duy nhất.", "Chờ quản trò tự động công bố kết quả."],
    tips: "Chỉ thách đấu khi đã có đủ căn cứ.",
    limits: "Chỉ được thách đấu một lần trong cả ván."
  },
  angel: {
    name: "Thiên sứ", team: "Độc lập", summary: "Có mục tiêu chiến thắng đặc biệt trong ngày đầu tiên.",
    objective: "Giành chiến thắng riêng nếu bị dân làng bỏ phiếu loại ở ngày đầu tiên.",
    power: "Nếu bị bỏ phiếu loại ở lần bỏ phiếu đầu tiên, ván kết thúc và Thiên sứ chiến thắng. Nếu sống qua lượt đó, bạn trở thành Dân làng.",
    how: ["Tham gia thảo luận ngày đầu tiên.", "Tìm cách khiến dân làng nghi ngờ và bỏ phiếu cho mình.", "Nếu không bị loại ở ngày đầu, tiếp tục với vai trò Dân làng."],
    tips: "Cân bằng giữa việc gây nghi ngờ và không để Sói tấn công ban đêm.",
    limits: "Chỉ thắng nếu bị loại bằng bỏ phiếu ở ngày đầu tiên, không thắng khi chết ban đêm."
  },
};

function shuffle(a) {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}
const CONFIGURABLE_ROLES = ["seer", "witch", "protector", "cupid", "hunter", "elder", "littleGirl", "mayor", "medium", "thief", "white-wolf", "wolf-cub", "scapegoat", "pied-piper", "knight", "angel"];
function rolesFor(count, settings = {}) {
  const automaticWolfCount = count >= 14 ? 4 : count >= 10 ? 3 : count >= 7 ? 2 : 1;
  const requestedWolfCount = Number(settings.wolfCount) || 0;
  const wolfCount = Math.min(Math.max(1, requestedWolfCount || automaticWolfCount), Math.max(1, count - 2));
  const roles = Array(wolfCount).fill("wolf");
  if (settings.customRoles) {
    const enabled = new Set(Array.isArray(settings.enabledRoles) ? settings.enabledRoles : CONFIGURABLE_ROLES);
    for (const role of CONFIGURABLE_ROLES) if (enabled.has(role) && roles.length < count - 1) roles.push(role);
  } else {
    roles.push("seer", "witch");
    if (count >= 6) roles.push("protector");
    if (count >= 7) roles.push("cupid");
    if (count >= 8) roles.push("hunter");
    if (count >= 9) roles.push("elder");
    if (count >= 10) roles.push("littleGirl");
    if (count >= 11) roles.push("mayor");
    if (count >= 12) roles.push("medium");
  }
  while (roles.length < count) roles.push("villager");
  const assigned = shuffle(roles);
  let reserveRoles = [];
  if (assigned.includes("thief")) {
    const available = [...new Set(["villager", ...CONFIGURABLE_ROLES.filter(role =>
      !assigned.includes(role) && !isWolfTeam(role) && role !== "thief"
    )])];
    reserveRoles = shuffle(available).slice(0, 2);
    while (reserveRoles.length < 2) reserveRoles.push("villager");
  }
  return { roles: assigned, reserveRoles };
}
function clearTimer(room) {
  if (room.timer) clearTimeout(room.timer);
  room.timer = null;
  room.endsAt = null;
}
function sendError(socket, message) { socket.emit("errorMessage", message); }
function alive(room) { return room.players.filter(p => p.alive); }
function wolves(room) { return alive(room).filter(p => isWolfTeam(p.role)); }
function getPlayer(room, id) { return room.players.find(p => p.id === id); }
function checkWin(room) {
  const living = alive(room);
  const packWolfCount = living.filter(p => p.role === "wolf" || p.role === "wolf-cub").length;
  const whiteWolfCount = living.filter(p => p.role === "white-wolf").length;
  const townCount = living.length - packWolfCount - whiteWolfCount;
  const piper = living.find(p => p.role === "pied-piper");
  if (piper && piperHasWon(living, room.enchantedPlayers, piper.id)) {
    room.status = "ended"; room.phase = "ended"; room.winner = "pied-piper";
    room.announcement = "Người thổi sáo đã mê hoặc tất cả người chơi còn sống và giành chiến thắng!";
    addHistoryEvent(room, { message: "Kết thúc ván: Người thổi sáo chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
  if (whiteWolfCount === 1 && living.length === 1) {
    room.status = "ended"; room.phase = "ended"; room.winner = "white-wolf";
    room.announcement = "Sói trắng là người sống sót cuối cùng và giành chiến thắng!";
    addHistoryEvent(room, { message: "Kết thúc ván: Sói trắng chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
  if (room.loverPair && room.loverPair.length === 2) {
    const [a, b] = room.loverPair.map(id => getPlayer(room, id));
    if (a && b && a.alive && b.alive && (isWolfTeam(a.role) !== isWolfTeam(b.role)) && living.length === 2) {
      room.status = "ended"; room.phase = "ended"; room.winner = "lovers";
      room.announcement = "Đôi tình nhân khác phe đã sống sót đến cuối cùng và giành chiến thắng!";
      addHistoryEvent(room, { message: "Kết thúc ván: đôi tình nhân khác phe giành chiến thắng.", kind: "result" });
      clearTimer(room); return true;
    }
  }
  if (packWolfCount === 0 && whiteWolfCount === 0) {
    room.status = "ended"; room.phase = "ended"; room.winner = "town";
    room.announcement = "Dân làng đã tìm ra toàn bộ Ma sói!";
    addHistoryEvent(room, { message: "Kết thúc ván: phe Dân làng chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
  if (packWolfCount > 0 && packWolfCount >= townCount + whiteWolfCount) {
    room.status = "ended"; room.phase = "ended"; room.winner = "wolf";
    room.announcement = "Ma sói đã chiếm ưu thế và chiến thắng!";
    addHistoryEvent(room, { message: "Kết thúc ván: phe Ma sói chiến thắng.", kind: "result" });
    clearTimer(room); return true;
  }
  return false;
}
function plurality(ids) {
  if (!ids.length) return null;
  const counts = new Map();
  ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
  const max = Math.max(...counts.values());
  const tied = [...counts.entries()].filter(x => x[1] === max).map(x => x[0]);
  return tied[Math.floor(Math.random() * tied.length)];
}
function weightedVoteWinner(room) {
  const totals = new Map();
  for (const [voterId, targetId] of Object.entries(room.votes)) {
    const voter = getPlayer(room, voterId);
    if (!voter || !voter.alive) continue;
    const weight = voter.role === "mayor" ? 2 : 1;
    totals.set(targetId, (totals.get(targetId) || 0) + weight);
  }
  if (!totals.size) return null;
  const max = Math.max(...totals.values());
  const leaders = [...totals.entries()].filter(([, value]) => value === max).map(([id]) => id);
  return leaders.length === 1 ? leaders[0] : null;
}
function publicState(room, player) {
  const ended = room.status === "ended";
  const me = player;
  let actionType = null, prompt = "", targets = [], privateInfo = "", actionDone = false;
  if (room.phase === "scapegoatChoice" && me && me.id === room.scapegoatPending) {
    actionType = "scapegoatChoice"; prompt = "Bạn là Người thế thân. Chọn một người còn sống không được bỏ phiếu ở vòng kế tiếp.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
  } else if (room.phase === "deathshot" && me && me.id === room.currentHunterShot) {
    actionType = "hunterShot"; prompt = "Bạn là Thợ săn. Chọn một người còn sống để bắn phát súng cuối cùng.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
  } else if (room.phase === "night" && me && me.alive) {
    const sub = room.subphase;
    if (sub === "thief" && me.role === "thief") {
      actionType = "thief"; prompt = "Chọn một trong hai lá bài dự phòng để đổi role.";
      targets = room.reserveRoles.map(roleId => ({ id: roleId, name: (ROLE_GUIDES[roleId] || {}).name || "Dân làng" }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "cupid" && me.role === "cupid") {
      actionType = "cupid"; prompt = "Đêm đầu tiên: chọn hai người để ghép thành đôi tình nhân.";
      targets = alive(room).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "protect" && me.role === "protector") {
      actionType = "protect"; prompt = "Chọn một người để bảo vệ đêm nay.";
      targets = alive(room).filter(p => p.id !== room.lastProtected).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "wolves" && isWolfTeam(me.role)) {
      actionType = "wolf"; prompt = "Bầy sói: hãy chọn mục tiêu chung.";
      targets = alive(room).filter(p => !isWolfTeam(p.role)).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.wolfVotes[me.id];
      privateInfo = "Đồng đội: " + wolves(room).filter(p => p.id !== me.id).map(p => p.name).join(", ");
    } else if (sub === "wolvesBonus" && isWolfTeam(me.role)) {
      actionType = "wolfBonus"; prompt = "Sói con đã bị loại. Bầy sói được thêm một lượt tấn công.";
      targets = alive(room).filter(p => !isWolfTeam(p.role) && p.id !== room.night.wolfTarget).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.wolfBonusVotes[me.id];
    } else if (sub === "whiteWolf" && me.role === "white-wolf") {
      actionType = "whiteWolf"; prompt = "Sói trắng: chọn mục tiêu tấn công riêng.";
      const packTargets = wolves(room).filter(p => p.id !== me.id);
      targets = (packTargets.length ? packTargets : alive(room).filter(p => p.id !== me.id)).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "piper" && me.role === "pied-piper") {
      actionType = "piper"; prompt = "Chọn tối đa hai người còn sống chưa bị mê hoặc.";
      targets = alive(room).filter(p => p.id !== me.id && !room.enchantedPlayers.has(p.id)).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "wolves" && me.role === "littleGirl") {
      actionType = "peek"; prompt = "Bạn có thể lén quan sát Ma sói trong đêm nay.";
      actionDone = !!room.night.peeked[me.id];
    } else if (sub === "seer" && me.role === "seer") {
      actionType = "seer"; prompt = "Chọn một người để soi thân phận.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
    } else if (sub === "medium" && me.role === "medium") {
      actionType = "medium"; prompt = "Chọn một người đã bị loại để hỏi thân phận.";
      targets = room.players.filter(p => !p.alive).map(p => ({ id: p.id, name: p.name }));
      actionDone = room.mediumUsed || !!room.night.done[me.id];
    } else if (sub === "witch" && me.role === "witch") {
      actionType = "witch"; prompt = "Phù thủy, hãy quyết định có sử dụng một bình thuốc không.";
      targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
      actionDone = !!room.night.done[me.id];
      privateInfo = room.night.wolfTarget ? ("Người bị Ma sói nhắm đến: " + ((getPlayer(room, room.night.wolfTarget) || {}).name || "không rõ")) : "Đêm nay Ma sói chưa chọn được mục tiêu.";
    }
  }
  if (room.phase === "discussion" && me && me.alive && me.role === "knight" && !room.knightUsed.has(me.id)) {
    actionType = "knightChallenge"; prompt = "Bạn có một lần thách đấu trong lúc thảo luận.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
  }
  if (room.phase === "vote" && me && me.alive && !room.voteExcluded.has(me.id)) {
    actionType = "vote"; prompt = "Bỏ phiếu kín: chọn người bạn muốn đưa ra xét xử.";
    targets = alive(room).filter(p => p.id !== me.id).map(p => ({ id: p.id, name: p.name }));
    actionDone = !!room.votes[me.id];
  }
  const notes = me && room.privateNotes[me.id] ? room.privateNotes[me.id] : "";
  const guide = me && me.roleRevealed ? ROLE_GUIDES[me.role] : null;
  if (me && me.roleRevealed && me.role === "cupid" && room.loverPair) {
    const pairNames = room.loverPair.map(id => (getPlayer(room, id) || {}).name).filter(Boolean);
    privateInfo = "Đôi tình nhân bạn đã ghép: " + pairNames.join(" và ");
  }
  const others = room.players.map(p => ({
    id: p.id, name: p.name, alive: p.alive, ready: p.ready, connected: p.connected,
    isHost: p.id === room.hostId,
    canManage: !!player && player.id === room.hostId && room.status === "lobby" && p.id !== room.hostId,
    pose: playerPose(room, me, p, actionType),
    role: ended ? (ROLE_GUIDES[p.role] || {}).name : undefined
  }));
  return {
    code: room.code, status: room.status, phase: room.phase, subphase: "",
    day: room.day, players: others, playerCount: room.players.length,
    settings: room.settings, endsAt: room.endsAt, announcement: room.announcement,
    winner: room.winner, chat: room.chat.slice(-35), history: visibleHistory(room, player),
    self: me ? {
      id: me.id, name: me.name, alive: me.alive, ready: me.ready,
      role: me.roleRevealed ? me.role : undefined,
      roleRevealed: !!me.roleRevealed, roleSeen: !!me.roleSeen,
      isHost: me.id === room.hostId,
      roleName: guide ? guide.name : "", roleDescription: guide ? guide.summary : "",
      guide, actionType, prompt, targets, actionDone, privateInfo, privateNote: notes,
      witchSaveAvailable: !!me.roleRevealed && me.role === "witch" && room.witchSaveAvailable,
      witchPoisonAvailable: !!me.roleRevealed && me.role === "witch" && room.witchPoisonAvailable,
      wolfMates: !!me.roleRevealed && isWolfTeam(me.role) ? wolves(room).filter(p => p.id !== me.id).map(p => p.name) : [],
      roleChoices: !!me.roleRevealed && me.role === "thief" ? room.reserveRoles.map(roleId => ({ id: roleId, name: (ROLE_GUIDES[roleId] || {}).name || "Dân làng" })) : [],
      voteRestricted: !!me.alive && room.phase === "vote" && room.voteExcluded.has(me.id),
      loverName: !!me.roleRevealed && room.loverPair && room.loverPair.includes(me.id) ? ((getPlayer(room, room.loverPair.find(id => id !== me.id)) || {}).name || "") : "",
      mayorVoteWeight: !!me.roleRevealed && me.role === "mayor" && me.alive ? 2 : 1
    } : null,
    canStart: !!player && player.id === room.hostId && room.status === "lobby" && room.players.length >= 5 && room.players.length <= room.settings.maxPlayers && (room.settings.wolfCount === 0 || room.settings.wolfCount <= room.players.length - 2) && room.players.every(p => p.ready),
    voteReadyCount: room.voteReady.size,
    isRevealed: ended
  };
}
function broadcast(room) {
  room.players.forEach(p => { if (p.socketId) io.to(p.socketId).emit("state", publicState(room, p)); });
}
function addChat(room, player, message) {
  room.chat.push({ id: randomId(4), name: player.name, message: String(message).trim().slice(0, 240), time: Date.now(), alive: player.alive });
  room.chat = room.chat.slice(-50);
}
function setTimer(room, seconds, callback) {
  clearTimer(room);
  room.endsAt = Date.now() + seconds * 1000;
  room.timer = setTimeout(callback, seconds * 1000);
}
function createRoomObject(code, player) {
  return {
    code, players: [player], hostId: player.id, hostTransferTimer: null, kickedTokens: new Set(), kickedNames: new Set(), status: "lobby", phase: "lobby", subphase: "",
    settings: {
      discussionSeconds: 180, voteSeconds: 45, nightSeconds: 35,
      dealSeconds: 4, roleRevealSeconds: 25,
      maxPlayers: 16, wolfCount: 0, customRoles: false, enabledRoles: CONFIGURABLE_ROLES.slice()
    },
    day: 0, timer: null, endsAt: null, announcement: "Đang chờ mọi người tham gia.",
    winner: null, night: null, votes: {}, voteReady: new Set(), chat: [], history: [],
    privateNotes: {}, witchSaveAvailable: true, witchPoisonAvailable: true,
    lastProtected: null, elderShieldUsed: false, mediumUsed: false,
    loverPair: null, hunterShotUsed: new Set(), hunterQueue: [],
    currentHunterShot: null, afterDeathCallback: null, pendingDeathNames: [],
    reserveRoles: [], wolfExtraAttack: false, enchantedPlayers: new Set(),
    knightUsed: new Set(), scapegoatPending: null, noVoteNextVote: new Set(), voteExcluded: new Set()
  };
}
function joinPlayer(socket, room, player, token) {
  player.socketId = socket.id; player.connected = true;
  if (!room.hostId) room.hostId = player.id;
  if (room.hostTransferTimer && player.id === room.hostId) {
    clearTimeout(room.hostTransferTimer); room.hostTransferTimer = null;
  }
  socket.join(room.code);
  socket.emit("joined", { code: room.code, token, playerId: player.id }); broadcast(room);
}
function startGame(room, starterId) {
  if (starterId !== room.hostId) return false;
  if (room.status !== "lobby" || room.players.length < 5 || room.players.length > room.settings.maxPlayers || !room.players.every(p => p.ready)) return false;
  if (room.settings.wolfCount > 0 && room.settings.wolfCount > room.players.length - 2) return false;
  const deck = rolesFor(room.players.length, room.settings);
  room.reserveRoles = deck.reserveRoles;
  room.players.forEach((p, i) => {
    p.role = deck.roles[i]; p.alive = true; p.ready = false;
    p.roleRevealed = false; p.roleSeen = false;
  });
  room.status = "playing"; room.phase = "dealing"; room.subphase = "";
  room.day = 0; room.winner = null;
  room.witchSaveAvailable = true; room.witchPoisonAvailable = true; room.lastProtected = null;
  room.elderShieldUsed = false; room.mediumUsed = false; room.loverPair = null;
  room.hunterShotUsed = new Set(); room.hunterQueue = [];
  room.wolfExtraAttack = false; room.enchantedPlayers = new Set(); room.knightUsed = new Set();
  room.scapegoatPending = null; room.noVoteNextVote = new Set(); room.voteExcluded = new Set();
  room.announcement = "Quản trò đang xáo bài và chuẩn bị chia vai...";
  addHistoryEvent(room, { message: "Quản trò bắt đầu chia bài bí mật cho từng người chơi.", kind: "phase" });
  setTimer(room, room.settings.dealSeconds || 4, () => startRoleReveal(room));
  return true;
}
function startRoleReveal(room) {
  if (room.status !== "playing" || room.phase !== "dealing") return;
  room.phase = "roleReveal";
  room.announcement = "Bài đã được chia. Mỗi người hãy lật thẻ nhân vật của mình.";
  addHistoryEvent(room, { message: "Các lá bài đã được chia. Người chơi bắt đầu xem vai trò riêng.", kind: "phase" });
  broadcast(room);
  setTimer(room, room.settings.roleRevealSeconds || 25, () => completeRoleReveal(room, true));
}
function completeRoleReveal(room, timedOut = false) {
  if (room.status !== "playing" || room.phase !== "roleReveal") return;
  clearTimer(room);
  room.players.forEach(p => {
    p.roleRevealed = true;
    p.roleSeen = true;
  });
  addHistoryEvent(room, {
    message: timedOut
      ? "Hết thời gian xem thẻ. Quản trò tự động chuyển sang đêm đầu tiên."
      : "Tất cả người chơi đã xác nhận xem vai trò.",
    kind: "phase"
  });
  startNight(room);
}
function setNightStep(room, index) {
  const steps = [];
  if (room.day === 0) steps.push("thief", "cupid");
  steps.push("protect", "wolves");
  if (room.wolfExtraAttack) steps.push("wolvesBonus");
  if (room.day % 2 === 1) steps.push("whiteWolf");
  steps.push("seer", "medium", "witch", "piper");
  while (index < steps.length) {
    const step = steps[index];
    const role = step === "protect" ? "protector" : step === "whiteWolf" ? "white-wolf" : step === "piper" ? "pied-piper" : step;
    let players = (step === "wolves" || step === "wolvesBonus") ? wolves(room) : alive(room).filter(p => p.role === role);
    if (step === "medium" && (room.mediumUsed || !room.players.some(p => !p.alive))) players = [];
    if (step === "wolvesBonus") {
      const validTargets = alive(room).filter(p => !isWolfTeam(p.role) && p.id !== room.night.wolfTarget);
      if (!validTargets.length) { room.wolfExtraAttack = false; players = []; }
    }
    if (players.length) {
      room.subphase = step; room.night.stepIndex = index;
      const privateTurnNames = players.map(p => p.id);
      const turnLabel = step === "wolves" || step === "wolvesBonus" ? "Ma sói" : (ROLE_GUIDES[role] || {}).name || role;
      addHistoryEvent(room, { message: "Đến lượt " + turnLabel + " hành động.", visibility: "private", playerIds: privateTurnNames, kind: "private" });
      if (step === "wolves") {
        room.night.wolfVotes = {};
        const littleGirls = alive(room).filter(p => p.role === "littleGirl");
        if (littleGirls.length) addHistoryEvent(room, { message: "Bạn có thể quan sát lén bầy sói trong lượt này.", visibility: "private", playerIds: littleGirls.map(p => p.id), kind: "private" });
      }
      if (step === "wolvesBonus") room.night.wolfBonusVotes = {};
      room.night.done = room.night.done || {};
      room.announcement = "Đêm đang diễn ra. Hãy chờ lượt của bạn.";
      broadcast(room); setTimer(room, room.settings.nightSeconds, () => advanceNight(room)); return;
    }
    index++;
  }
  resolveNight(room);
}
function startNight(room) {
  if (room.status !== "playing") return;
  clearTimer(room);
  room.phase = "nightIntro"; room.subphase = "";
  room.night = { protectTarget: null, wolfVotes: {}, wolfTarget: null, wolfBonusVotes: {}, wolfBonusTarget: null, whiteWolfTarget: null, seerTarget: null, witchSave: false, witchPoisonTarget: null, done: {}, peeked: {} };
  room.privateNotes = {}; room.voteReady = new Set();
  room.announcement = "Trời đã tối. Tất cả dân làng đi ngủ.";
  addHistoryEvent(room, { message: room.day === 0 ? "Đêm đầu tiên bắt đầu." : "Đêm " + (room.day + 1) + " bắt đầu.", kind: "phase" });
  broadcast(room);
  setTimer(room, 1800, () => {
    if (room.status !== "playing" || room.phase !== "nightIntro") return;
    room.phase = "night";
    room.announcement = "Đêm đang diễn ra. Hãy chờ lượt của bạn.";
    broadcast(room);
    setNightStep(room, 0);
  });
}
function advanceNight(room) {
  if (room.status !== "playing" || room.phase !== "night") return;
  if (room.subphase === "thief") {
    const thief = alive(room).find(p => p.role === "thief" && !room.night.done[p.id]);
    if (thief) { thief.role = room.reserveRoles[0] || "villager"; room.privateNotes[thief.id] = "Hết giờ chọn bài. Bạn được chuyển thành " + ((ROLE_GUIDES[thief.role] || {}).name || "Dân làng") + "."; room.reserveRoles = []; }
  }
  if (room.subphase === "wolves" && !room.night.wolfTarget) room.night.wolfTarget = plurality(Object.values(room.night.wolfVotes));
  if (room.subphase === "wolvesBonus" && !room.night.wolfBonusTarget) { room.night.wolfBonusTarget = plurality(Object.values(room.night.wolfBonusVotes || {})); room.wolfExtraAttack = false; }
  clearTimer(room); setNightStep(room, room.night.stepIndex + 1);
}
function applyDeathChain(room, ids) {
  const queue = [...ids], visited = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const p = getPlayer(room, id);
    if (!p || !p.alive) continue;
    p.alive = false; room.pendingDeathNames.push(p.name);
    if (p.role === "hunter" && !room.hunterShotUsed.has(p.id) && !room.hunterQueue.includes(p.id)) room.hunterQueue.push(p.id);
    if (room.loverPair && room.loverPair.includes(p.id)) {
      const partnerId = room.loverPair.find(x => x !== p.id);
      const partner = getPlayer(room, partnerId);
      if (partner && partner.alive) queue.push(partnerId);
    }
  }
}
function beginAfterDeaths(room, ids, callbackName) {
  room.pendingDeathNames = [];
  room.afterDeathCallback = callbackName;
  applyDeathChain(room, ids);
  if (room.hunterQueue.length) startHunterShot(room);
  else continueAfterDeaths(room);
}
function startHunterShot(room) {
  const hunterId = room.hunterQueue.shift();
  if (!hunterId) return continueAfterDeaths(room);
  room.currentHunterShot = hunterId; room.phase = "deathshot"; room.subphase = "";
  room.announcement = "Một phát súng cuối cùng sắp vang lên...";
  broadcast(room);
  setTimer(room, 20, () => resolveHunterShot(room, null));
}
function resolveHunterShot(room, targetId) {
  if (room.phase !== "deathshot" || !room.currentHunterShot) return;
  clearTimer(room);
  const hunterId = room.currentHunterShot;
  room.hunterShotUsed.add(hunterId);
  room.currentHunterShot = null;
  const target = targetId && getPlayer(room, targetId);
  if (target && target.alive) {
    addHistoryEvent(room, { message: "Phát súng cuối đã khiến " + target.name + " bị loại.", kind: "result" });
    applyDeathChain(room, [target.id]);
  } else {
    addHistoryEvent(room, { message: "Phát súng cuối đã không được sử dụng.", kind: "result" });
  }
  if (room.hunterQueue.length) startHunterShot(room);
  else continueAfterDeaths(room);
}
function continueAfterDeaths(room) {
  if (room.hunterQueue.length) return startHunterShot(room);
  const callback = room.afterDeathCallback;
  room.afterDeathCallback = null;
  if (callback === "afterNight") finishNightAfterDeaths(room);
  else if (callback === "afterVote") finishVoteAfterDeaths(room);
  else if (callback === "afterScapegoat") {
    if (!room.scapegoatPending || !alive(room).length) { room.scapegoatPending = null; return finishVoteAfterDeaths(room); }
    room.phase = "scapegoatChoice"; room.subphase = "";
    room.announcement = "Người thế thân đã bị loại và đang chọn người mất quyền bỏ phiếu ở vòng kế tiếp.";
    broadcast(room); setTimer(room, 15, () => { room.scapegoatPending = null; finishVoteAfterDeaths(room); });
  } else if (callback === "afterKnight") {
    if (checkWin(room)) { broadcast(room); return; }
    room.phase = "discussion"; room.subphase = "";
    room.announcement = "Thách đấu đã kết thúc. Dân làng tiếp tục thảo luận.";
    broadcast(room); setTimer(room, room.settings.discussionSeconds, () => startVote(room));
  }
}
function resolveNight(room) {
  clearTimer(room);
  const deaths = [];
  const target = room.night.wolfTarget;
  if (target && target !== room.night.protectTarget && !(room.night.witchSave && target)) {
    const victim = getPlayer(room, target);
    if (victim && victim.alive && victim.role === "elder" && !room.elderShieldUsed) {
      room.elderShieldUsed = true;
      room.announcement = "Đêm qua, có người đã sống sót sau một đòn tấn công!";
    } else deaths.push(target);
  }
  for (const extraTarget of [room.night.wolfBonusTarget, room.night.whiteWolfTarget, room.night.witchPoisonTarget]) {
    if (extraTarget && !deaths.includes(extraTarget)) deaths.push(extraTarget);
  }
  if (room.night.protectTarget) room.lastProtected = room.night.protectTarget;
  else room.lastProtected = null;
  beginAfterDeaths(room, deaths, "afterNight");
}
function finishNightAfterDeaths(room) {
  if (room.status !== "playing") return;
  const names = room.pendingDeathNames;
  room.announcement = names.length
    ? ("Trời sáng! Người không qua khỏi đêm nay: " + names.join(", ") + ".")
    : (room.announcement.includes("sống sót sau") ? room.announcement : "Trời sáng! Đêm qua không có ai bị loại.");
  addHistoryEvent(room, {
    message: names.length
      ? "Bình minh: " + names.join(", ") + " bị loại trong đêm."
      : (room.announcement.includes("sống sót sau") ? "Bình minh: Có người đã sống sót sau một đòn tấn công." : "Bình minh: Đêm qua không có ai bị loại."),
    kind: "result"
  });
  if (checkWin(room)) { broadcast(room); return; }
  room.phase = "daybreak"; room.subphase = ""; room.day += 1; room.voteReady = new Set();
  addHistoryEvent(room, { message: "Bình minh đã đến. Dân làng thức dậy.", kind: "phase" });
  broadcast(room);
  setTimer(room, 2400, () => startDiscussion(room));
}
function startDiscussion(room) {
  if (room.status !== "playing" || room.phase !== "daybreak") return;
  room.phase = "discussion"; room.subphase = "";
  room.announcement = "Mọi người đã thức dậy. Bắt đầu thảo luận!";
  addHistoryEvent(room, { message: "Ngày " + room.day + " bắt đầu. Thảo luận được mở.", kind: "phase" });
  broadcast(room);
  setTimer(room, room.settings.discussionSeconds, () => startVote(room));
}
function startVote(room) {
  if (room.status !== "playing") return;
  clearTimer(room); room.phase = "vote"; room.subphase = ""; room.votes = {}; room.voteReady = new Set();
  room.voteExcluded = new Set(room.noVoteNextVote); room.noVoteNextVote.clear();
  room.announcement = "Thời gian thảo luận kết thúc. Hãy bỏ phiếu kín!";
  addHistoryEvent(room, { message: "Ngày " + room.day + ": bắt đầu bỏ phiếu kín.", kind: "phase" });
  broadcast(room); setTimer(room, room.settings.voteSeconds, () => resolveVote(room));
}
function resolveVote(room) {
  if (room.status !== "playing" || room.phase !== "vote") return;
  clearTimer(room);
  const targetId = weightedVoteWinner(room);
  const target = targetId && getPlayer(room, targetId);
  const hasVotes = Object.keys(room.votes).length > 0;
  if (target && target.alive && angelWinsOnVote(target.role, room.day)) {
    target.alive = false; room.pendingDeathNames = [target.name];
    room.status = "ended"; room.phase = "ended"; room.winner = "angel";
    room.announcement = "Thiên sứ đã bị dân làng bỏ phiếu loại ngay ngày đầu tiên và giành chiến thắng!";
    addHistoryEvent(room, { message: "Kết thúc ván: Thiên sứ chiến thắng nhờ bị loại ở lần bỏ phiếu đầu tiên.", kind: "result" });
    clearTimer(room); broadcast(room); return;
  }
  if (room.day === 1) {
    const angel = alive(room).find(p => p.role === "angel");
    if (angel) {
      angel.role = "villager";
      room.privateNotes[angel.id] = "Bạn đã sống qua lần bỏ phiếu đầu tiên. Thiên sứ chuyển thành Dân làng.";
      addHistoryEvent(room, { message: "Bạn đã trở thành Dân làng sau ngày đầu tiên.", visibility: "private", playerIds: [angel.id], kind: "private" });
    }
  }
  if (target && target.alive) {
    if (target.role === "wolf-cub") room.wolfExtraAttack = true;
    beginAfterDeaths(room, [target.id], "afterVote");
  } else {
    const scapegoat = hasVotes ? chooseScapegoat(alive(room)) : null;
    if (scapegoat) {
      room.scapegoatPending = scapegoat.id;
      room.announcement = "Kết quả bỏ phiếu hòa. Người thế thân phải chịu thay.";
      beginAfterDeaths(room, [scapegoat.id], "afterScapegoat");
    } else {
      room.pendingDeathNames = [];
      room.announcement = "Kết quả bỏ phiếu hòa hoặc không đủ phiếu. Không ai bị loại.";
      finishVoteAfterDeaths(room);
    }
  }
}
function finishVoteAfterDeaths(room) {
  if (room.status !== "playing") return;
  if (room.pendingDeathNames.length) room.announcement = "Kết quả bỏ phiếu: " + room.pendingDeathNames.join(", ") + " bị loại.";
  addHistoryEvent(room, {
    message: room.pendingDeathNames.length
      ? "Kết quả bỏ phiếu: " + room.pendingDeathNames.join(", ") + " bị loại."
      : "Kết quả bỏ phiếu hòa hoặc không đủ phiếu. Không ai bị loại.",
    kind: "result"
  });
  if (checkWin(room)) { broadcast(room); return; }
  room.phase = "intermission"; room.subphase = "";
  broadcast(room); setTimer(room, 3.5, () => { if (room.status === "playing") startNight(room); });
}
function handleNightAction(socket, room, player, data) {
  if (!player || room.status !== "playing" || room.phase !== "night" || !player.alive) return;
  const sub = room.subphase;
  const target = getPlayer(room, data && data.targetId);
  if (sub === "thief" && player.role === "thief") {
    if (room.night.done[player.id]) return sendError(socket, "Bạn đã chọn role rồi.");
    const chosen = String(data && data.targetId || "");
    if (!room.reserveRoles.includes(chosen) || !ROLE_GUIDES[chosen]) return sendError(socket, "Lá bài dự phòng không hợp lệ.");
    player.role = chosen;
    room.privateNotes[player.id] = "Bạn đã đổi thành " + ROLE_GUIDES[chosen].name + ".";
    room.reserveRoles = [];
    addHistoryEvent(room, { message: "Bạn đã chọn lá bài dự phòng: " + ROLE_GUIDES[chosen].name + ".", visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "piper" && player.role === "pied-piper") {
    if (room.night.done[player.id]) return sendError(socket, "Bạn đã mê hoặc trong đêm nay.");
    const ids = Array.isArray(data.targetIds) ? [...new Set(data.targetIds)] : [];
    const available = alive(room).filter(p => p.id !== player.id && !room.enchantedPlayers.has(p.id));
    const required = Math.min(2, available.length);
    if (ids.length !== required || ids.some(id => !available.some(p => p.id === id))) return sendError(socket, "Hãy chọn đúng số người còn sống chưa bị mê hoặc.");
    ids.forEach(id => room.enchantedPlayers.add(id));
    room.privateNotes[player.id] = "Bạn đã mê hoặc: " + ids.map(id => getPlayer(room, id).name).join(" và ") + ".";
    addHistoryEvent(room, { message: room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "whiteWolf" && player.role === "white-wolf") {
    if (room.night.done[player.id]) return sendError(socket, "Bạn đã hành động đêm nay.");
    const otherPack = wolves(room).filter(p => p.id !== player.id);
    const validTarget = target && target.alive && target.id !== player.id && (otherPack.length ? isWolfTeam(target.role) : !isWolfTeam(target.role));
    if (!validTarget) return sendError(socket, "Mục tiêu của Sói trắng không hợp lệ.");
    room.night.whiteWolfTarget = target.id; room.night.done[player.id] = true;
    addHistoryEvent(room, { message: "Bạn đã chọn mục tiêu riêng trong đêm.", visibility: "private", playerIds: [player.id], kind: "private" });
    advanceNight(room); return;
  }
  if (sub === "wolvesBonus" && isWolfTeam(player.role)) {
    if (room.night.wolfBonusVotes[player.id]) return sendError(socket, "Bạn đã bỏ phiếu cho lượt tấn công bổ sung.");
    if (!target || !target.alive || isWolfTeam(target.role) || target.id === room.night.wolfTarget) return sendError(socket, "Mục tiêu của lượt tấn công bổ sung không hợp lệ.");
    room.night.wolfBonusVotes[player.id] = target.id;
    const pack = wolves(room);
    if (pack.every(p => room.night.wolfBonusVotes[p.id])) {
      room.night.wolfBonusTarget = plurality(pack.map(p => room.night.wolfBonusVotes[p.id]));
      room.wolfExtraAttack = false;
      addHistoryEvent(room, { message: "Bầy sói đã chọn mục tiêu cho đòn tấn công bổ sung.", visibility: "private", playerIds: pack.map(p => p.id), kind: "private" });
      advanceNight(room);
    } else broadcast(room);
    return;
  }
  if (sub === "cupid" && player.role === "cupid") {
    if (room.night.done[player.id]) return sendError(socket, "Bạn đã ghép đôi rồi.");
    const ids = Array.isArray(data.targetIds) ? [...new Set(data.targetIds)] : [];
    if (ids.length !== 2 || ids.some(id => !getPlayer(room, id) || !getPlayer(room, id).alive)) return sendError(socket, "Hãy chọn đúng hai người còn sống.");
    room.loverPair = ids;
    const [a, b] = ids.map(id => getPlayer(room, id));
    room.privateNotes[player.id] = "Bạn đã ghép đôi " + a.name + " và " + b.name + ".";
    room.privateNotes[a.id] = "Bạn là người yêu của " + b.name + ". Nếu người ấy bị loại, bạn cũng sẽ ra đi.";
    room.privateNotes[b.id] = "Bạn là người yêu của " + a.name + ". Nếu người ấy bị loại, bạn cũng sẽ ra đi.";
    addHistoryEvent(room, { message: "Bạn đã ghép đôi " + a.name + " và " + b.name + ".", visibility: "private", playerIds: [player.id, a.id, b.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "wolves" && isWolfTeam(player.role)) {
    if (!target || !target.alive || isWolfTeam(target.role)) return sendError(socket, "Hãy chọn một người còn sống không thuộc phe Ma sói.");
    room.night.wolfVotes[player.id] = target.id;
    const livingWolves = wolves(room);
    if (livingWolves.every(p => room.night.wolfVotes[p.id])) {
      room.night.wolfTarget = plurality(livingWolves.map(p => room.night.wolfVotes[p.id]));
      const targetPlayer = getPlayer(room, room.night.wolfTarget);
      if (targetPlayer) addHistoryEvent(room, { message: "Bầy sói đã thống nhất chọn " + targetPlayer.name + " làm mục tiêu đêm này.", visibility: "private", playerIds: livingWolves.map(p => p.id), kind: "private" });
      advanceNight(room);
    } else broadcast(room);
    return;
  }
  if (sub === "wolves" && player.role === "littleGirl" && data.action === "peek") {
    if (room.night.peeked[player.id]) return;
    room.privateNotes[player.id] = "Bạn lén nhìn thấy phe Ma sói gồm: " + wolves(room).map(p => p.name).join(", ") + ".";
    addHistoryEvent(room, { message: room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.peeked[player.id] = true; broadcast(room); return;
  }
  if (room.night.done[player.id]) return;
  if (sub === "protect" && player.role === "protector") {
    if (!target || !target.alive || target.id === room.lastProtected) return sendError(socket, "Mục tiêu không hợp lệ hoặc đã được bảo vệ đêm trước.");
    room.night.protectTarget = target.id;
    addHistoryEvent(room, { message: "Bạn đã chọn bảo vệ " + target.name + " trong đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "seer" && player.role === "seer") {
    if (!target || !target.alive || target.id === player.id) return sendError(socket, "Hãy chọn một người chơi khác còn sống.");
    room.privateNotes[player.id] = target.name + (isWolfTeam(target.role) ? " thuộc phe Ma sói." : " không thuộc phe Ma sói.");
    addHistoryEvent(room, { message: "Kết quả soi: " + room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "medium" && player.role === "medium") {
    if (room.mediumUsed) return sendError(socket, "Bạn đã sử dụng năng lực Thầy đồng.");
    if (!target || target.alive || !target.role) return sendError(socket, "Hãy chọn một người đã bị loại.");
    room.privateNotes[player.id] = "Linh hồn " + target.name + " tiết lộ vai trò: " + ROLE_GUIDES[target.role].name + ".";
    addHistoryEvent(room, { message: room.privateNotes[player.id], visibility: "private", playerIds: [player.id], kind: "private" });
    room.mediumUsed = true; room.night.done[player.id] = true; advanceNight(room); return;
  }
  if (sub === "witch" && player.role === "witch") {
    const action = data && data.action;
    if (action === "save") {
      if (!room.witchSaveAvailable || !room.night.wolfTarget) return sendError(socket, "Không còn bình cứu hoặc đêm nay không có mục tiêu bị cắn.");
      room.night.witchSave = true; room.witchSaveAvailable = false;
      addHistoryEvent(room, { message: "Bạn đã sử dụng bình cứu trong đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    } else if (action === "poison") {
      if (!room.witchPoisonAvailable || !target || !target.alive) return sendError(socket, "Không còn bình độc hoặc mục tiêu không hợp lệ.");
      room.night.witchPoisonTarget = target.id; room.witchPoisonAvailable = false;
      addHistoryEvent(room, { message: "Bạn đã dùng bình độc lên " + target.name + ".", visibility: "private", playerIds: [player.id], kind: "private" });
    } else if (action === "skip") {
      addHistoryEvent(room, { message: "Bạn đã bỏ qua lượt thuốc đêm này.", visibility: "private", playerIds: [player.id], kind: "private" });
    } else return sendError(socket, "Lựa chọn không hợp lệ.");
    room.night.done[player.id] = true; advanceNight(room); return;
  }
}
function attachPlayer(socket, room, player, token) {
  if (player.socketId && player.socketId !== socket.id) {
    const old = io.sockets.sockets.get(player.socketId); if (old) old.leave(room.code);
  }
  joinPlayer(socket, room, player, token);
}

io.on("connection", (socket) => {
  socket.on("createRoom", (payload) => {
    const name = cleanName(payload && payload.name);
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    let code = makeCode(); while (rooms.has(code)) code = makeCode();
    const token = randomId(18);
    const player = { id: randomId(8), name, token, socketId: null, connected: true, ready: false, alive: true, role: null, roleRevealed: false, roleSeen: false };
    const room = createRoomObject(code, player); rooms.set(code, room); attachPlayer(socket, room, player, token);
  });
  socket.on("joinRoom", (payload) => {
    const code = String(payload && payload.code || "").trim().toUpperCase();
    const name = cleanName(payload && payload.name);
    const token = String(payload && payload.token || "");
    const room = rooms.get(code);
    if (!room) return sendError(socket, "Không tìm thấy phòng. Kiểm tra lại mã phòng nhé.");
    if (token && room.kickedTokens && room.kickedTokens.has(token)) return sendError(socket, "Bạn đã bị chủ phòng mời ra và không thể dùng lại phiên cũ để vào phòng.");
    if (name && room.kickedNames && room.kickedNames.has(name.toLowerCase())) return sendError(socket, "Tên này đã bị chủ phòng chặn khỏi phòng.");
    let player = token ? room.players.find(p => p.token === token) : null;
    if (player) {
      if (player.name.toLowerCase() !== name.toLowerCase() && name) return sendError(socket, "Tên không khớp với phiên chơi đã lưu.");
      return attachPlayer(socket, room, player, token);
    }
    if (!name) return sendError(socket, "Nhập tên của bạn trước nhé.");
    if (room.status !== "lobby") return sendError(socket, "Ván chơi đã bắt đầu. Chỉ người chơi cũ có mã phiên mới vào lại được.");
    if (room.players.length >= room.settings.maxPlayers) return sendError(socket, "Phòng đã đạt giới hạn số người do chủ phòng cài đặt.");
    if (room.players.some(p => p.name.toLowerCase() === name.toLowerCase())) return sendError(socket, "Tên này đã có trong phòng, hãy chọn tên khác.");
    const newToken = randomId(18);
    player = { id: randomId(8), name, token: newToken, socketId: null, connected: true, ready: false, alive: true, role: null, roleRevealed: false, roleSeen: false };
    room.players.push(player); attachPlayer(socket, room, player, newToken);
  });
  socket.on("ready", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return;
    const p = room.players.find(x => x.socketId === socket.id); p.ready = !p.ready; broadcast(room);
  });
  socket.on("startGame", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || p.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền bắt đầu ván chơi.");
    if (!startGame(room, p.id)) return sendError(socket, "Cần ít nhất 5 người và tất cả người chơi phải sẵn sàng.");
    broadcast(room);
  });

  socket.on("revealRole", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "roleReveal") return;
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || player.roleRevealed) return;
    player.roleRevealed = true;
    broadcast(room);
  });

  socket.on("confirmRoleSeen", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "roleReveal") return;
    const player = room.players.find(p => p.socketId === socket.id);
    if (!player || !player.roleRevealed) return sendError(socket, "Hãy lật thẻ để xem role trước nhé.");
    player.roleSeen = true;
    if (allConnectedPlayersConfirmed(room.players)) completeRoleReveal(room, false);
    else broadcast(room);
  });

  socket.on("hostSettings", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể thay đổi cài đặt khi phòng đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới được thay đổi cài đặt.");

    const next = data || {};
    const maxPlayers = Number(next.maxPlayers);
    const discussionSeconds = Number(next.discussionSeconds);
    const voteSeconds = Number(next.voteSeconds);
    const nightSeconds = Number(next.nightSeconds);
    const dealSeconds = Number(next.dealSeconds);
    const roleRevealSeconds = Number(next.roleRevealSeconds);
    const wolfCount = Number(next.wolfCount);
    const customRoles = next.customRoles === true;
    const enabledRoles = Array.isArray(next.enabledRoles)
      ? [...new Set(next.enabledRoles.filter(role => CONFIGURABLE_ROLES.includes(role)))]
      : room.settings.enabledRoles.slice();

    if (!Number.isInteger(maxPlayers) || maxPlayers < 5 || maxPlayers > 16 || maxPlayers < room.players.length) {
      return sendError(socket, "Số người tối đa phải từ 5 đến 16 và không được thấp hơn số người đang có trong phòng.");
    }
    if (!Number.isInteger(discussionSeconds) || discussionSeconds < 30 || discussionSeconds > 300) {
      return sendError(socket, "Thời gian thảo luận phải từ 30 đến 300 giây.");
    }
    if (!Number.isInteger(voteSeconds) || voteSeconds < 15 || voteSeconds > 120) {
      return sendError(socket, "Thời gian bỏ phiếu phải từ 15 đến 120 giây.");
    }
    if (!Number.isInteger(nightSeconds) || nightSeconds < 10 || nightSeconds > 90) {
      return sendError(socket, "Thời gian mỗi lượt ban đêm phải từ 10 đến 90 giây.");
    }
    if (!Number.isInteger(dealSeconds) || dealSeconds < 2 || dealSeconds > 8) {
      return sendError(socket, "Thời gian chia bài phải từ 2 đến 8 giây.");
    }
    if (!Number.isInteger(roleRevealSeconds) || roleRevealSeconds < 10 || roleRevealSeconds > 60) {
      return sendError(socket, "Thời gian xem role phải từ 10 đến 60 giây.");
    }
    if (!Number.isInteger(wolfCount) || wolfCount < 0 || wolfCount > 4) {
      return sendError(socket, "Số Ma sói phải chọn từ Tự động đến 4.");
    }

    room.settings = { discussionSeconds, voteSeconds, nightSeconds, dealSeconds, roleRevealSeconds, maxPlayers, wolfCount, customRoles, enabledRoles };
    room.announcement = "Chủ phòng đã cập nhật cài đặt ván chơi.";
    broadcast(room);
  });
  socket.on("replayGame", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền tạo ván chơi lại.");
    if (room.status !== "ended") return sendError(socket, "Chỉ có thể chơi lại sau khi ván hiện tại kết thúc.");

    clearTimer(room);
    room.status = "lobby";
    room.phase = "lobby";
    room.subphase = "";
    room.day = 0;
    room.winner = null;
    room.night = null;
    room.votes = {};
    room.voteReady = new Set();
    room.chat = [];
    room.history = [];
    room.privateNotes = {};
    room.witchSaveAvailable = true;
    room.witchPoisonAvailable = true;
    room.lastProtected = null;
    room.elderShieldUsed = false;
    room.mediumUsed = false;
    room.loverPair = null;
    room.hunterShotUsed = new Set();
    room.hunterQueue = [];
    room.currentHunterShot = null;
    room.afterDeathCallback = null;
    room.pendingDeathNames = [];
    room.reserveRoles = []; room.wolfExtraAttack = false; room.enchantedPlayers = new Set();
    room.knightUsed = new Set(); room.scapegoatPending = null;
    room.noVoteNextVote = new Set(); room.voteExcluded = new Set();
    room.players.forEach(p => {
      p.role = null;
      p.roleRevealed = false;
      p.roleSeen = false;
      p.alive = true;
      p.ready = false;
    });
    room.announcement = "Ván trước đã kết thúc. Chủ phòng đã mở sảnh cho ván mới — mọi người hãy sẵn sàng nhé!";
    broadcast(room);
  });
  socket.on("kickPlayer", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể kick người chơi khi phòng đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng mới có quyền kick người chơi.");
    const target = getPlayer(room, data && data.targetId);
    if (!target || target.id === host.id) return sendError(socket, "Không thể kick người chơi này.");
    room.kickedTokens.add(target.token);
    room.kickedNames.add(target.name.toLowerCase());
    if (target.socketId) {
      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.emit("kicked", { message: "Bạn đã bị chủ phòng mời ra khỏi phòng." });
        targetSocket.leave(room.code);
      }
    }
    room.players = room.players.filter(p => p.id !== target.id);
    room.announcement = target.name + " đã bị chủ phòng mời ra khỏi phòng.";
    broadcast(room);
  });
  socket.on("transferHost", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "lobby") return sendError(socket, "Chỉ có thể chuyển chủ phòng khi đang ở sảnh chờ.");
    const host = room.players.find(p => p.socketId === socket.id);
    if (!host || host.id !== room.hostId) return sendError(socket, "Chỉ chủ phòng hiện tại mới có quyền chuyển quyền.");
    const target = getPlayer(room, data && data.targetId);
    if (!target || target.id === host.id || !target.connected || !target.socketId) return sendError(socket, "Người được chọn không còn kết nối trong phòng.");
    room.hostId = target.id;
    room.announcement = target.name + " đã trở thành chủ phòng mới.";
    broadcast(room);
  });
  socket.on("nightAction", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    handleNightAction(socket, room, p, data || {}); broadcast(room);
  });
  socket.on("hunterShot", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.phase !== "deathshot" || room.currentHunterShot !== (room.players.find(p => p.socketId === socket.id) || {}).id) return;
    resolveHunterShot(room, data && data.targetId); broadcast(room);
  });
  socket.on("knightChallenge", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const player = room.players.find(p => p.socketId === socket.id);
    const target = getPlayer(room, data && data.targetId);
    if (!player || !player.alive || player.role !== "knight" || room.knightUsed.has(player.id)) return sendError(socket, "Bạn không có quyền thách đấu hoặc đã dùng lượt này.");
    if (!target || !target.alive || target.id === player.id) return sendError(socket, "Mục tiêu thách đấu không hợp lệ.");
    room.knightUsed.add(player.id);
    clearTimer(room);
    const hit = isWolfTeam(target.role);
    room.announcement = hit ? "Hiệp sĩ đã thách đấu đúng một kẻ thuộc phe Sói." : "Hiệp sĩ đã thách đấu nhầm và phải trả giá.";
    addHistoryEvent(room, { message: hit ? "Hiệp sĩ thách đấu thành công." : "Hiệp sĩ thách đấu thất bại.", kind: "result" });
    beginAfterDeaths(room, [hit ? target.id : player.id], "afterKnight");
    broadcast(room);
  });

  socket.on("scapegoatChoice", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "scapegoatChoice") return;
    const player = room.players.find(p => p.socketId === socket.id);
    const target = getPlayer(room, data && data.targetId);
    if (!player || player.id !== room.scapegoatPending || !target || !target.alive || target.id === player.id) return sendError(socket, "Lựa chọn của Người thế thân không hợp lệ.");
    room.noVoteNextVote.add(target.id);
    room.privateNotes[target.id] = "Người thế thân đã chọn bạn không được bỏ phiếu ở lượt kế tiếp.";
    addHistoryEvent(room, { message: "Người thế thân đã chọn một người mất quyền bỏ phiếu ở vòng kế tiếp.", kind: "result" });
    addHistoryEvent(room, { message: "Bạn bị mất quyền bỏ phiếu ở lượt kế tiếp.", visibility: "private", playerIds: [target.id], kind: "private" });
    room.scapegoatPending = null;
    clearTimer(room);
    finishVoteAfterDeaths(room);
  });

  socket.on("vote", (data) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "vote") return;
    const p = room.players.find(x => x.socketId === socket.id);
    const target = getPlayer(room, data && data.targetId);
    if (!p || !p.alive || room.voteExcluded.has(p.id) || !target || !target.alive || p.id === target.id) return sendError(socket, "Phiếu không hợp lệ hoặc bạn đang bị mất quyền bỏ phiếu ở vòng này.");
    if (room.votes[p.id]) return sendError(socket, "Bạn đã bỏ phiếu rồi.");
    room.votes[p.id] = target.id;
    if (alive(room).every(x => room.votes[x.id])) resolveVote(room); else broadcast(room);
  });
  socket.on("readyVote", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive) return;
    room.voteReady.add(p.id);
    if (room.voteReady.size > alive(room).length / 2) startVote(room); else broadcast(room);
  });
  socket.on("chat", (payload) => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room || room.status !== "playing" || room.phase !== "discussion") return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (!p || !p.alive || (p.lastChatAt && Date.now() - p.lastChatAt < 1200)) return;
    const message = String(payload && payload.message || "").trim().slice(0, 240);
    if (!message) return;
    p.lastChatAt = Date.now(); addChat(room, p, message); broadcast(room);
  });
  socket.on("leaveRoom", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    if (p && p.id === room.hostId) {
      if (room.hostTransferTimer) clearTimeout(room.hostTransferTimer);
      const next = room.players.find(x => x.id !== p.id && x.connected && x.socketId);
      room.hostId = next ? next.id : null;
      room.announcement = next ? (next.name + " đã tiếp quản quyền chủ phòng.") : "Chủ phòng đã rời phòng. Người tham gia tiếp theo sẽ trở thành chủ phòng.";
    }
    socket.leave(room.code); broadcast(room);
  });
  socket.on("disconnect", () => {
    const room = [...rooms.values()].find(r => r.players.some(p => p.socketId === socket.id));
    if (!room) return;
    const p = room.players.find(x => x.socketId === socket.id);
    if (p) { p.connected = false; p.socketId = null; }
    if (p && p.id === room.hostId && room.status === "lobby") {
      if (room.hostTransferTimer) clearTimeout(room.hostTransferTimer);
      room.hostTransferTimer = setTimeout(() => {
        room.hostTransferTimer = null;
        const currentHost = getPlayer(room, room.hostId);
        if (currentHost && !currentHost.connected) {
          const next = room.players.find(x => x.id !== currentHost.id && x.connected && x.socketId);
          room.hostId = next ? next.id : null;
          room.announcement = next ? (next.name + " đã tiếp quản quyền chủ phòng vì chủ cũ mất kết nối.") : "Chủ phòng mất kết nối. Người tham gia tiếp theo sẽ trở thành chủ phòng.";
          broadcast(room);
        }
      }, 15000);
    }
    broadcast(room);
  });
});

server.listen(PORT, () => console.log("Ma Sói Online running on port " + PORT));
