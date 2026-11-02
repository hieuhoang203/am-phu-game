# Âm Phủ Du Ký

Game web 2D khám phá 18 tầng địa ngục, chơi đơn hoặc nhiều người theo phòng. Giao diện tiếng Việt, mỹ thuật xanh mực / đồng cổ, bản đồ SVG gốc. Bản MVP 0.4 được tạo trong thư mục `D:\HieuHoang_GTSC\am-phu-game`.

## Chạy tại máy

Yêu cầu Node.js 22 trở lên, npm. Các phiên bản cài thực tế được khóa trong `package-lock.json`.

```powershell
npm ci
npm run build
npm start
```

Mở **http://localhost:3001**. Hai cửa sổ trình duyệt nhập cùng mã phòng để gặp nhau. Mỗi phòng tối đa 16 người. Chia sẻ mã phòng và URL máy chủ; `localhost` chỉ truy cập trên chính máy đang chạy. Để chơi cùng máy khác trong LAN, dùng `http://<IP-máy-chủ>:3001` và cho phép cổng 3001 trong firewall. Chưa cấu hình dịch vụ public Internet.

Chế độ phát triển:

```powershell
npm run dev
```

Mở **http://localhost:5173**; Vite proxy Socket.IO và `/api` sang máy chủ 3001. Không chạy `npm start` đồng thời với `npm run dev` nếu cùng cổng máy chủ.

## Cách chơi

1. Nhập tên, chọn mã phòng. Khách có thể xem Tàng thư trước khi vào game.
2. Nhấp bản đồ để đi, hoặc dùng WASD / phím mũi tên. Nhấp mục nhiệm vụ để tự đi tới mục tiêu.
3. Thắp hai đèn ở mỗi tầng. Đèn dùng chung cho người trong phòng, cùng tầng.
4. Đến Dẫn hồn sứ, chọn câu trả lời để nhận ấn cá nhân. Sai có thể thử lại.
5. Đến cổng phía bắc để xuống tầng. Đủ 18 ấn, đến cổng tầng 18 để gặp giao diện Chuyển Luân–Mạnh Bà, bắt đầu lượt mới và lưu số vòng đã hoàn tất.
6. Chat trong phòng, mời người chơi bằng liên kết, mở Tàng thư để đọc điển tích của mọi tầng.

`E` tương tác với mục tiêu gần nhất. Nút âm thanh bật âm nền tổng hợp nhẹ, không cần file âm thanh bên ngoài. Trên điện thoại, chạm vào cảnh hoặc các mục nhiệm vụ.

## Công nghệ và cấu trúc

| Phần | Công nghệ | Lý do |
| --- | --- | --- |
| Giao diện | React 19, TypeScript, Vite 6 | Dễ phát triển giao diện, dùng chung kiểu dữ liệu |
| Bản đồ | SVG và vòng di chuyển 20 lần/giây | Nhẹ, co giãn màn hình, không cần tải game engine |
| Máy chủ | Node.js, Express 5 | Phục vụ bản build và API trên cùng origin |
| Nhiều người | Socket.IO 4 | Đồng bộ vị trí, chat, sự kiện theo phòng, tự kết nối lại |
| Tiến trình | JSON trên máy chủ, ghi file tạm rồi đổi tên | Đủ cho một tiến trình MVP; chưa cần database riêng |
| Kiểm chứng | node:test, Socket.IO client, Playwright | Kiểm tra quy tắc máy chủ và tương tác trình duyệt |

```text
am-phu-game/
├── src/
│   ├── main.tsx              # Khởi tạo React
│   ├── App.tsx               # Giao diện, socket, điều khiển và hành trình
│   ├── components/
│   │   ├── Scene.tsx         # Cảnh SVG và nhân vật đồng bộ
│   │   └── Motif.tsx         # 18 biểu tượng gốc
│   └── styles.css            # Giao diện desktop, mobile, giảm chuyển động
├── server/
│   ├── index.ts              # HTTP, Socket.IO, phục vụ dist
│   └── game.ts               # Quy tắc phòng, di chuyển, đèn, giải ấn, lưu tiến trình
├── shared/world.ts           # 18 tầng, nguồn, tọa độ và kiểu dữ liệu chung
├── public/illustrations/     # 18 file SVG, có thể tái xuất từ mã nguồn
├── scripts/export-catalog.tsx
├── tests/                    # Integration test và browser test
├── docs/
│   ├── RESEARCH.md           # Nghiên cứu, độ tin cậy, hình tham khảo, chuyển thể
│   ├── FLOORS.md             # Danh mục chi tiết từng tầng và hình minh họa
│   ├── ARCHITECTURE.md       # Luồng kỹ thuật, sự kiện, ranh giới MVP
│   └── screenshots/          # Ảnh kiểm tra desktop, mobile, multiplayer
├── data/progress.json        # Sinh khi nhận ấn; dữ liệu runtime, không đưa vào Git
├── dist/                     # Kết quả npm run build
├── package.json
└── package-lock.json
```

