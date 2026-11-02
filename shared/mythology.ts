export type CharacterKind =
  | "demon"
  | "ox"
  | "horse"
  | "black"
  | "white"
  | "judge"
  | "king"
  | "mengpo"
  | "dizang"
  | "soul";
export interface CharacterModel {
  id: string;
  name: string;
  kind: CharacterKind;
  color: string;
  skin: string;
  role: string;
  features: string;
  quip: string;
  source: string;
  court?: number;
}
const courtNames = [
  "Tần Quảng Vương",
  "Sở Giang Vương",
  "Tống Đế Vương",
  "Ngũ Quan Vương",
  "Diêm La Vương",
  "Biện Thành Vương",
  "Thái Sơn Vương",
  "Đô Thị Vương",
  "Bình Đẳng Vương",
  "Chuyển Luân Vương",
];
export const characters: CharacterModel[] = [
  {
    id: "quy-su",
    name: "Quỷ sứ",
    kind: "demon",
    color: "#bb6e4e",
    skin: "#75a38b",
    role: "Quỷ tốt trông ngục, thi hành lệnh của âm ty.",
    features:
      "Mắt lồi, nanh nhỏ, sừng ngắn, khố giáp và đinh ba. Tạo hình quỷ tốt có nhiều dị bản.",
    quip: "Tôi trông nghiêm thế thôi, chấm công vẫn hay quên!",
    source: "S2",
  },
  {
    id: "nguu-dau",
    name: "Ngưu Đầu",
    kind: "ox",
    color: "#86624b",
    skin: "#8d897d",
    role: "Đầu trâu thân người; đi cùng Mã Diện áp giải vong hồn.",
    features: "Sừng cong, mõm trâu, móng chẻ, giáp và chĩa sắt.",
    quip: "Đi đúng hàng nhé. Tôi đếm đầu, không đếm sừng!",
    source: "S7",
  },
  {
    id: "ma-dien",
    name: "Mã Diện",
    kind: "horse",
    color: "#6f859b",
    skin: "#bd9a78",
    role: "Đầu ngựa thân người, cộng sự của Ngưu Đầu.",
    features: "Mõm dài, tai dựng, bờm, áo giáp; cầm giáo và dây dẫn.",
    quip: "Đừng bảo tôi chạy deadline. Tôi đã chạy cả ngày rồi!",
    source: "S7",
  },
  {
    id: "hac-vo-thuong",
    name: "Hắc Vô Thường",
    kind: "black",
    color: "#343d4d",
    skin: "#819b9b",
    role: "Quỷ sai dẫn hồn trong cặp Hắc–Bạch Vô Thường của dân gian.",
    features:
      "Áo và mũ cao màu đen, xích dẫn hồn; dáng thấp đậm trong bản game.",
    quip: "Tôi mặc đen để khỏi phải chọn đồ mỗi sáng.",
    source: "S10",
  },
  {
    id: "bach-vo-thuong",
    name: "Bạch Vô Thường",
    kind: "white",
    color: "#ded9c2",
    skin: "#d5d3b7",
    role: "Quỷ sai dẫn hồn, thường được tạo hình thành cặp với Hắc Vô Thường.",
    features: "Áo trắng, mũ cao, lưỡi dài và quạt; bản game dáng cao gầy.",
    quip: "Mũ cao vì ý tưởng nhiều. Không liên quan chiều cao nhé!",
    source: "S10",
  },
  {
    id: "phan-quan",
    name: "Phán quan",
    kind: "judge",
    color: "#55766b",
    skin: "#c3a282",
    role: "Quan lại âm phủ ghi chép và hỗ trợ xét xử.",
    features: "Mũ cánh chuồn, bút, sổ và râu; không phải vị vua thứ mười một.",
    quip: "Đọc kỹ trước khi ký. Tôi không có nút hoàn tác!",
    source: "S2",
  },
  {
    id: "manh-ba",
    name: "Mạnh Bà",
    kind: "mengpo",
    color: "#916f94",
    skin: "#d5b596",
    role: "Người trao bát canh quên ký ức trước tái sinh trong truyền thuyết dân gian.",
    features:
      "Tóc bạc búi, nồi canh, muôi và bát. Không phải một vị trong Thập điện.",
    quip: "Canh không thêm hành. Uống rồi cũng quên thôi!",
    source: "S8",
  },
  {
    id: "dia-tang",
    name: "Địa Tạng Bồ Tát",
    kind: "dizang",
    color: "#b99053",
    skin: "#d8bc95",
    role: "Hình tượng cứu độ chúng sinh; không phải cai ngục hay người thi hành hình phạt.",
    features:
      "Pháp phục, tích trượng và minh châu; tạo hình hiền hòa, không chế giễu.",
    quip: "Giữ lòng từ, rồi hãy đi tiếp.",
    source: "S2",
  },
  {
    id: "vong-hon",
    name: "Vong hồn",
    kind: "soul",
    color: "#9ec8bc",
    skin: "#c5ded2",
    role: "Nhân vật linh hồn trong cảnh; cũng là mẫu cho người chơi.",
    features: "Thân tròn nhẹ, mắt biểu cảm, đuôi khói và ánh sáng nhạt.",
    quip: "Tôi không lạc đường. Tôi đang khám phá thêm!",
    source: "GAME",
  },
  ...courtNames.map((name, i): CharacterModel => ({
    id: `king-${i + 1}`,
    name,
    kind: "king",
    court: i + 1,
    color: [
      "#8b5e44",
      "#4e8179",
      "#706a97",
      "#8d7860",
      "#9d4d47",
      "#557e8f",
      "#6d7960",
      "#9b7356",
      "#7c6482",
      "#ae9058",
    ][i],
    skin: "#d1ae87",
    role:
      i === 9
        ? "Vị vua thứ mười, gắn với việc chuyển sinh trong hệ thống Thập điện."
        : `Vị vua của điện thứ ${i + 1} trong hệ thống Thập điện; không tương ứng một-một với tầng địa ngục.`,
    features:
      "Mũ miện có chuỗi hạt, áo quan, râu và thẻ lệnh; phân biệt bằng số điện, màu áo và biển tên.",
    quip:
      i === 9
        ? "Đến vòng mới rồi. Nhớ xếp hàng, đừng quay vòng vòng!"
        : `Hồ sơ điện ${i + 1}: dấu đã sẵn, kính đọc sách đâu rồi?`,
    source: "S1, S9",
  })),
];
export const characterById = (id: string) =>
  characters.find((c) => c.id === id) || characters[0];
