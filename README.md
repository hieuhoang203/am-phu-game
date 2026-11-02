# Âm Phủ Du Ký

Game web thế giới mở 2D, chơi đơn hoặc tối đa 16 người trong một phòng. Phiên bản **0.5** thay toàn bộ vòng chơi trả lời câu hỏi bằng tự do ngao du, tìm địa điểm và tương tác trực tiếp giữa các vong hồn. Giao diện, model và tài liệu hiển thị dùng tiếng Việt.

## Chạy game

Node.js 22 trở lên:

```powershell
npm ci
npm run build
npm start
```

Mở **http://localhost:3001**. Hai trình duyệt dùng chung mã phòng để gặp nhau. Máy khác trong LAN dùng `http://<IP-máy-chủ>:3001`. Chế độ phát triển: `npm run dev`, mở `http://localhost:5173`.

`npm run dev` khởi động cả máy chủ 3001 và giao diện 5173. Chạy một chế độ tại một thời điểm; dùng Ctrl+C trong cửa sổ đang chạy trước khi chuyển giữa `npm start` và `npm run dev`. Hai lệnh đều kiểm tra cổng trước khi khởi động, không tự dừng tiến trình khác. Nếu muốn dùng cổng máy chủ khác trong PowerShell:

```powershell
$env:PORT='3002'
npm run dev
```

Giao diện vẫn ở 5173 và proxy tự chuyển sang máy chủ 3002. Khi quay lại cổng mặc định: `Remove-Item Env:PORT -ErrorAction SilentlyContinue`.

## Vòng chơi mới

- 18 vùng rộng **2.800 × 1.900 đơn vị**, camera bám nhân vật; đi xuyên cảnh, qua rừng, bờ sông, cầu, trạm nghỉ và phế tích.
- Mọi vùng mở ngay từ đầu. Mỗi vùng có ba cổng: vùng kế tiếp, vùng trước và lối tắt cách sáu vùng. Chọn đường tùy ý; số thứ tự giữ vai trò danh mục truyền thuyết.
- Khám phá rương, đài ký ức, phế tích, gặp quỷ sứ và nghỉ chân. Rương cho 25 đốm hồn, các địa điểm khác cho 5 đốm lần đầu; lưu riêng từng người, không thể lấy lặp.
- Bản đồ lớn vạch đường qua cổng; nhân vật thực sự đi tới từng cổng, không dịch chuyển bằng menu. Phím di chuyển hủy dẫn đường.
- Ba hội có điểm troll chung: gõ choáng, kéo, ném, cứu, đỡ đòn, vỏ chuối, gỡ bẫy và vùng vẫy. Hình phạt là hoạt cảnh hài ngắn; không mất kỷ vật.
- Gặp Mạnh Bà tại trạm nghỉ vùng 18 để trở lại đầu hành trình. Giữ ngoại hình, đốm hồn và địa điểm đã tìm thấy. Không yêu cầu câu hỏi, ấn hay hoàn thành đủ 18 vùng.

| Điều khiển | Thao tác |
| --- | --- |
| WASD / phím mũi tên | Đi tự do |
| Chạm đất / bản đồ nhỏ | Tìm đường tới vị trí; chạm địa điểm để tới và tương tác |
| Cần điều khiển | Đi trên thiết bị cảm ứng |
| E | Tương tác địa điểm gần nhất |
| M | Bản đồ 18 vùng, chọn nơi để dẫn đường |
| Chạm vong khác | Chọn mục tiêu |
| F / G | Đẩy ngã / Gõ đầu |
| R / T | Kéo hoặc thả / Ném vào sân hình phạt |
| Q / C / Space | Đỡ đòn / Cứu / Vùng vẫy |
| B / V | Đặt vỏ chuối / Dọn bẫy |
| Lăn chuột, nút + − | Phóng to / thu nhỏ |
| Esc | Đóng hộp thoại, dừng đường đi |

