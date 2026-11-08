const roles = [
  {id:"wolf",name:"Ma sói",faction:"wolf",factionLabel:"Phe Ma sói",status:"playable",sigil:"狼",summary:"Ẩn mình giữa dân làng và cùng đồng đội săn mục tiêu mỗi đêm.",objective:"Sống sót đến khi số Ma sói còn sống bằng hoặc nhiều hơn số người phe dân còn sống.",skill:"Mỗi đêm, Ma sói cùng bỏ phiếu kín để chọn một người không thuộc phe sói làm mục tiêu.",how:"Chọn mục tiêu cùng đồng đội; ban ngày hòa vào thảo luận và tránh để lộ thân phận.",limits:"Không thể cắn đồng đội. Người đã chết không thể hành động.",note:"Đã có logic chia phe, bỏ phiếu mục tiêu và điều kiện chiến thắng trong phiên bản hiện tại."},
  {id:"villager",name:"Dân làng",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"村",summary:"Không có kỹ năng ban đêm; sức mạnh nằm ở suy luận và lá phiếu.",objective:"Cùng phe dân tìm và loại bỏ toàn bộ Ma sói.",skill:"Tham gia thảo luận ban ngày và bỏ phiếu kín để loại người bị nghi ngờ.",how:"Quan sát lời khai, ghi nhớ diễn biến và phối hợp với những người còn sống.",limits:"Không được chat hoặc bỏ phiếu sau khi bị loại.",note:"Role cơ bản, được tự động thêm khi số người chơi vượt số role đặc biệt."},
  {id:"seer",name:"Tiên tri",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"◈",summary:"Mỗi đêm kiểm tra bí mật một người có thuộc phe sói hay không.",objective:"Tìm Ma sói và cung cấp thông tin đáng tin cậy cho phe dân.",skill:"Chọn một người còn sống để soi. Kết quả chỉ gửi riêng cho Tiên tri: thuộc phe sói hoặc không thuộc phe sói.",how:"Chọn mục tiêu trong lượt Tiên tri; ghi nhớ kết quả và cân nhắc thời điểm công khai.",limits:"Không biết chính xác role của mục tiêu, chỉ biết họ có thuộc phe Ma sói hay không.",note:"Đã triển khai và có kết quả riêng tư theo từng người chơi."},
  {id:"witch",name:"Phù thủy",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"△",summary:"Nắm giữ một bình cứu và một bình độc cho cả ván.",objective:"Dùng thuốc đúng thời điểm để bảo vệ phe dân hoặc loại bỏ mối nguy.",skill:"Có một bình cứu người bị sói nhắm đến và một bình độc để chọn một người còn sống. Mỗi bình dùng một lần.",how:"Đọc thông tin mục tiêu sói; chọn cứu, độc hoặc bỏ qua. Mỗi đêm chỉ chọn một hành động.",limits:"Mỗi bình chỉ dùng một lần trong cả ván; không thể dùng cả hai bình trong cùng một đêm.",note:"Đã triển khai giới hạn số lần dùng thuốc ở phía máy chủ."},
  {id:"protector",name:"Bảo vệ",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"盾",summary:"Chọn một người để che chở khỏi đòn cắn của Ma sói.",objective:"Giữ những người có ích cho phe dân sống sót.",skill:"Mỗi đêm bảo vệ một người còn sống khỏi bị sói cắn.",how:"Chọn một mục tiêu trong lượt Bảo vệ; lựa chọn được giữ bí mật.",limits:"Không thể bảo vệ cùng một người trong hai đêm liên tiếp; không chặn được bình độc.",note:"Đã có kiểm tra mục tiêu bảo vệ ở hai đêm liên tiếp."},
  {id:"hunter",name:"Thợ săn",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"弓",summary:"Có cơ hội nổ phát súng cuối khi bị loại.",objective:"Dùng phát súng cuối để giúp phe dân tìm ra Ma sói.",skill:"Khi bị loại, có 20 giây để chọn một người còn sống bắn theo.",how:"Khi lượt phát súng xuất hiện, chọn một mục tiêu còn sống trong thời gian cho phép.",limits:"Mỗi ván chỉ có một phát súng; không thể bắn người đã bị loại.",note:"Đã triển khai chuỗi tử vong và lượt bắn cuối."},
  {id:"cupid",name:"Thần tình yêu",faction:"independent",factionLabel:"Đặc biệt",status:"playable",sigil:"♡",summary:"Ghép hai người thành đôi tình nhân có chung số phận.",objective:"Nếu đôi tình nhân khác phe là hai người cuối cùng còn sống, họ giành chiến thắng riêng.",skill:"Trong đêm đầu tiên, chọn hai người còn sống. Khi một người chết, người còn lại cũng chết theo.",how:"Chọn đúng hai người trong đêm đầu tiên; theo dõi an nguy của cả đôi.",limits:"Chỉ ghép một lần vào đêm đầu tiên.",note:"Đã triển khai liên kết tình nhân và điều kiện thắng riêng cho đôi khác phe."},
  {id:"elder",name:"Già làng",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"老",summary:"Có thể sống sót sau lần đầu bị Ma sói cắn.",objective:"Sống sót và dùng kinh nghiệm giúp phe dân tìm ra sói.",skill:"Lần đầu bị Ma sói cắn, Già làng sống sót và mất lớp bảo hộ.",how:"Không cần thao tác ban đêm; tiếp tục tham gia thảo luận nếu sống sót.",limits:"Không chống được bình độc hoặc bỏ phiếu loại; chỉ chặn một lần sói cắn.",note:"Đã có cờ trạng thái bảo hộ một lần trong ván."},
  {id:"littleGirl",name:"Cô bé",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"月",summary:"Có thể lén quan sát danh sách Ma sói trong lượt sói thức dậy.",objective:"Thu thập thông tin về phe sói mà không để lộ thân phận.",skill:"Trong lượt Ma sói, bấm Quan sát lén để nhận danh sách sói ở thông tin riêng.",how:"Chờ lượt Ma sói; sử dụng nút Quan sát lén và ghi nhớ danh tính.",limits:"Chỉ quan sát trong lượt Ma sói; thông tin chỉ hiển thị cho Cô bé.",note:"Đã triển khai hành động quan sát riêng tư."},
  {id:"mayor",name:"Thị trưởng",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"徽",summary:"Lá phiếu ban ngày có trọng số gấp đôi.",objective:"Dùng tiếng nói có trọng lượng để giúp dân làng loại đúng người.",skill:"Khi còn sống, phiếu bầu của Thị trưởng được tính là hai phiếu.",how:"Thảo luận và bỏ phiếu như bình thường; hệ thống tự động tính trọng số.",limits:"Chỉ áp dụng cho bỏ phiếu ban ngày khi còn sống.",note:"Đã triển khai tính phiếu có trọng số ở máy chủ."},
  {id:"medium",name:"Thầy đồng",faction:"town",factionLabel:"Phe Dân làng",status:"playable",sigil:"魂",summary:"Một lần trong ván có thể hỏi thân phận của người đã chết.",objective:"Dùng manh mối từ người đã khuất để tìm Ma sói.",skill:"Trong một đêm, chọn một người đã bị loại để biết chính xác role của họ.",how:"Chờ lượt Thầy đồng; chọn một người đã chết và đọc kết quả riêng.",limits:"Chỉ dùng một lần trong cả ván và chỉ chọn người đã bị loại.",note:"Đã triển khai giới hạn một lần sử dụng."},
  {id:"thief",name:"Kẻ trộm",faction:"independent",factionLabel:"Đặc biệt · dự kiến",status:"planned",sigil:"鍵",summary:"Một kẻ tráo đổi vận mệnh trước khi ván chơi bắt đầu.",objective:"Luật thắng cần được chốt cùng bộ role được chọn trước khi đưa vào game.",skill:"Đề xuất: trong đêm đầu, chọn một trong hai role dự phòng và nhận role đó.",how:"Chỉ kích hoạt nếu bộ role có đủ hai lá bài dự phòng.",limits:"Cần xác định cách xử lý nếu hai role dự phòng đều thuộc phe sói hoặc không tương thích.",note:"Bản xem trước. Chưa được chia role và chưa có logic trong ván."},
  {id:"white-wolf",name:"Sói trắng",faction:"wolf",factionLabel:"Phe sói · biến thể",status:"planned",sigil:"白",summary:"Một biến thể Ma sói có mục tiêu chiến thắng riêng.",objective:"Đề xuất: trở thành người sống sót cuối cùng, kể cả khi phải đối đầu với bầy sói.",skill:"Đề xuất: cách đêm có thể chọn một Ma sói khác làm mục tiêu.",how:"Cần xác định rõ chu kỳ hành động và cách ưu tiên mục tiêu.",limits:"Không nên bật chung với luật sói cơ bản trước khi kiểm thử cân bằng.",note:"Bản xem trước. Chưa có logic trong ván."},
  {id:"wolf-cub",name:"Sói con",faction:"wolf",factionLabel:"Phe sói · biến thể",status:"planned",sigil:"幼",summary:"Một role hỗ trợ phe sói bằng hiệu ứng trả đũa.",objective:"Giúp phe sói chiếm ưu thế và đạt điều kiện thắng của phe sói.",skill:"Đề xuất: nếu Sói con bị dân làng bỏ phiếu loại, bầy sói được thêm một lượt tấn công ở đêm kế tiếp.",how:"Hiệu ứng chỉ kích hoạt khi bị loại bởi bỏ phiếu ban ngày.",limits:"Cần quy định tương tác với Bảo vệ, Phù thủy và số lượng sói còn sống.",note:"Bản xem trước. Chưa có logic trong ván."},
  {id:"sorcerer",name:"Pháp sư",faction:"independent",factionLabel:"Độc lập · dự kiến",status:"planned",sigil:"法",summary:"Nhân vật sử dụng phép thuật để tác động đến thông tin hoặc hành động.",objective:"Chưa chốt. Cần chọn rõ Pháp sư thuộc phe dân, phe sói hay phe độc lập.",skill:"Chưa chốt kỹ năng để tránh trùng với Tiên tri hoặc Phù thủy.",how:"Sẽ xác định sau khi chốt phe và điều kiện thắng.",limits:"Không bật trong bộ role chính thức khi luật chưa được thống nhất.",note:"Bản xem trước ý tưởng; chưa có logic trong ván."},
  {id:"false-seer",name:"Nhà tiên tri giả",faction:"wolf",factionLabel:"Phe sói · dự kiến",status:"planned",sigil:"偽",summary:"Vai trò đánh lạc hướng thông tin trong cuộc điều tra.",objective:"Đề xuất: hỗ trợ phe sói giành chiến thắng.",skill:"Đề xuất: khi bị Tiên tri soi, kết quả có thể hiển thị là không thuộc phe sói.",how:"Cần chốt cơ chế có áp dụng với mọi lượt soi hay chỉ một lần.",limits:"Phải xử lý nhất quán với Thầy đồng và các role kiểm tra phe.",note:"Bản xem trước. Chưa có logic trong ván."},
  {id:"ghost",name:"Cô hồn",faction:"independent",factionLabel:"Độc lập · dự kiến",status:"planned",sigil:"影",summary:"Một linh hồn có mục tiêu riêng, tách biệt hai phe chính.",objective:"Chưa chốt điều kiện thắng; cần phân biệt với người chơi đã chết thông thường.",skill:"Có thể thiết kế năng lực tương tác với người sống hoặc thông tin ban đêm.",how:"Cần quy định Cô hồn có được chat, bỏ phiếu và tác động kết quả hay không.",limits:"Chưa thể triển khai nếu chưa thống nhất trạng thái sống/chết và quyền hành động.",note:"Bản xem trước ý tưởng; chưa có logic trong ván."},
  {id:"pied-piper",name:"Người thổi sáo",faction:"independent",factionLabel:"Phe độc lập · dự kiến",status:"planned",sigil:"笛",summary:"Một nhân vật có thể mê hoặc người chơi qua từng đêm.",objective:"Đề xuất: mê hoặc tất cả người chơi còn sống khác để chiến thắng.",skill:"Mỗi đêm chọn một hoặc hai người chưa bị mê hoặc; trạng thái được lưu qua các ngày.",how:"Cần có thông báo riêng cho người bị mê hoặc và bảng đếm mục tiêu.",limits:"Cần định nghĩa việc chết, mất kết nối và chống mê hoặc.",note:"Bản xem trước. Chưa có logic trong ván."},
  {id:"knight",name:"Hiệp sĩ",faction:"town",factionLabel:"Phe Dân · dự kiến",status:"planned",sigil:"劍",summary:"Một chiến binh có thể thách đấu để bảo vệ dân làng.",objective:"Hỗ trợ phe dân loại bỏ Ma sói.",skill:"Đề xuất: một lần trong ván có thể thách đấu một người; kết quả phụ thuộc phe của mục tiêu.",how:"Cần chốt việc Hiệp sĩ có chết nếu thách đấu nhầm hay không.",limits:"Phải quy định thời điểm dùng kỹ năng và tương tác với lượt ban đêm.",note:"Bản xem trước. Chưa có logic trong ván."},
  {id:"angel",name:"Thiên sứ",faction:"independent",factionLabel:"Độc lập · dự kiến",status:"planned",sigil:"翼",summary:"Một nhân vật có điều kiện chiến thắng đặc biệt ở đầu ván.",objective:"Đề xuất: thắng riêng nếu bị dân làng bỏ phiếu loại ở ngày đầu tiên.",skill:"Không cần kỹ năng ban đêm; điều kiện thắng gắn với kết quả bỏ phiếu đầu tiên.",how:"Nếu sống qua ngày đầu, vai trò tiếp tục theo luật phụ được thống nhất.",limits:"Cần chốt ván có kết thúc ngay khi Thiên sứ thắng hay không.",note:"Bản xem trước. Chưa có logic trong ván."}
];

