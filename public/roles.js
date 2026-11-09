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
  const palettes = {
    wolf:["#d88a8f","#683640","#251b27"],villager:["#c8aa79","#76583b","#29211e"],
    seer:["#b9a7eb","#58477f","#241d39"],witch:["#c6a0df","#684477","#261b30"],
    protector:["#b7cce0","#526b87","#1b2a3b"],hunter:["#d7aa79","#76502f","#2b2019"],
    cupid:["#e9a7bd","#914b70","#321d31"],elder:["#d1c0a0","#746044","#2b241e"],
    littleGirl:["#b4cedd","#607d96","#202b39"],mayor:["#e4c783","#8a6836","#30251c"],
    medium:["#c3cce1","#66728e","#222638"],thief:["#d0b0a6","#60454c","#241c25"],
    "white-wolf":["#e4edf3","#8497a8","#27313d"],"wolf-cub":["#d9a18b","#84534b","#2b2025"],
    scapegoat:["#cbb9aa","#78665a","#2b2422"],"pied-piper":["#a9d0c2","#4e8176","#1c302e"],
    knight:["#d8c99d","#81704c","#292820"],angel:["#eee2b8","#9b8958","#302b20"],
    sorcerer:["#c2a4dc","#62457b","#251a31"],"false-seer":["#c2a8e0","#56436f","#211a30"],
    ghost:["#c2d5e4","#637b94","#1b2632"]
  };
  const p=palettes[id]||palettes.villager;
  const wolf=["wolf","white-wolf","wolf-cub"].includes(id);
  const gradients='<defs><linearGradient id="robe-'+id+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+p[0]+'"/><stop offset=".55" stop-color="'+p[1]+'"/><stop offset="1" stop-color="'+p[2]+'"/></linearGradient><radialGradient id="halo-'+id+'"><stop stop-color="'+p[0]+'" stop-opacity=".42"/><stop offset="1" stop-color="'+p[2]+'" stop-opacity="0"/></radialGradient></defs>';
  const outfit='<path d="M23 158Q27 111 53 105L80 119 107 105Q133 111 137 158Z" fill="url(#robe-'+id+')" stroke="'+p[0]+'" stroke-width="3"/><path d="m80 120-13 38m13-38 13 38" stroke="#f0d8aa" stroke-opacity=".55" stroke-width="2"/>';
  const face=wolf
    ? '<path d="M54 48 43 23 67 39Q80 32 93 39L117 23 106 53Q116 88 80 112 44 88 54 48Z" fill="url(#robe-'+id+')" stroke="#e9c6b7" stroke-width="2.5"/><path d="m59 72 13 5m36-5-13 5" stroke="#fff0d8" stroke-width="4" stroke-linecap="round"/><path d="m71 89 9 6 9-6-9 14Z" fill="#e8a0a1"/>'
    : '<path d="M53 49Q80 25 107 49L103 88Q96 111 80 115 64 111 57 88Z" fill="#dba783" stroke="#f2c7a4" stroke-width="2"/><path d="M64 77h3m26 0h3" stroke="#34272a" stroke-width="3.5" stroke-linecap="round"/><path d="M72 96q8 6 16 0" fill="none" stroke="#874f4d" stroke-width="2.5" stroke-linecap="round"/>';
  const hair=wolf?'':'<path d="M52 64Q44 24 80 24q36 0 28 40l-9-13-10 5-9-8-13 9-9-4Z" fill="#33282a" stroke="#1d1920" stroke-width="2"/>';
  const costume={
    seer:'<path d="M42 53 80 9 118 53 100 45 80 34 60 45Z" fill="#392b50" stroke="#d2b9f4" stroke-width="3"/><circle cx="80" cy="27" r="6" fill="#eee0ff"/>',
    witch:'<path d="M38 48 80 4 124 48 96 38 80 30 60 40Z" fill="#382342" stroke="#d7a7e5" stroke-width="3"/>',
    protector:'<path d="M44 49 46 29 80 10 114 29 116 49 98 42 80 36 62 42Z" fill="#536f8a" stroke="#d4e7f7" stroke-width="3"/><path d="M80 17v24m-12-12h24" stroke="#f4dfb4" stroke-width="3"/>',
    hunter:'<path d="M37 49q43-34 86 0l-8 9H45Z" fill="#76502e" stroke="#e8bd87" stroke-width="3"/><path d="M80 20v20" stroke="#e8bd87" stroke-width="3"/>',
    elder:'<path d="M47 61q-9-40 33-43 42 3 33 43l-12 17H59Z" fill="#d9c7a7" stroke="#a58d6e" stroke-width="2"/><path d="M59 78q21 18 42 0" fill="none" stroke="#f4ead8" stroke-width="5"/>',
    littleGirl:'<path d="M44 48Q27 8 60 24L80 10 100 24Q133 8 116 48" fill="#35485e" stroke="#c4d7e5" stroke-width="3"/>',
    mayor:'<path d="m39 48 10-30 22 20 9-31 10 31 22-20 10 30Z" fill="#a98645" stroke="#f3d89c" stroke-width="3"/>',
    medium:'<path d="M42 53Q28 7 80 7q52 0 38 46L99 40 80 32 61 40Z" fill="#3d4960" stroke="#d6e0f1" stroke-width="3"/>',
    thief:'<path d="M35 48q45-41 90 0l-10 12H45Z" fill="#3c3039" stroke="#e7c4c5" stroke-width="3"/><path d="M52 63h56l-5 19H57Z" fill="#211b25"/>',
    knight:'<path d="M45 53V29L80 9l35 20v24l-15-9H60Z" fill="#8b805f" stroke="#f0dfb6" stroke-width="3"/><path d="M80 12v38m-15-20h30" stroke="#fff0ca" stroke-width="3"/>',
    angel:'<path d="M52 51Q8 3 18 57q7 24 47 34M108 51q44-48 34 6-7 24-47 34" fill="none" stroke="#fff0ce" stroke-width="7"/><ellipse cx="80" cy="18" rx="23" ry="7" fill="none" stroke="#f4dfa5" stroke-width="4"/>',
    cupid:'<path d="M80 35Q42-3 25 34q-9 31 55 62 64-31 55-62Q118-3 80 35Z" fill="none" stroke="#f2bfd3" stroke-width="7"/>',
    "white-wolf":'<path d="M51 48 36 12 68 36Q80 29 92 36l32-24-15 39" fill="#dce7ed" stroke="#f3fbff" stroke-width="3"/>',
    "wolf-cub":'<path d="M54 48 45 20 68 37Q80 31 92 37l23-17-9 31" fill="#9b6458" stroke="#efc0a9" stroke-width="3"/>',
    "pied-piper":'<path d="M47 50 111 68l-4 10-65-20Z" fill="#7ca99b" stroke="#d1f0df" stroke-width="3"/>',
    scapegoat:'<path d="M80 8 93 33l28 4-20 20 5 29-26-14-26 14 5-29-20-20 28-4Z" fill="#8a7468" stroke="#e6d4c8" stroke-width="3"/>',
    sorcerer:'<path d="M42 50 80 5 118 50 99 41 80 32 61 41Z" fill="#39264d" stroke="#d7b8f4" stroke-width="3"/><path d="M80 11v20m-8-10h16" stroke="#f3e3ff" stroke-width="3"/>',
    "false-seer":'<path d="M42 53Q80 5 118 53L98 45 80 36 62 45Z" fill="#39264d" stroke="#d7b8f4" stroke-width="3"/><path d="M67 76h26" stroke="#e3d0ff" stroke-width="3"/>',
    ghost:'<path d="M51 47Q51 20 80 20t29 27v61l-14-9-15 9-15-9-14 9Z" fill="#bdcedd" fill-opacity=".75" stroke="#e5f3ff" stroke-width="3"/>'
  };
  const emblem=costume[id]||'<path d="M58 120v25m-12-9 12 9 12-9" stroke="'+p[0]+'" stroke-width="3" fill="none"/>';
  return '<svg viewBox="0 0 160 160" role="img" aria-label="Tranh minh họa '+id+'" xmlns="http://www.w3.org/2000/svg">'+gradients+
    '<circle cx="80" cy="80" r="77" fill="url(#halo-'+id+')"/><circle cx="80" cy="80" r="72" fill="none" stroke="'+p[0]+'" stroke-opacity=".5" stroke-width="1.5"/>'+
    outfit+emblem+hair+face+
    '<path d="M55 67q-9-9-10 3m60-3q9-9 10 3" fill="none" stroke="#b77e68" stroke-width="4"/>'+
    '<path d="M80 88v6" stroke="#9c6558" stroke-width="2" stroke-linecap="round"/></svg>';
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
