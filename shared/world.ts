import { punishments } from "./mythology";
import type { Team, MischiefState, SocialSnapshot } from "./mischief";
import type {SoulAppearance} from './customization';
export interface Floor {
  id: number;
  name: string;
  han: string;
  subtitle: string;
  motif: string;
  meaning: string;
  reflection: string;
  traditional: string;
  elements: string[];
  color: string;
  symbol: string;
  question: string;
  choices: string[];
  answer: number;
}
// The order/names follow S1. Reflections, NPCs, layouts and puzzles are original game adaptations.
const rows = [
  [
    "Bạt Thiệt",
    "拔舌",
    "Lời nói còn vang giữa thinh không",
    "Kéo lưỡi",
    "Suy ngẫm về lời nói và sự thật.",
    "Bia lời nói|Dải lụa đỏ|Chuông tĩnh ngữ",
    "#86b8a4",
    "tongue",
    "Một lời đồn chưa được kiểm chứng. Bạn sẽ làm gì?",
    "Kiểm chứng trước khi kể|Kể tiếp để mọi người biết|Thêm chi tiết cho hấp dẫn",
    0,
  ],
  [
    "Tiễn Đao",
    "剪刀",
    "Những mối duyên chưa kịp nối",
    "Kéo cắt",
    "Suy ngẫm về tổn thương trong các mối quan hệ.",
    "Kéo sắt|Sợi chỉ đứt|Cầu nối duyên",
    "#b39bca",
    "scissors",
    "Hai người hiểu lầm nhau. Bạn chọn cách nào?",
    "Kích động tranh cãi|Lắng nghe cả hai phía|Tung tin đồn",
    1,
  ],
  [
    "Thiết Thụ",
    "铁树",
    "Rừng sắt không mùa thay lá",
    "Cây sắt",
    "Suy ngẫm về những hành động gây chia rẽ.",
    "Cây sắt|Lá kim loại|Rễ chằng chịt",
    "#8aa89b",
    "tree",
    "Lối đi bị rễ cây chia cắt. Bạn làm gì?",
    "Bỏ người phía sau|Giành phần đi trước|Cùng tìm một lối an toàn",
    2,
  ],
  [
    "Nghiệt Kính",
    "孽镜",
    "Trong gương, không điều gì khuất lấp",
    "Gương soi nghiệp",
    "Suy ngẫm về việc nhìn nhận hành động của mình.",
    "Gương đồng|Bệ soi|Mảnh ký ức",
    "#8dbdc5",
    "mirror",
    "Gương hiện lại lỗi lầm của bạn. Bạn chọn gì?",
    "Thừa nhận và sửa sai|Đổ lỗi cho người khác|Che gương lại",
    0,
  ],
  [
    "Chưng Lung",
    "蒸笼",
    "Sương trắng che dấu chân người",
    "Lồng hấp",
    "Suy ngẫm về điều bị che giấu sau vẻ ngoài.",
    "Lồng tre|Hơi nước|Van dẫn khí",
    "#b6aa86",
    "steam",
    "Hơi nước che một người lạc đường. Bạn sẽ?",
    "Đi tiếp một mình|Dừng lại dẫn họ qua|Lấy mất đèn của họ",
    1,
  ],
  [
    "Đồng Trụ",
    "铜柱",
    "Cột đồng giữ những tàn lửa cũ",
    "Cột đồng nung",
    "Suy ngẫm về trách nhiệm và sự kiềm chế.",
    "Cột đồng|Than hồng|Cơ cấu làm nguội",
    "#cb9773",
    "pillar",
    "Một cơn giận đang bùng lên. Bạn chọn gì?",
    "Trút lên bạn đồng hành|Đập phá đồ vật|Bình tâm rồi đối thoại",
    2,
  ],
  [
    "Đao Sơn",
    "刀山",
    "Một bước nhẹ qua ngàn lưỡi sắc",
    "Núi đao",
    "Suy ngẫm về bạo lực và lòng trắc ẩn.",
    "Sườn núi sắc|Cầu treo|Cọc buộc dây",
    "#a3afb4",
    "mountain",
    "Có người mắc kẹt bên sườn núi. Bạn sẽ?",
    "Buộc dây và giúp họ|Đẩy họ để mở đường|Bỏ mặc dù có thể giúp",
    0,
  ],
  [
    "Băng Sơn",
    "冰山",
    "Nơi hơi ấm trở thành món quà",
    "Núi băng",
    "Suy ngẫm về sự lạnh lùng trước nỗi khổ.",
    "Tháp băng|Hồ đóng băng|Bếp lửa nhỏ",
    "#8ebacb",
    "ice",
    "Chỉ còn một bếp lửa. Bạn làm gì?",
    "Giữ riêng|Chia sẻ hơi ấm|Dập lửa",
    1,
  ],
  [
    "Du Oa",
    "油锅",
    "Bên kia mặt hồ rực lửa",
    "Vạc dầu",
    "Suy ngẫm về lòng tham và cái giá phải trả.",
    "Vạc lớn|Cầu đá|Dòng dầu nóng",
    "#cba36a",
    "cauldron",
    "Bạn tìm thấy túi đồ của người khác. Bạn sẽ?",
    "Giữ làm của riêng|Giấu nó đi|Tìm người đánh mất",
    2,
  ],
  [
    "Ngưu Khanh",
    "牛坑",
    "Tiếng chân vọng từ vực sâu",
    "Hố trâu",
    "Suy ngẫm về cách đối xử với sinh linh.",
    "Hố sâu|Bóng trâu|Máng nước",
    "#a99e7b",
    "ox",
    "Một con vật đang khát bên đường. Bạn sẽ?",
    "Cho nó uống nước|Xua đuổi nó|Trêu chọc nó",
    0,
  ],
  [
    "Thạch Áp",
    "石压",
    "Gánh nặng của những điều chưa nói",
    "Đá đè",
    "Suy ngẫm về áp lực đặt lên người khác.",
    "Tảng đá|Đòn bẩy|Cột chống",
    "#9ca596",
    "rock",
    "Bạn đồng hành không nâng nổi tảng đá. Bạn sẽ?",
    "Chê trách họ|Cùng dùng đòn bẩy|Bắt họ làm một mình",
    1,
  ],
  [
    "Thung Cữu",
    "舂臼",
    "Nhịp chày vang trong miền tĩnh lặng",
    "Chày cối",
    "Suy ngẫm về công sức và sự trân trọng.",
    "Chày lớn|Cối đá|Hạt ngọc",
    "#baa181",
    "mortar",
    "Bạn được chia lương thực. Bạn sẽ?",
    "Lãng phí cho vui|Lấy hết phần của nhóm|Dùng vừa đủ và chia sẻ",
    2,
  ],
  [
    "Huyết Trì",
    "血池",
    "Một đóa sen giữa hồ đỏ thẫm",
    "Ao máu",
    "Trong game: suy ngẫm về chữa lành; không lặp lại định kiến về cơ thể trong một số dị bản.",
    "Hồ đỏ|Đài sen|Cầu gỗ",
    "#bc8189",
    "lotus",
    "Một người bị gạt khỏi nhóm vì định kiến. Bạn sẽ?",
    "Mời họ cùng đi|Lặp lại lời kỳ thị|Đuổi họ khỏi cầu",
    0,
  ],
  [
    "Uổng Tử",
    "枉死",
    "Những câu chuyện còn dang dở",
    "Chết oan",
    "Trong game: tưởng nhớ và lắng nghe người chịu oan khuất.",
    "Đèn tưởng niệm|Bia vô danh|Thư chưa gửi",
    "#9eabcc",
    "ghost",
    "Một linh hồn muốn kể chuyện. Bạn sẽ?",
    "Chế giễu họ|Lắng nghe không phán xét|Bỏ đi giữa câu chuyện",
    1,
  ],
  [
    "Trách Hình",
    "磔刑",
    "Nhặt lại những mảnh đời thất lạc",
    "Phân thây",
    "Trong game: ghép lại điều đổ vỡ, không tái hiện hình phạt trực diện.",
    "Phiến đá tách|Ấn vỡ|Dải lụa nối",
    "#b192ab",
    "shards",
    "Một vật quý của nhóm bị vỡ. Bạn sẽ?",
    "Giấu các mảnh đi|Đổ lỗi ngay lập tức|Cùng tìm cách sửa lại",
    2,
  ],
  [
    "Hỏa Sơn",
    "火山",
    "Giữ một đốm sáng giữa tro tàn",
    "Núi lửa",
    "Suy ngẫm về tham muốn và sự nóng giận.",
    "Miệng núi|Dung nham|Cầu đá đen",
    "#cf8870",
    "fire",
    "Một bất đồng làm cả nhóm nóng giận. Bạn sẽ?",
    "Đề nghị nghỉ rồi trao đổi|Kích động thêm|Phá đồ chung",
    0,
  ],
  [
    "Thạch Ma",
    "石磨",
    "Vòng quay của những món nợ cũ",
    "Cối xay đá",
    "Suy ngẫm về công bằng trong trao đổi.",
    "Cối xay|Bánh răng|Cân đồng",
    "#aca185",
    "wheel",
    "Bạn nhận nhầm nhiều phần thưởng hơn. Bạn sẽ?",
    "Giữ im lặng|Trả lại phần nhận nhầm|Lấy thêm từ người khác",
    1,
  ],
  [
    "Đao Cưa",
    "刀锯",
    "Cuối đường sâu, một lối trở về",
    "Dao cưa",
    "Trong game: khép lại hành trình bằng sự thành thật và lòng nhân.",
    "Lưỡi cưa|Cổng hồi sinh|Ấn đoàn viên",
    "#bdb18a",
    "saw",
    "Điều gì giúp khép lại chuyến ngao du?",
    "Chiếm hết của cải|Bỏ lại bạn bè|Mang theo lòng trắc ẩn",
    2,
  ],
] as const;
// Brief subject labels from the Vietnamese popular retelling S6, not canonical rules.
const traditional = [
  "Khẩu nghiệp",
  "Quan niệm thủ tiết cũ",
  "Chia rẽ gia đình",
  "Soi tội trạng",
  "Đồn đại hại người",
  "Phóng hỏa",
  "Sát sinh",
  "Định kiến và bất nghĩa",
  "Cướp đoạt",
  "Hành hạ động vật",
  "Bỏ rơi trẻ em",
  "Lãng phí lương thực",
  "Quan niệm bất hiếu và máu",
  "Chết trước thời hạn; một số bản kể quy kết tự sát",
  "Xâm phạm mồ mả",
  "Tham nhũng",
  "Tham ô",
  "Gian dối trao đổi",
];
export const floors: Floor[] = rows.map((r, i) => ({
  id: i + 1,
  name: r[0],
  han: r[1],
  subtitle: r[2],
  motif: r[3],
  meaning: `Trong bản kể dân gian S6: ${traditional[i].toLocaleLowerCase("vi")}. Hình tượng: ${punishments[i].title.toLocaleLowerCase("vi")}.`,
  reflection: r[4],
  traditional: traditional[i],
  elements: punishments[i].props,
  color: r[6],
  symbol: r[7],
  question: r[8],
  choices: r[9].split("|"),
  answer: r[10],
}));
export const sources = [
  {
    id: "S1",
    title: "Bắc Kinh Văn Bác · Nghiên cứu bích họa địa ngục (2010)",
    url: "https://wwj.beijing.gov.cn/bjww/resource/cms/article/362762/515676/2018052316335739806.pdf",
    note: "Bài của Phạm Học Tân, trang in 34–38. Căn cứ thứ tự và tên gọi 18 tầng phổ biến; cũng nêu sự khác nhau giữa các truyền thống.",
  },
  {
    id: "S2",
    title: "British Museum · Tranh cuộn Thập điện, Đôn Hoàng",
    url: "https://www.britishmuseum.org/collection/object/A_1919-0101-0-80",
    note: "Tư liệu hình tượng: quan tòa, thư lại, sổ ghi việc thiện ác và Địa Tạng. Không phải danh mục 18 tầng.",
  },
  {
    id: "S3",
    title: "International Dunhuang Programme · Tín ngưỡng và nghi lễ",
    url: "https://idp.bl.uk/discover/learning/dunhuang/dunhuang-articles/the-cultural-melting-pot/beliefs-rituals-and-practices/",
    note: "Bối cảnh giao thoa tín ngưỡng; hình ảnh gương nghiệp và việc xét xử ở âm giới.",
  },
  {
    id: "S4",
    title: "National Museum of Singapore · Haw Par Villa",
    url: "https://www.roots.gov.sg/Collection-Landing/listing/1110979",
    note: "Ảnh tư liệu về Thập điện. Chỉ dẫn tham khảo thị giác, không tái sử dụng ảnh khi chưa xác định quyền.",
  },
  {
    id: "S6",
    title: "Phatgiao.org.vn · 18 tầng địa ngục (01/02/2024)",
    url: "https://phatgiao.org.vn/18-tang-dia-nguc-d81132.html",
    note: "Bản kể tiếng Việt để đối chiếu tên và chủ đề. Có các quan niệm cũ cần đặt trong bối cảnh; không coi mọi chi tiết là kinh văn đã xác thực.",
  },
  {
    id: "S7",
    title: "Academia Sinica · Tượng Mã Diện, mã hiện vật 7288",
    url: "https://irp.openmuseum.tw/muse/digi_object/0a4cd0edc912e7a8548556052c46c485",
    note: "Ngưu Đầu và Mã Diện: đầu thú thân người, quỷ sai áp giải; có thông tin vật liệu và hình tượng.",
  },
  {
    id: "S8",
    title: "Singapore Chinese Cultural Centre · The Soup of Reincarnation",
    url: "https://singaporeccc.org.sg/events/the-soup-of-reincarnation/",
    note: "Mô-típ Mạnh Bà bên sông quên lãng trước tái sinh; là truyền thuyết dân gian.",
  },
  {
    id: "S9",
    title: "Nara National Museum · Ten Kings of Hell",
    url: "https://www.narahaku.go.jp/english/collection/1013-0.html",
    note: "Thập điện xét việc đã làm và cảnh giới tái sinh. Thứ tự điện VIII–IX có dị bản; game giữ thứ tự S1.",
  },
  {
    id: "S10",
    title: "Taiwan Historica · Hình tượng quỷ sai Hắc–Bạch",
    url: "https://dict.th.gov.tw/Print.aspx?ID=2060",
    note: "Mũ, pháp khí, dáng cao thấp và sự giao thoa tên gọi với Thất gia–Bát gia ở từng địa phương.",
  },
  {
    id: "S11",
    title: "Japan Tourism Agency · Enma and the Buddhist Cycle of Rebirth",
    url: "https://www.mlit.go.jp/tagengo-db/en/R6-00041.html",
    note: "Sáu cảnh giới tái sinh và tính tuần hoàn của sinh tử. Tư liệu Nhật Bản, dùng đối chiếu lục đạo, không thay thế dị bản dân gian Đông Á đã chọn.",
  },
];
export const WORLD = {
  width: 1000,
  height: 680,
  speed: 190,
  spawn: { x: 500, y: 550 },
  npc: { x: 500, y: 295 },
  gate: { x: 500, y: 155 },
  lanterns: [
    { x: 280, y: 390 },
    { x: 720, y: 390 },
  ],
};
export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  floor: number;
  color: string;
  maxFloor: number;
  completed: number[];
  cycles?: number;
  form?: "soul";
  team?: Team;
  soul?: MischiefState;
  appearance?:SoulAppearance;
}
export interface Snapshot {
  players: Player[];
  lanterns: boolean[];
  chat: ChatMessage[];
  social?: SocialSnapshot;
}
export interface ChatMessage {
  id: string;
  name: string;
  text: string;
  system?: boolean;
}