export interface PunishmentModel {
  floor: number;
  title: string;
  description: string;
  setting: string;
  props: string[];
  guardian: string;
  palette: [string, string];
  effect: string;
}
// Literal punishment subjects follow the selected popular list. Staging and comic animation are original.
export const punishments: PunishmentModel[] = [
  {
    floor: 1,
    title: "Kìm kéo lưỡi",
    description: "Quỷ tốt kéo lưỡi vong bằng kìm.",
    setting: "Công đường khẩu nghiệp",
    props: ["Kìm sắt", "Ghế áp giải", "Dải lưỡi hoạt hình"],
    guardian: "quy-su",
    palette: ["#25423c", "#c18b70"],
    effect: "Lưỡi co giãn; quỷ sứ ngạc nhiên vì kéo mãi chưa hết.",
  },
  {
    floor: 2,
    title: "Kéo cắt ngón",
    description: "Kéo lớn cắt ngón tay trong dị bản.",
    setting: "Sân kéo sắt",
    props: ["Kéo lớn", "Bàn hình phạt", "Bàn tay bóng vong"],
    guardian: "bach-vo-thuong",
    palette: ["#352b42", "#ba9bce"],
    effect: "Bàn tay bóng tách thành các mảnh sáng, rồi tự ghép lại.",
  },
  {
    floor: 3,
    title: "Treo trên cây sắt",
    description: "Vong bị treo lên cây có lưỡi nhọn.",
    setting: "Rừng thiết thụ",
    props: ["Cây sắt", "Cành lưỡi đao", "Móc treo"],
    guardian: "nguu-dau",
    palette: ["#263c34", "#90b89c"],
    effect: "Cành sắt rung, vong đung đưa như bị mắc áo.",
  },
  {
    floor: 4,
    title: "Gương soi nghiệp",
    description: "Gương hiện việc đã làm; đây là cảnh xét nghiệp.",
    setting: "Nghiệt kính đài",
    props: ["Gương đồng", "Bệ soi", "Sổ ghi nghiệp"],
    guardian: "phan-quan",
    palette: ["#223d49", "#9cccd2"],
    effect: "Ảnh trong gương chớp sáng; Phán quan lật sổ kiểm tra.",
  },
  {
    floor: 5,
    title: "Lồng hấp",
    description: "Vong bị nhốt trong lồng hấp nóng.",
    setting: "Xưởng chưng lung",
    props: ["Lồng tre nhiều tầng", "Bếp lò", "Ống hơi"],
    guardian: "quy-su",
    palette: ["#3c362a", "#d1ba83"],
    effect: "Nắp lồng nảy lên theo hơi nước; mắt vong lấp ló.",
  },
  {
    floor: 6,
    title: "Ôm cột đồng nung",
    description: "Vong phải ôm cột đồng nóng đỏ.",
    setting: "Đồng trụ hỏa lò",
    props: ["Cột đồng", "Than nóng", "Quạt lò"],
    guardian: "nguu-dau",
    palette: ["#482d2a", "#db9d63"],
    effect: "Cột rực hồng; vong bật khỏi cột trong làn khói.",
  },
  {
    floor: 7,
    title: "Leo núi đao",
    description: "Vong bị buộc vượt núi lưỡi sắc.",
    setting: "Đao sơn hiểm lộ",
    props: ["Núi đao", "Bậc lưỡi kiếm", "Cờ chỉ lối"],
    guardian: "ma-dien",
    palette: ["#2d3943", "#a2b6c7"],
    effect: "Vong leo hai bước, trượt một bước, không có vết thương.",
  },
  {
    floor: 8,
    title: "Núi băng giá",
    description: "Vong chịu giá lạnh trên núi băng.",
    setting: "Băng sơn hàn vực",
    props: ["Tháp băng", "Hồ băng", "Gió tuyết"],
    guardian: "hac-vo-thuong",
    palette: ["#213d56", "#a7dbed"],
    effect: "Vong run cầm cập, răng gõ; tuyết xoay quanh mũ.",
  },
  {
    floor: 9,
    title: "Vạc dầu sôi",
    description: "Vong bị thả vào vạc dầu nóng.",
    setting: "Du oa hỏa ngục",
    props: ["Vạc gang", "Lò lửa", "Muôi sắt"],
    guardian: "quy-su",
    palette: ["#472e24", "#e0aa5b"],
    effect: "Dầu nổi bong bóng; vong đội nắp vạc như mũ.",
  },
  {
    floor: 10,
    title: "Trâu húc giẫm",
    description: "Đàn trâu húc, giẫm trong hố.",
    setting: "Ngưu khanh thú vực",
    props: ["Hố sâu", "Trâu âm phủ", "Rào gỗ"],
    guardian: "nguu-dau",
    palette: ["#37372a", "#b8a171"],
    effect: "Trâu dậm chân phì hơi; vong quay như chong chóng.",
  },
  {
    floor: 11,
    title: "Đá lớn đè",
    description: "Tảng đá thả xuống đè vong.",
    setting: "Thạch áp trọng đài",
    props: ["Đá treo", "Dây thừng", "Khung tời"],
    guardian: "nguu-dau",
    palette: ["#363c38", "#b1b69b"],
    effect: "Đá hạ xuống; bóng vong dẹt rồi phồng lại.",
  },
  {
    floor: 12,
    title: "Giã trong cối",
    description: "Vong bị giã bằng chày trong cối.",
    setting: "Thung cữu thạch viện",
    props: ["Chày lớn", "Cối đá", "Đòn bẩy"],
    guardian: "ma-dien",
    palette: ["#3e352b", "#c2a37b"],
    effect: "Chày lên xuống; các đốm hồn bật như hạt bắp.",
  },
  {
    floor: 13,
    title: "Ngâm huyết trì",
    description: "Vong chịu khổ trong hồ máu.",
    setting: "Huyết trì xích hồ",
    props: ["Hồ đỏ", "Cầu gỗ", "Bia huyết trì"],
    guardian: "bach-vo-thuong",
    palette: ["#44252f", "#c48791"],
    effect: "Mặt hồ đỏ gợn sóng, chỉ thấy bóng vong và bọt.",
  },
  {
    floor: 14,
    title: "Giam tại Uổng Tử",
    description: "Bản kể giam vong tại thành Uổng Tử.",
    setting: "Uổng tử thành",
    props: ["Tường thành", "Song cửa", "Đèn tưởng niệm"],
    guardian: "hac-vo-thuong",
    palette: ["#2f3049", "#a4b3d9"],
    effect:
      "Bóng vong ngồi bên cửa, đèn tưởng niệm sáng; không làm trò cười về người mất.",
  },
  {
    floor: 15,
    title: "Phanh thây / xẻ thịt",
    description: "Trách hình: thân vong bị phân tách.",
    setting: "Trách hình pháp trường",
    props: ["Khung treo", "Dây giữ", "Dao hành hình"],
    guardian: "quy-su",
    palette: ["#3f2a3d", "#c6a2c7"],
    effect:
      "Bóng vong tách thành các khối trong suốt rồi tự ghép; không vết thương hay nội tạng.",
  },
  {
    floor: 16,
    title: "Thiêu trên núi lửa",
    description: "Vong bị đưa lên núi lửa thiêu đốt.",
    setting: "Hỏa sơn dung nham",
    props: ["Miệng núi lửa", "Dung nham", "Đá cháy"],
    guardian: "ma-dien",
    palette: ["#4b2b29", "#e79460"],
    effect: "Lửa cách điệu phun từng nhịp; tóc khói vong dựng đứng.",
  },
  {
    floor: 17,
    title: "Nghiền bằng cối xay",
    description: "Vong bị nghiền trong cối đá.",
    setting: "Thạch ma luân xưởng",
    props: ["Cối xay đá", "Tay quay", "Máng hứng"],
    guardian: "nguu-dau",
    palette: ["#3c3b2f", "#bfb48c"],
    effect: "Cối quay, bóng hồn đi qua thành sao sáng rồi tụ lại.",
  },
  {
    floor: 18,
    title: "Cưa thân",
    description: "Vong bị giữ trên khung và cưa.",
    setting: "Đao cưa hình đài",
    props: ["Khung bốn trụ", "Cưa hai tay", "Dây buộc"],
    guardian: "quy-su",
    palette: ["#37322d", "#cfbb8d"],
    effect: "Lưỡi cưa qua màn khói, bóng vong tách đôi rồi khép lại.",
  },
];
export const realms = [
  {
    id: "deva",
    name: "Thiên",
    color: "#d8bc77",
    meaning: "Cõi trời; vẫn thuộc vòng sinh tử.",
  },
  {
    id: "asura",
    name: "A-tu-la",
    color: "#c2856d",
    meaning: "Cõi a-tu-la, thường gắn với tranh đấu.",
  },
  {
    id: "human",
    name: "Nhân",
    color: "#9cbd8d",
    meaning: "Cõi người.",
  },
  {
    id: "animal",
    name: "Súc sinh",
    color: "#9fadd0",
    meaning: "Cõi loài vật.",
  },
  {
    id: "preta",
    name: "Ngạ quỷ",
    color: "#c09bca",
    meaning: "Cõi quỷ đói.",
  },
  {
    id: "hell",
    name: "Địa ngục",
    color: "#c67c6c",
    meaning: "Cảnh giới chịu khổ; không đồng nghĩa hình phạt vĩnh viễn.",
  },
];
export const rebirthSteps = [
  {
    title: "Thập điện xét nghiệp",
    detail:
      "Các vua xét việc đã làm; Thập điện không phải tên gọi khác của 18 tầng.",
  },
  {
    title: "Các ngục theo nghiệp",
    detail:
      "Các cảnh hình phạt thuộc dị bản dân gian. Các vùng có thể được ghé thăm theo nhiều hướng; đó là cách chuyển thể trong game.",
  },
  {
    title: "Chuyển Luân định đường",
    detail: "Điện thứ mười gắn với việc chuyển sinh.",
  },
  {
    title: "Mạnh Bà · quên ký ức",
    detail:
      "Bát canh quên lãng là mô-típ dân gian, không phải điều khoản chung của mọi kinh Phật.",
  },
  {
    title: "Lục đạo tái sinh",
    detail:
      "Thiên, A-tu-la, Nhân, Súc sinh, Ngạ quỷ, Địa ngục; đều trong vòng luân hồi.",
  },
];
