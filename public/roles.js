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
function rolePortraitSvg(id) {
  const palettes = {
    wolf:["#d7a09a","#6e3c43","#211a25"],villager:["#d5b27d","#77563c","#2a211e"],
    seer:["#b9a9e9","#58477f","#201b35"],witch:["#c49bd7","#694274","#25192d"],
    protector:["#b7cbdc","#536e88","#192a3b"],hunter:["#d7a36e","#79502f","#281d18"],
    cupid:["#e7a5b8","#8d4c70","#2e1a30"],elder:["#d1c0a0","#78664f","#29221e"],
    littleGirl:["#b5cddd","#607d96","#202a39"],mayor:["#e4c783","#8a6836","#30251c"],
    medium:["#c3cce1","#66728e","#222638"],thief:["#d0b0a6","#60454c","#241c25"],
    "white-wolf":["#e4edf3","#8497a8","#27313d"],"wolf-cub":["#d9a18b","#84534b","#2b2025"],
    "pied-piper":["#a9d0c2","#4e8176","#1c302e"],knight:["#d8c99d","#81704c","#292820"],
    angel:["#eee2b8","#9b8958","#302b20"],sorcerer:["#c2a4dc","#62457b","#251a31"],
    "false-seer":["#c2a8e0","#56436f","#211a30"],ghost:["#c2d5e4","#637b94","#1b2632"]
  };
  const p=palettes[id]||palettes.villager;
  const sid=String(id).replace(/[^a-z0-9-]/gi,"");
  const wolf=["wolf","white-wolf","wolf-cub"].includes(id);
  const hairColor= id==="elder" ? "#e5dfd0" : id==="littleGirl" ? "#a36d4c" : id==="seer"||id==="witch"||id==="sorcerer" ? "#211c2a" : "#3a2928";
  const headwear={
    villager:'<path d="M69 92Q49 63 59 48Q81 28 143 48Q163 61 150 91L137 82 80 82Z" fill="#8c6843" stroke="#e1c18b" stroke-width="4"/><path d="M52 87Q109 70 162 88" fill="none" stroke="#d8b87c" stroke-width="8"/>',
    seer:'<path d="M68 107Q39 45 92 31Q143 16 170 70L154 111 143 87 127 75 110 87 94 74 78 93Z" fill="#332843" stroke="#c7b4ee" stroke-width="4"/><path d="M80 59Q116 36 148 63" fill="none" stroke="#8e7ab7" stroke-width="4"/>',
    witch:'<path d="M57 87 104 7 177 85 137 72 108 65 81 78Z" fill="#30213a" stroke="#d8b2e8" stroke-width="4"/><path d="M70 87Q116 68 165 89" fill="none" stroke="#b58acb" stroke-width="8"/><circle cx="108" cy="57" r="7" fill="#e4c4f2"/>',
    protector:'<path d="M65 94V56L111 25 157 56V94L139 82 111 72 83 82Z" fill="#536b82" stroke="#d9e6ee" stroke-width="4"/><path d="M111 33V77M91 55h40" stroke="#f0dcb0" stroke-width="4"/>',
    hunter:'<path d="M60 99Q47 48 111 29Q168 41 161 99L144 83 112 71 81 86Z" fill="#514032" stroke="#d7b17b" stroke-width="4"/><path d="M72 87Q112 68 151 88" fill="none" stroke="#b88b57" stroke-width="5"/>',
    cupid:'<path d="M72 74Q48 34 79 39Q94 40 111 61Q128 39 144 39Q175 37 149 76" fill="none" stroke="#f1d4dc" stroke-width="7"/><circle cx="111" cy="44" r="7" fill="#e9b5c6"/>',
    elder:'<path d="M64 100Q46 42 111 34Q175 42 158 101L143 84 111 74 79 87Z" fill="#c9c2b3" stroke="#eee6d5" stroke-width="4"/><path d="M77 63Q111 46 145 63" fill="none" stroke="#f5efe2" stroke-width="5"/>',
    littleGirl:'<path d="M61 116Q33 43 89 30L111 18 134 30Q188 42 160 116L145 96 111 83 77 98Z" fill="#354a60" stroke="#c9dce9" stroke-width="4"/><path d="M84 37Q111 8 140 37" fill="none" stroke="#b8d1e2" stroke-width="5"/>',
    mayor:'<path d="m65 88 10-43 24 27 12-48 13 48 24-27 10 43Z" fill="#a57d3c" stroke="#f4dc9e" stroke-width="4"/><circle cx="111" cy="28" r="8" fill="#fff0bc"/>',
    medium:'<path d="M61 105Q39 42 91 28Q145 13 164 80L145 101 133 78 111 66 88 82 73 99Z" fill="#3b465b" stroke="#d9e0ee" stroke-width="4"/><path d="M85 53Q111 36 139 53" fill="none" stroke="#aebbd0" stroke-width="5"/>',
    thief:'<path d="M57 92Q48 42 111 27Q174 42 165 92L145 80 111 71 78 82Z" fill="#27242d" stroke="#bda6a2" stroke-width="4"/><path d="M73 106Q111 89 149 106L142 126H80Z" fill="#302b34" stroke="#bda6a2" stroke-width="3"/>',
    "white-wolf":'<path d="M64 107 47 36 92 75Q111 60 130 75L175 36 158 108" fill="#dce9f0" stroke="#f6fbff" stroke-width="4"/><path d="M83 66 111 48 140 66" fill="none" stroke="#a7bfce" stroke-width="5"/>',
    "wolf-cub":'<path d="M70 103 58 45 95 78Q111 66 127 78L164 45 152 103" fill="#9a645a" stroke="#efc4ad" stroke-width="4"/><path d="M88 72 111 57 135 72" fill="none" stroke="#d79a87" stroke-width="4"/>',
    "pied-piper":'<path d="M61 89Q57 46 111 30Q162 42 161 90L145 78 111 67 80 80Z" fill="#436d64" stroke="#b4d7c7" stroke-width="4"/><path d="m132 39 24-18 7 31" fill="#a8cdbb" stroke="#d8eee0" stroke-width="3"/>',
    knight:'<path d="M64 107V54L111 22 158 54V107L139 88 111 78 83 88Z" fill="#737b82" stroke="#e1d7c1" stroke-width="4"/><path d="M111 30V87M85 58h52" stroke="#f1dfb9" stroke-width="5"/><path d="M90 94h42" stroke="#303b48" stroke-width="5"/>',
    angel:'<ellipse cx="111" cy="35" rx="39" ry="10" fill="none" stroke="#f3dfa7" stroke-width="5"/><path d="M66 105Q24 48 49 40Q73 35 95 92M156 105Q198 48 173 40Q149 35 127 92" fill="none" stroke="#f6edda" stroke-width="9"/>',
    sorcerer:'<path d="M58 93 111 7 173 93 143 78 111 65 79 82Z" fill="#33243e" stroke="#d8b8ed" stroke-width="4"/><path d="M111 19V59M97 39h28" stroke="#f2ddff" stroke-width="4"/>',
    "false-seer":'<path d="M66 98Q42 43 111 29Q177 43 156 98L140 81 111 70 82 83Z" fill="#34283f" stroke="#c6b0e5" stroke-width="4"/><path d="M70 116Q111 96 152 116" fill="none" stroke="#dfc8f1" stroke-width="10"/>',
    ghost:'<path d="M65 114Q53 34 111 25Q170 34 158 114L145 101 128 112 111 101 94 112 77 101Z" fill="#b9d0df" fill-opacity=".7" stroke="#e6f3fb" stroke-width="4"/>'
  };
  const props={
    seer:'<circle cx="190" cy="207" r="30" fill="#a58ce5" fill-opacity=".25" stroke="#d9c8ff" stroke-width="3"/><circle cx="190" cy="207" r="15" fill="#d8c8ff" fill-opacity=".65"/><path d="M190 166v-12m0 94v-12m-41-29h-12m94 0h-12" stroke="#d9c8ff" stroke-width="3"/>',
    witch:'<path d="M182 188h30l-4 60q-12 15-24 0Z" fill="#6e4a83" stroke="#e3c5f0" stroke-width="3"/><path d="M182 209h30" stroke="#d5a8e6" stroke-width="5"/><circle cx="197" cy="224" r="7" fill="#a9dfbb"/>',
    protector:'<path d="M47 179 78 191 74 246Q62 265 47 274 30 262 20 246L16 191Z" fill="#496783" stroke="#d9e6ed" stroke-width="4"/><path d="M47 199v54m-20-28h40" stroke="#e8d8b5" stroke-width="4"/>',
    hunter:'<path d="M209 98Q253 161 207 234" fill="none" stroke="#d6ae78" stroke-width="5"/><path d="M208 98 177 165 208 234" fill="none" stroke="#f0d3a2" stroke-width="2"/><path d="M174 165h54" stroke="#e4c38e" stroke-width="3"/>',
    cupid:'<path d="M44 185Q14 157 25 202Q37 234 76 242M44 185Q14 213 25 168" fill="none" stroke="#efb9ca" stroke-width="5"/><path d="M27 183h55m-14-13 14 13-14 13" stroke="#fff0d7" stroke-width="3" fill="none"/>',
    medium:'<path d="M187 182h31l-4 67q-12 14-24 0Z" fill="#7d6b4e" stroke="#e5d4aa" stroke-width="3"/><path d="M188 206h29" stroke="#f0d18b" stroke-width="4"/><path d="M202 170v-12" stroke="#e9d7b3" stroke-width="3"/>',
    thief:'<path d="m196 179 28 70m-36-59 45-18" stroke="#d9d2ca" stroke-width="4" stroke-linecap="round"/><path d="m224 249 10 8-14-1Z" fill="#d9d2ca"/>',
    "pied-piper":'<path d="M174 197 235 181 237 190 176 206Z" fill="#b4d6c7" stroke="#e4f3e9" stroke-width="2"/><path d="m190 193 2 8m14-12 2 8m13-12 2 8" stroke="#456a60" stroke-width="2"/>',
    knight:'<path d="M44 180 77 190 73 246Q61 264 44 275 27 263 16 246L12 190Z" fill="#687d8d" stroke="#e7dfc9" stroke-width="4"/><path d="M44 201v54m-19-27h38" stroke="#f1dfb9" stroke-width="4"/>',
    angel:'<path d="M80 193Q28 160 27 216Q37 253 87 250M142 193Q194 160 195 216Q185 253 135 250" fill="none" stroke="#f4e9cf" stroke-width="9"/>',
    sorcerer:'<path d="M204 103v151m-18-126 18-28 18 28" stroke="#d6c2ef" stroke-width="5" fill="none"/><circle cx="204" cy="95" r="13" fill="#c9a6ed" stroke="#f0dcff" stroke-width="3"/>',
    ghost:'<path d="M36 208q24-27 48 0t48 0 48 0" fill="none" stroke="#e4f3fa" stroke-opacity=".7" stroke-width="4"/>'
  };
  const faceWolf=wolf
    ? '<path d="M88 106 70 75 99 87Q111 78 123 87L152 75 134 110Q147 151 111 173 75 151 88 106Z" fill="url(#skin-'+sid+')" stroke="'+p[0]+'" stroke-width="3"/><path d="M96 125l9 4m31-4-9 4" stroke="#fff0d8" stroke-width="4" stroke-linecap="round"/><path d="M105 143q6-6 12 0l-6 8Z" fill="#34232a"/><path d="M102 156q9 8 18 0" stroke="#f2c4b7" stroke-width="3" fill="none"/>'
    : '<path d="M88 111Q88 68 111 67Q153 66 153 111L148 151Q140 178 111 181Q82 178 74 151Z" fill="url(#skin-'+sid+')" stroke="#f0c5a4" stroke-width="2.5"/><path d="M91 128h8m25 0h8" stroke="#30242a" stroke-width="4" stroke-linecap="round"/><path d="M111 132v12m-10 12q10 7 20 0" fill="none" stroke="#945d57" stroke-width="2.5" stroke-linecap="round"/>';
  const wolfHair=id==="wolf"
    ? '<path d="M86 113 66 50 103 82Q111 76 119 82L156 50 136 113" fill="url(#coat-'+sid+')" stroke="'+p[0]+'" stroke-width="4"/>'
    : id==="elder"
      ? '<path d="M77 123Q63 69 104 53Q149 42 159 89L150 121 140 98 127 91 111 101 96 91 84 108Z" fill="#e5dfd0" stroke="#fff4e3" stroke-width="3"/>'
      : (id==="white-wolf"||id==="wolf-cub") ? ""
      : '<path d="M77 123Q63 69 104 53Q149 42 159 89L150 121 140 98 127 91 111 101 96 91 84 108Z" fill="'+hairColor+'" stroke="#1c1820" stroke-width="3"/><path d="M88 91Q108 66 137 84" fill="none" stroke="#b78b70" stroke-opacity=".35" stroke-width="4"/>';
  const special={
    wolf:'<path d="M99 148q12-8 24 0l-12 14Z" fill="#352129"/><path d="M91 125h10m30 0h10" stroke="#f4c26f" stroke-width="5"/>',
    villager:'<path d="M94 205 111 230 128 205" fill="none" stroke="#e9d3a4" stroke-width="4"/><path d="M95 252h32" stroke="#a98659" stroke-width="4"/>',
    seer:'<path d="M92 155q19 18 38 0" fill="none" stroke="#d8c5f4" stroke-width="3"/>',
    witch:'<path d="M93 151q18 16 36 0" fill="none" stroke="#e7c7ee" stroke-width="3"/>',
    protector:'<path d="M92 205 111 225 130 205" fill="none" stroke="#dce9f1" stroke-width="4"/>',
    hunter:'<path d="M92 205 111 224 130 205" fill="none" stroke="#e8c28e" stroke-width="4"/>',
    cupid:'<path d="M93 151q18 16 36 0" fill="none" stroke="#f7d3dd" stroke-width="3"/>',
    elder:'<path d="M87 150Q111 184 135 150L128 211 111 232 94 211Z" fill="#d9d1c2" stroke="#f0e8d9" stroke-width="3"/><path d="M96 174q15 11 30 0" stroke="#a49a8b" stroke-width="3" fill="none"/>',
    littleGirl:'<path d="M89 151q22 18 44 0" fill="none" stroke="#9c6252" stroke-width="3"/>',
    mayor:'<path d="M94 204 111 225 128 204" fill="none" stroke="#f4dfa9" stroke-width="4"/>',
    medium:'<path d="M88 158q23 20 46 0" fill="none" stroke="#e2d9ed" stroke-width="3"/>',
    thief:'<path d="M82 125q29-17 58 0" stroke="#29232d" stroke-width="12" fill="none"/><path d="M97 128h28" stroke="#d4c5bd" stroke-width="2"/>',
    "white-wolf":'<path d="M88 121 67 48 103 82Q111 76 119 82L155 48 134 121" fill="#e4eef3" stroke="#f9ffff" stroke-width="4"/><path d="M92 127h9m20 0h9" stroke="#a9d8ef" stroke-width="4"/>',
    "wolf-cub":'<path d="M89 121 76 65 105 87Q111 82 117 87L146 65 133 121" fill="#b17a68" stroke="#f2c7b2" stroke-width="4"/>',
    "pied-piper":'<path d="M92 205 111 226 130 205" fill="none" stroke="#b9e0d1" stroke-width="4"/>',
    knight:'<path d="M88 119Q111 101 134 119L130 157H92Z" fill="#788995" stroke="#e4decc" stroke-width="3"/><path d="M98 136h26" stroke="#f5e6c4" stroke-width="4"/>',
    angel:'<path d="M89 202 111 228 133 202" fill="none" stroke="#fff0d1" stroke-width="4"/>',
    sorcerer:'<path d="M93 152q18 16 36 0" fill="none" stroke="#e3c7f3" stroke-width="3"/>',
    "false-seer":'<path d="M76 126Q111 110 146 126" stroke="#d6c4eb" stroke-width="12" fill="none"/><path d="M82 126h58" stroke="#4b385c" stroke-width="3"/>',
    ghost:'<path d="M90 152q21 13 42 0" fill="none" stroke="#e7f5fb" stroke-width="3"/><circle cx="99" cy="128" r="3" fill="#effaff"/><circle cx="124" cy="128" r="3" fill="#effaff"/>'
  };
  const bg='<defs><linearGradient id="bg-'+sid+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".48" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient><linearGradient id="coat-'+sid+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".55" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient><linearGradient id="skin-'+sid+'" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f4d2ad"/><stop offset=".55" stop-color="#dba783"/><stop offset="1" stop-color="#9e695d"/></linearGradient><radialGradient id="light-'+sid+'"><stop stop-color="#f5d7a4" stop-opacity=".45"/><stop offset="1" stop-color="#f5d7a4" stop-opacity="0"/></radialGradient><pattern id="grain-'+sid+'" width="19" height="19" patternUnits="userSpaceOnUse"><circle cx="3" cy="5" r="1" fill="#fff" opacity=".11"/><circle cx="13" cy="14" r=".8" fill="#fff" opacity=".08"/></pattern></defs>';
  const body='<path d="M16 320Q20 233 70 207L91 190 111 209 132 190 153 207Q208 233 214 320Z" fill="url(#coat-'+sid+')" stroke="'+p[0]+'" stroke-width="4"/><path d="M89 199 111 229 133 199 151 320H71Z" fill="#171c27" fill-opacity=".72"/><path d="M111 230v75m-22-56 22 17 22-17" fill="none" stroke="#e7d2aa" stroke-opacity=".5" stroke-width="3"/><path d="M74 217Q111 241 148 217" fill="none" stroke="#f0d8ad" stroke-opacity=".28" stroke-width="4"/>';
  const wings=(id==="angel"||id==="cupid")
    ? '<path d="M82 188Q17 123 16 183Q19 220 76 248M140 188Q205 123 206 183Q203 220 146 248" fill="none" stroke="'+(id==="angel"?"#f4e9cf":"#efb9ca")+'" stroke-width="12" stroke-linecap="round" opacity=".9"/>'
    : "";
  const ghostGlow=id==="ghost" ? '<ellipse cx="111" cy="145" rx="87" ry="119" fill="#d9f0ff" opacity=".16"/>' : "";
  return '<svg class="role-portrait-svg" viewBox="0 0 224 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Minh họa '+sid+'">'+bg+
    '<rect width="224" height="320" fill="url(#bg-'+sid+')" opacity=".56"/><circle cx="111" cy="133" r="116" fill="url(#light-'+sid+')"/>'+
    '<path d="M0 205Q39 155 75 184T151 177Q190 148 224 198V320H0Z" fill="#111722" opacity=".48"/>'+
    '<path d="M22 44 29 34m162 19 8-13M37 120l7-7m137 19 7-8" stroke="#f5e2c2" stroke-opacity=".35" stroke-width="2"/>'+
    wings+ghostGlow+body+
    '<path d="M95 176h32v39H95Z" fill="url(#skin-'+sid+')"/>'+
    '<path d="M75 108Q77 56 111 55Q151 55 151 111L146 154Q139 183 111 187Q83 183 78 154Z" fill="#2b2024" opacity=".7"/>'+
    (headwear[id]||"")+
    faceWolf+
    wolfHair+
    (id==="elder" ? '<path d="M85 151Q111 190 137 151L130 220 111 243 92 220Z" fill="#e2d9c8" stroke="#f5eee1" stroke-width="3"/>' : "")+
    (id==="false-seer" ? '<path d="M76 126Q111 110 146 126" stroke="#d6c4eb" stroke-width="12" fill="none"/><path d="M82 126h58" stroke="#4b385c" stroke-width="3"/>' : "")+
    (id==="thief" ? '<path d="M82 125q29-17 58 0" stroke="#29232d" stroke-width="12" fill="none"/>' : "")+
    (props[id]||"")+
    '<rect width="224" height="320" fill="url(#grain-'+sid+')" opacity=".7"/>'+
    '<path d="M8 8h24M8 8v24m184-24h16v24M8 288v24h24m168-24v24h-24" fill="none" stroke="#f4dcae" stroke-opacity=".45" stroke-width="2"/>'+
    '</svg>';
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
  const englishNames = {
    wolf:"WEREWOLF",villager:"VILLAGER",seer:"SEER",witch:"WITCH",protector:"GUARDIAN",
    hunter:"HUNTER",cupid:"CUPID",elder:"ELDER",littleGirl:"LITTLE GIRL",mayor:"MAYOR",
    medium:"MEDIUM",thief:"THIEF","white-wolf":"WHITE WOLF","wolf-cub":"WOLF CUB",
    sorcerer:"SORCERER","false-seer":"FALSE SEER",ghost:"GHOST","pied-piper":"PIED PIPER",
    knight:"KNIGHT",angel:"ANGEL"
  };
  const factionCode = role => role.faction === "wolf" ? "SÓI" : role.faction === "town" ? "DÂN" : "ĐỘC LẬP";
  grid.innerHTML = filtered.map((role, index) => {
    const planned = role.status === "planned";
    const serial = String(index + 1).padStart(2,"0");
    return '<article class="role-card" data-role="' + escapeHtml(role.id) + '" data-faction="' + escapeHtml(role.faction) + '">' +
      '<div class="card-inner">' +
        '<section class="card-face card-front">' +
          '<div class="portrait-panel">' +
            '<div class="portrait-art">' + rolePortraitSvg(role.id) + '</div>' +
            '<div class="portrait-vignette"></div>' +
            '<div class="portrait-meta"><span class="archive-number">' + serial + '</span><span class="portrait-faction">' + escapeHtml(factionCode(role)) + '</span></div>' +
            '<span class="portrait-status ' + (planned ? "planned" : "") + '">' + (planned ? "SẮP PHÁT TRIỂN" : "ĐANG TRONG GAME") + '</span>' +
            '<span class="side-name">' + escapeHtml(englishNames[role.id] || role.name.toUpperCase()) + '</span>' +
          '</div>' +
          '<div class="card-caption">' +
            '<div class="role-title-strip"><h3 class="role-name">' + escapeHtml(role.name) + '</h3><span class="role-faction-mark">' + escapeHtml(factionCode(role)) + '</span></div>' +
            '<p class="role-summary">' + escapeHtml(role.summary) + '</p>' +
            '<div class="card-bottom"><span class="card-index">ROLE / ' + serial + '</span><button class="flip-btn" type="button">Xem năng lực ↗</button></div>' +
          '</div>' +
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