let activeFilter = "all";
const grid = document.getElementById("roleGrid");
const search = document.getElementById("roleSearch");
const empty = document.getElementById("emptyState");
document.getElementById("playableCount").textContent = roles.filter(r => r.status === "playable").length;
document.getElementById("plannedCount").textContent = roles.filter(r => r.status === "planned").length;

const ROLE_ICONS = {
wolf:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M25 43 17 15l29 17q14-8 28 0l29-17-8 31q8 13 4 31-7 30-39 34-32-4-39-34-4-19 4-34Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m39 55 10 5m32-5L71 60M47 77q13 11 26 0M60 60v8m-10 19 10 8 10-8" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
villager:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m18 55 42-34 42 34v48H18Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M45 103V72q15-16 30 0v31M28 60h64M52 46q8-8 16 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
seer:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m60 12 34 35-34 61-34-61Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m26 47 34 13 34-13M60 60v48M45 36l15 24 15-24M60 4v-2M12 47H4m112 0h-8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
witch:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M44 18h32v18l13 13v48q0 9-9 9H40q-9 0-9-9V49l13-13Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M44 18h32M45 36h30M32 70q14-9 28 0t29 0M47 82l8 8 18-20" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
protector:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 10 99 25v29q0 35-39 56Q21 89 21 54V25Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M60 32v55M38 54h44M60 40l7 14-7 14-7-14Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
hunter:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M29 14q73 46 0 92M29 14l62 46-62 46" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 60h83m-15-15 15 15-15 15" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
cupid:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 99 20 61C-1 37 30 8 52 31l8 9 8-9c22-23 53 6 32 30Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="m18 92 78-63m-17 0 17 0 0 17" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
elder:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 16q-24 0-27 25-20 4-16 25 1 17 20 20h46q19-3 20-20 4-21-16-25-3-25-27-25Z" fill="none" stroke="currentColor" stroke-width="3.5"/><path d="M60 86v24m-13-8 13-9 13 9M44 54h2m28 0h2m-30 17q14 10 28 0" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>',
littleGirl:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 9q22 23 3 39 17-6 18-19 19 29-3 47-19 16-39 0-20-19 1-43-1 17 12 18Q49 32 60 9Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M39 88h42v18H39zM34 106h52M48 88V78h24v10" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/></svg>',
mayor:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="m17 40 24 18 19-36 19 36 24-18-9 55H26Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M26 78h68M31 104h58M39 94h42" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="17" cy="34" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="60" cy="17" r="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="103" cy="34" r="6" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
medium:'<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M35 56q0-29 25-29t25 29q0 18 13 27H22q13-9 13-27Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M48 93q3 15 12 15t12-15M60 27V12m-9 0h18M25 46l-9-7m79 7 9-7" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="57" r="5" fill="currentColor"/></svg>'
};
const GENERIC_AVATAR='<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="27" r="14" fill="currentColor"/><path d="M13 72q2-25 27-25t27 25" fill="currentColor"/></svg>';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function roleIconSvg(id) {
  return ROLE_ICONS[id] || '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 12 72 48 108 60 72 72 60 108 48 72 12 60 48 48Z" fill="none" stroke="currentColor" stroke-width="3"/></svg>';
}
function matchesFilter(role) {
  if (activeFilter === "playable") return role.status === "playable";
  if (activeFilter === "planned") return role.status === "planned";
  if (activeFilter === "town" || activeFilter === "wolf" || activeFilter === "independent") return role.faction === activeFilter;
  return true;
}
function renderRoles() {
  const q = search.value.trim().toLocaleLowerCase("vi");
  const filtered = roles.filter(role => matchesFilter(role) && (role.name.toLocaleLowerCase("vi").includes(q) || role.summary.toLocaleLowerCase("vi").includes(q)));
  grid.innerHTML = filtered.map((role, index) => {
    const planned = role.status === "planned";
    return '<article class="role-card" data-role="' + escapeHtml(role.id) + '">' +
      '<div class="card-inner">' +
        '<section class="card-face card-front">' +
          '<div class="card-top"><span class="faction">' + escapeHtml(role.factionLabel) + '</span><span class="status ' + (planned ? "planned" : "") + '">' + (planned ? "SẮP PHÁT TRIỂN" : "ĐANG TRONG GAME") + '</span></div>' +
          '<div class="sigil-wrap"><span class="sigil">' + roleIconSvg(role.id) + '</span></div>' +
          '<h3 class="role-name">' + escapeHtml(role.name) + '</h3>' +
          '<p class="role-summary">' + escapeHtml(role.summary) + '</p>' +
          '<div class="card-bottom"><span class="card-index">ARCHIVE / ' + String(index + 1).padStart(2,"0") + '</span><button class="flip-btn" type="button">Xem năng lực ↗</button></div>' +
        '</section>' +
        '<section class="card-face card-back">' +
          '<div class="card-top"><span class="faction">HỒ SƠ NHÂN VẬT</span><span class="status ' + (planned ? "planned" : "") + '">' + (planned ? "CHƯA CÓ LOGIC" : "ĐÃ TRIỂN KHAI") + '</span></div>' +
          '<h3 class="back-heading">' + escapeHtml(role.name) + '</h3>' +
          '<div class="back-section"><b>MỤC TIÊU</b><p>' + escapeHtml(role.objective) + '</p></div>' +
          '<div class="back-section"><b>KỸ NĂNG</b><p>' + escapeHtml(role.skill) + '</p></div>' +
          '<div class="back-section"><b>CÁCH CHƠI & GIỚI HẠN</b><p>' + escapeHtml(role.how + " " + role.limits) + '</p></div>' +
          '<div class="back-note">' + escapeHtml(role.note) + '</div>' +
          '<div class="card-bottom"><span class="card-index">ROLE FILE</span><button class="flip-btn" type="button">← Lật lại</button></div>' +
        '</section>' +
      '</div>' +
    '</article>';
  }).join("");
  empty.classList.toggle("hidden", filtered.length !== 0);
  grid.querySelectorAll(".role-card .flip-btn").forEach(button => button.addEventListener("click", event => {
    event.stopPropagation();
    button.closest(".role-card").classList.toggle("flipped");
  }));
}
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  activeFilter = button.dataset.filter;
  renderRoles();
}));
search.addEventListener("input", renderRoles);
renderRoles();