## Dữ liệu, cấu hình và vận hành

- `PORT`: cổng máy chủ, mặc định `3001`.
- `SAVE_PATH`: đường dẫn file tiến trình, mặc định `data/progress.json`.
- Tên, mã phòng và token hành trình nằm trong `sessionStorage`, riêng từng thẻ. Tải lại trang giữ tiến trình; đóng thẻ có thể làm mất khóa truy cập. Đây chưa phải tài khoản lâu dài hoặc đăng nhập đa thiết bị.
- Máy chủ lưu hash của token ngẫu nhiên 256 bit, số tầng mở, danh sách ấn và tên. Sao lưu file tiến trình nếu muốn giữ dữ liệu khi chuyển máy.
- Đèn, danh sách người chơi và 50 tin nhắn gần nhất ở RAM; xóa khi phòng trống / restart. Mã phòng chỉ phân nhóm, không cung cấp quyền truy cập riêng tư.
- Google Fonts được tải khi có Internet; có font hệ thống dự phòng. Gameplay và minh họa không phụ thuộc dịch vụ ảnh.

## Kiểm tra

```powershell
npm test
npm run build
npx playwright install chromium
# Trong cửa sổ thứ hai, chạy npm start trước:
npx playwright test tests/browser.spec.mjs --workers=1 --timeout=90000 --reporter=line
```

Tái xuất hình và danh mục: `npx tsx scripts/export-catalog.tsx`.

Các kiểm tra thực hiện gồm: hai client cùng phòng và khác phòng, chat, giới hạn dịch chuyển, từ chối tầng chưa mở, thắp đèn hợp tác, trả lời sai / đúng, chuyển tầng, khôi phục tiến trình từ file trên máy chủ mới; trình duyệt kiểm tra chat hiển thị chuỗi HTML an toàn, hành trình qua tầng đầu, tải lại, Tàng thư và không tràn ngang ở màn hình 390px.

## Ranh giới bản MVP

Có thể đi qua đủ 18 tầng với 18 sân cảnh hình phạt riêng, bố cục điều khiển chung; nhân vật, đạo cụ, màu và câu chuyện thay đổi theo tầng. Chưa có mesh 3D, 18 mặt bằng có vật lý riêng, chiến đấu bằng vũ khí / sát thương lâu dài, giao dịch, party có trưởng nhóm, quản trị chat, tài khoản hoặc lưu tiến trình đa thiết bị. Chưa benchmark tải đồng thời quy mô lớn. Máy chủ kiểm soát khoảng cách và mở tầng nhưng không phải hệ thống chống gian lận hoàn chỉnh; đáp án có trong dữ liệu client vì đây là game đọc / khám phá, không có phần thưởng giá trị.

Để phát hành lâu dài: chuyển lưu trữ sang PostgreSQL, thêm tài khoản, quản trị cộng đồng, HTTPS, giám sát, kiểm thử tải; dùng Redis adapter và tách trạng thái thế giới trước khi chạy nhiều máy chủ.

## Bộ model và luân hồi — phiên bản 0.2

