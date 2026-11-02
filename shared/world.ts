import { MAP } from "./exploration";
import { punishments } from "./mythology";
import type { Team, MischiefState, SocialSnapshot } from "./mischief";
import type { SoulAppearance } from "./customization";
export interface Floor {
  id: number;
  name: string;
  subtitle: string;
  motif: string;
  meaning: string;
  reflection: string;
  traditional: string;
  elements: string[];
  color: string;
  symbol: string;
}
export const floors: Floor[] = [
  {
    id: 1,
    name: "Bạt Thiệt",
    subtitle: "Lời nói còn vang giữa thinh không",
    motif: "Kéo lưỡi",
    meaning: "Trong bản kể dân gian S6: khẩu nghiệp. Hình tượng: kìm kéo lưỡi.",
    reflection: "Suy ngẫm về lời nói và sự thật.",
    traditional: "Khẩu nghiệp",
    elements: ["Kìm sắt", "Ghế áp giải", "Dải lưỡi hoạt hình"],
    color: "#86b8a4",
    symbol: "tongue",
  },
  {
    id: 2,
    name: "Tiễn Đao",
    subtitle: "Những mối duyên chưa kịp nối",
    motif: "Kéo cắt",
    meaning:
      "Trong bản kể dân gian S6: quan niệm thủ tiết cũ. Hình tượng: kéo cắt ngón.",
    reflection: "Suy ngẫm về tổn thương trong các mối quan hệ.",
    traditional: "Quan niệm thủ tiết cũ",
    elements: ["Kéo lớn", "Bàn hình phạt", "Bàn tay bóng vong"],
    color: "#b39bca",
    symbol: "scissors",
  },
  {
    id: 3,
    name: "Thiết Thụ",
    subtitle: "Rừng sắt không mùa thay lá",
    motif: "Cây sắt",
    meaning:
      "Trong bản kể dân gian S6: chia rẽ gia đình. Hình tượng: treo trên cây sắt.",
    reflection: "Suy ngẫm về những hành động gây chia rẽ.",
    traditional: "Chia rẽ gia đình",
    elements: ["Cây sắt", "Cành lưỡi đao", "Móc treo"],
    color: "#8aa89b",
    symbol: "tree",
  },
  {
    id: 4,
    name: "Nghiệt Kính",
    subtitle: "Trong gương, không điều gì khuất lấp",
    motif: "Gương soi nghiệp",
    meaning:
      "Trong bản kể dân gian S6: soi tội trạng. Hình tượng: gương soi nghiệp.",
    reflection: "Suy ngẫm về việc nhìn nhận hành động của mình.",
    traditional: "Soi tội trạng",
    elements: ["Gương đồng", "Bệ soi", "Sổ ghi nghiệp"],
    color: "#8dbdc5",
    symbol: "mirror",
  },
  {
    id: 5,
    name: "Chưng Lung",
    subtitle: "Sương trắng che dấu chân người",
    motif: "Lồng hấp",
    meaning:
      "Trong bản kể dân gian S6: đồn đại hại người. Hình tượng: lồng hấp.",
    reflection: "Suy ngẫm về điều bị che giấu sau vẻ ngoài.",
    traditional: "Đồn đại hại người",
    elements: ["Lồng tre nhiều tầng", "Bếp lò", "Ống hơi"],
    color: "#b6aa86",
    symbol: "steam",
  },
  {
    id: 6,
    name: "Đồng Trụ",
    subtitle: "Cột đồng giữ những tàn lửa cũ",
    motif: "Cột đồng nung",
    meaning:
      "Trong bản kể dân gian S6: phóng hỏa. Hình tượng: ôm cột đồng nung.",
    reflection: "Suy ngẫm về trách nhiệm và sự kiềm chế.",
    traditional: "Phóng hỏa",
    elements: ["Cột đồng", "Than nóng", "Quạt lò"],
    color: "#cb9773",
    symbol: "pillar",
  },
  {
    id: 7,
    name: "Đao Sơn",
    subtitle: "Một bước nhẹ qua ngàn lưỡi sắc",
    motif: "Núi đao",
    meaning: "Trong bản kể dân gian S6: sát sinh. Hình tượng: leo núi đao.",
    reflection: "Suy ngẫm về bạo lực và lòng trắc ẩn.",
    traditional: "Sát sinh",
    elements: ["Núi đao", "Bậc lưỡi kiếm", "Cờ chỉ lối"],
    color: "#a3afb4",
    symbol: "mountain",
  },
  {
    id: 8,
    name: "Băng Sơn",
    subtitle: "Nơi hơi ấm trở thành món quà",
    motif: "Núi băng",
    meaning:
      "Trong bản kể dân gian S6: định kiến và bất nghĩa. Hình tượng: núi băng giá.",
    reflection: "Suy ngẫm về sự lạnh lùng trước nỗi khổ.",
    traditional: "Định kiến và bất nghĩa",
    elements: ["Tháp băng", "Hồ băng", "Gió tuyết"],
    color: "#8ebacb",
    symbol: "ice",
  },
  {
    id: 9,
    name: "Du Oa",
    subtitle: "Bên kia mặt hồ rực lửa",
    motif: "Vạc dầu",
    meaning: "Trong bản kể dân gian S6: cướp đoạt. Hình tượng: vạc dầu sôi.",
    reflection: "Suy ngẫm về lòng tham và cái giá phải trả.",
    traditional: "Cướp đoạt",
    elements: ["Vạc gang", "Lò lửa", "Muôi sắt"],
    color: "#cba36a",
    symbol: "cauldron",
  },
  {
    id: 10,
    name: "Ngưu Khanh",
    subtitle: "Tiếng chân vọng từ vực sâu",
    motif: "Hố trâu",
    meaning:
      "Trong bản kể dân gian S6: hành hạ động vật. Hình tượng: trâu húc giẫm.",
    reflection: "Suy ngẫm về cách đối xử với sinh linh.",
    traditional: "Hành hạ động vật",
    elements: ["Hố sâu", "Trâu âm phủ", "Rào gỗ"],
    color: "#a99e7b",
    symbol: "ox",
  },
  {
    id: 11,
    name: "Thạch Áp",
    subtitle: "Gánh nặng của những điều chưa nói",
    motif: "Đá đè",
    meaning: "Trong bản kể dân gian S6: bỏ rơi trẻ em. Hình tượng: đá lớn đè.",
    reflection: "Suy ngẫm về áp lực đặt lên người khác.",
    traditional: "Bỏ rơi trẻ em",
    elements: ["Đá treo", "Dây thừng", "Khung tời"],
    color: "#9ca596",
    symbol: "rock",
  },
  {
    id: 12,
    name: "Thung Cữu",
    subtitle: "Nhịp chày vang trong miền tĩnh lặng",
    motif: "Chày cối",
    meaning:
      "Trong bản kể dân gian S6: lãng phí lương thực. Hình tượng: giã trong cối.",
    reflection: "Suy ngẫm về công sức và sự trân trọng.",
    traditional: "Lãng phí lương thực",
    elements: ["Chày lớn", "Cối đá", "Đòn bẩy"],
    color: "#baa181",
    symbol: "mortar",
  },
  {
    id: 13,
    name: "Huyết Trì",
    subtitle: "Một đóa sen giữa hồ đỏ thẫm",
    motif: "Ao máu",
    meaning:
      "Trong bản kể dân gian S6: quan niệm bất hiếu và máu. Hình tượng: ngâm huyết trì.",
    reflection:
      "Trong game: suy ngẫm về chữa lành; không lặp lại định kiến về cơ thể trong một số dị bản.",
    traditional: "Quan niệm bất hiếu và máu",
    elements: ["Hồ đỏ", "Cầu gỗ", "Bia huyết trì"],
    color: "#bc8189",
    symbol: "lotus",
  },
  {
    id: 14,
    name: "Uổng Tử",
    subtitle: "Những câu chuyện còn dang dở",
    motif: "Chết oan",
    meaning:
      "Trong bản kể dân gian S6: chết trước thời hạn; một số bản kể quy kết tự sát. Hình tượng: giam tại uổng tử.",
    reflection: "Trong game: tưởng nhớ và lắng nghe người chịu oan khuất.",
    traditional: "Chết trước thời hạn; một số bản kể quy kết tự sát",
    elements: ["Tường thành", "Song cửa", "Đèn tưởng niệm"],
    color: "#9eabcc",
    symbol: "ghost",
  },
  {
    id: 15,
    name: "Trách Hình",
    subtitle: "Nhặt lại những mảnh đời thất lạc",
    motif: "Phân thây",
    meaning:
      "Trong bản kể dân gian S6: xâm phạm mồ mả. Hình tượng: phanh thây / xẻ thịt.",
    reflection:
      "Trong game: ghép lại điều đổ vỡ, không tái hiện hình phạt trực diện.",
    traditional: "Xâm phạm mồ mả",
    elements: ["Khung treo", "Dây giữ", "Dao hành hình"],
    color: "#b192ab",
    symbol: "shards",
  },
  {
    id: 16,
    name: "Hỏa Sơn",
    subtitle: "Giữ một đốm sáng giữa tro tàn",
    motif: "Núi lửa",
    meaning:
      "Trong bản kể dân gian S6: tham nhũng. Hình tượng: thiêu trên núi lửa.",
    reflection: "Suy ngẫm về tham muốn và sự nóng giận.",
    traditional: "Tham nhũng",
    elements: ["Miệng núi lửa", "Dung nham", "Đá cháy"],
    color: "#cf8870",
    symbol: "fire",
  },
  {
    id: 17,
    name: "Thạch Ma",
    subtitle: "Vòng quay của những món nợ cũ",
    motif: "Cối xay đá",
    meaning:
      "Trong bản kể dân gian S6: tham ô. Hình tượng: nghiền bằng cối xay.",
    reflection: "Suy ngẫm về công bằng trong trao đổi.",
    traditional: "Tham ô",
    elements: ["Cối xay đá", "Tay quay", "Máng hứng"],
    color: "#aca185",
    symbol: "wheel",
  },
  {
    id: 18,
    name: "Đao Cưa",
    subtitle: "Cuối đường sâu, một lối trở về",
    motif: "Dao cưa",
    meaning:
      "Trong bản kể dân gian S6: gian dối trao đổi. Hình tượng: cưa thân.",
    reflection:
      "Trong game: khép lại hành trình bằng sự thành thật và lòng nhân.",
    traditional: "Gian dối trao đổi",
    elements: ["Khung bốn trụ", "Cưa hai tay", "Dây buộc"],
    color: "#bdb18a",
    symbol: "saw",
  },
];
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
  width: MAP.width,
  height: MAP.height,
  speed: 250,
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
  visited?: number[];
  discoveries?: string[];
  sparks?: number;
  cycles?: number;
  form?: "soul";
  team?: Team;
  soul?: MischiefState;
  appearance?: SoulAppearance;
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