Thanh kỹ năng cho biết hồi chiêu và thể lực. Di chuột lên từng nút để xem điều kiện dùng. Góc phải có bản đồ, hội đồng hành, sổ tay 19 nhân vật / 18 sân hình phạt, cài đặt và hướng dẫn. Cài đặt âm thanh, ngoại hình và hiển thị được lưu tự động.

## Công nghệ và tổ chức mã

React 19 + TypeScript + Vite 6; cảnh SVG với camera và điều khiển 20 lần/giây. Node.js + Express 5 + Socket.IO 4 kiểm tra luật phía máy chủ. Tiến độ ghi JSON bằng file tạm rồi đổi tên.

```text
src/
  App.tsx                    Kết nối, điều khiển, HUD, bản đồ lớn và hộp thoại
  components/WorldScene.tsx  Cảnh toàn màn hình, camera, địa hình, model, người chơi
  components/CharacterSprite.tsx / PunishmentStage.tsx
  components/SettingsPanel.tsx / MythologyLibrary.tsx
  world.css                  Giao diện thế giới mở, desktop và cảm ứng
  settings.ts / audio.ts      Lưu tùy chỉnh, âm thanh tổng hợp
shared/
  exploration.ts             18 vùng, địa điểm, đồ thị cổng, va chạm, tìm đường A*
  world.ts                   Truyền thuyết tiếng Việt và kiểu giao thức
  mischief.ts                Thể lực, trạng thái, chiêu và vùng bảo hộ
  mythology.ts / customization.ts
server/
  game.ts                    Phòng, di chuyển, khám phá, qua cổng, lưu tiến độ
  mischief.ts                Luật troll có thẩm quyền máy chủ
  index.ts                   HTTP / Socket.IO
public/models/               Model SVG và thư viện độc lập
scripts/                     Xuất model, tài liệu, kiểm tra ngôn ngữ
 tests/                      Kiểm thử luật, mạng và trình duyệt
 docs/                       Tài liệu nguồn, kiến trúc, gameplay, ảnh kiểm chứng
```

## Dữ liệu và kiểm tra

`PORT` mặc định 3001; `SAVE_PATH` mặc định `data/progress.json`. Token hành trình trong `sessionStorage`, riêng từng thẻ; ngoại hình và tùy chỉnh trong `localStorage`. Dữ liệu cũ được tiếp nhận, giữ các ấn lịch sử nhưng không dùng để khóa đường. Khám phá, vùng đã ghé, vùng hiện tại, đốm hồn, ngoại hình và số vòng được lưu. Tọa độ trong vùng trở về trạm xuất phát khi kết nối lại. Chat, điểm hội và bẫy ở RAM.

```powershell
npm test
npm run build
npm run check:language
# Khởi động npm start ở cửa sổ khác trước khi chạy:
$env:GAME_URL='http://localhost:3001'
npx playwright test tests/browser.spec.mjs tests/models.spec.mjs tests/settings.spec.mjs tests/mischief.spec.mjs --workers=1 --reporter=line
```

Tài liệu: [Gameplay](docs/GAMEPLAY.md), [kiến trúc](docs/ARCHITECTURE.md), [18 tầng](docs/FLOORS.md), [nghiên cứu và nguồn](docs/RESEARCH.md), [kiểm chứng 0.5](docs/VALIDATION-0.5.md). Thư viện model độc lập: `/models/index.html`.

Đây là bản chơi được của thế giới mở 2D phân vùng, chưa phải thế giới 3D liền mạch. Các vùng dùng bộ đường nền chung, thay đổi vật cản, cảnh quan và sân hình phạt theo vùng. Chưa có tài khoản đa thiết bị, giao dịch, quản trị phòng hoặc hạ tầng nhiều máy chủ. Không tự xuất bản ra Internet; cần HTTPS, tài khoản, database và kiểm thử tải trước khi mở dịch vụ công cộng.