- Mở **Đồ giám** trong game để xem 19 nhân vật, 18 sân cảnh và chú giải luân hồi. Nhấp Ngưu Đầu, Mã Diện hoặc sân cảnh trên bản đồ để mở mục tương ứng.
- 19 nhân vật: Quỷ sứ, Ngưu Đầu, Mã Diện, Hắc–Bạch Vô Thường, Phán quan, Mạnh Bà, Địa Tạng, Vong hồn và mười vua Thập điện.
- 57 model SVG nhân vật (ba trạng thái / nhân vật), 18 model sân cảnh SVG: `public/models/`. Đây là vector 2D có rig và hoạt hình CSS, không phải mesh 3D hay ảnh raster.
- Thư viện độc lập: **http://localhost:3001/models/index.html** sau khi khởi động server. SVG nền trong suốt, có thể mở và sửa bằng công cụ vector.
- Tái xuất: `npx tsx scripts/export-models.tsx` rồi `npm run build`. Chạy script trước build để đưa đủ asset vào dist.
- Mã nguồn mới: `shared/mythology.ts`, `CharacterSprite.tsx`, `PunishmentStage.tsx`, `MythologyLibrary.tsx`, `mythology.css`. Tài liệu thiết kế ở [docs/models](docs/models/CHARACTERS.md).
- Thứ tự 18 tầng và Thập điện theo S1; các bộ tranh khác có thể đổi vị trí điện VIII–IX. Tên, vai trò và hình phạt tách khỏi lời thoại / bài học do game sáng tác.
- Hình phạt được kể bằng hoạt hình bóng hồn, không mô phỏng tổn thương cơ thể. Nghiệt Kính là xét nghiệp, Uổng Tử là giam giữ.
- Luân hồi có sáu cõi để đọc chú giải. Bắt đầu lượt mới là cơ chế game sau khi đủ 18 ấn, không phải mô phỏng nghiệp hay quy định mọi vong đều qua 18 tầng. Máy chủ lưu số vòng, đặt lại ấn và tầng cá nhân; đèn phòng vẫn được chia sẻ với người đang chơi.
- Kiểm tra mới: `npx playwright test tests/models.spec.mjs --workers=1 --timeout=90000 --reporter=line`.

## Vong hồn quậy phá — 0.3

Người chơi luôn vào dưới dạng vong hồn. Chọn phe A/B/C hoặc chia tự động; cùng phòng để gặp các phe. Có đẩy ngã, gõ hai lần gây choáng, kéo người đã choáng, ném vào cảnh hình phạt của tầng, đỡ đòn, giải cứu, vùng vẫy, đặt và dọn vỏ chuối. Thể lực, hồi chiêu, khoảng cách và chuỗi trạng thái do máy chủ kiểm soát.

[Luật chơi và toàn bộ phím điều khiển](docs/GAMEPLAY.md). Chọn người trên bản đồ hoặc bảng mục tiêu, dùng nút / phím F G R T Q C V X; Space để vùng vẫy. Điểm phe dùng chung 18 tầng, có vùng nghỉ và bảo vệ sau hồi hồn; không mất ấn khi bị troll.

Mã mới: `shared/mischief.ts` (luật / kiểu / điều chỉnh cân bằng), `server/mischief.ts` (máy trạng thái và quan hệ kéo), `src/components/MischiefPanel.tsx`, `src/mischief.css`.

Kiểm tra tình huống: `npm test`; kiểm tra 3 trình duyệt: `npx playwright test tests/mischief.spec.mjs --workers=1 --timeout=90000 --reporter=line`.

## Giao diện và Cài đặt — 0.4

Bảng chiêu có biểu tượng, nhóm hành động, chi phí thể lực, thời gian / thanh hồi chiêu và lý do khóa nút. Thanh điều hướng điện thoại và bảng cài đặt có bố cục riêng.

Mở nút **Cài đặt trò chơi** ở góc trên: ba âm lượng (tổng / nền / hiệu ứng), bật tắt tiếng và ngắt tiếng khi rời cửa sổ; 5 màu âm hồn, 3 biểu cảm, 5 phụ kiện, 4 hào quang; giảm chuyển động, hạt sáng, tên trên bản đồ, tương phản, nút lớn và gợi ý phím. Có model xem trước, lưu tự động, nút khôi phục mặc định. Ngoại hình đồng bộ cho người cùng phòng và giữ sau luân hồi.

[Hướng dẫn Cài đặt và cách lưu](docs/SETTINGS.md). Các ảnh tự động từ Playwright được ghi trong `test-results`, những ảnh chọn bàn giao được sao chép riêng sang `docs/screenshots`.

Kiểm tra mới: `npx playwright test tests/settings.spec.mjs --workers=1 --timeout=90000 --reporter=line`.
