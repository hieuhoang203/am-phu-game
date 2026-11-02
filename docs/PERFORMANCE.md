# Chuyển động và độ trễ

## Nguyên nhân và thay đổi

Bản cũ gửi tọa độ mỗi 50 ms rồi chờ máy chủ gửi lại trước khi nhân vật và camera đổi vị trí. Khi mạng trễ, nhiều lệnh lại tính từ cùng một tọa độ cũ; chuyển động vừa giật vừa chậm. Mỗi bước còn phát lại toàn bộ phòng và dựng lại phần địa hình SVG.

- `src/motion.ts`: dự đoán nhân vật tại máy ngay khi nhận phím / cần cảm ứng. Đối chiếu inputSeq máy chủ đã xử lý, phát lại phần còn chờ, làm dịu sai lệch nhỏ trong khoảng vài khung hình.
- `shared/motion.ts`: cùng một phép tính tốc độ, chuẩn hóa đường chéo và va chạm cho hai phía.
- `src/App.tsx`: mô phỏng theo thời gian thực, gom lệnh gửi khoảng 20 lần/giây. Giới hạn bước thời gian khi tab bị treo, giới hạn mô phỏng tối đa 125 Hz để màn hình 144/240 Hz không làm tràn lô input. Trước khi dùng chiêu hoặc tương tác sẽ gửi nốt lệnh đi còn chờ.
- `WorldScene`: actor và camera vẽ theo requestAnimationFrame; địa hình tĩnh và rig nhân vật được memo hóa. Nội suy người khác qua bộ đệm 80 ms, không đoán chạy tiếp vô hạn khi mất gói.
- `server/game.ts`: xử lý input có số thứ tự, tick 20 Hz; snapshot gom theo vùng, không phát lại cả phòng sau mỗi input. Chiêu và chuyển vùng vẫn phản hồi ngay.
- Chiêu có phản hồi sáng nút / cử động / tiếng nhấn tại máy. Kết quả gõ choáng, kéo, ném và cứu vẫn chờ máy chủ kiểm tra, không tự tuyên bố đánh trúng ở client.

Máy chủ kiểm soát thời gian di chuyển, hướng, va chạm, thể lực và trạng thái. Phát lại cùng input không được đi hai lần. Lệnh dồn không tạo thêm thời gian. Gói thuộc vùng cũ bị bỏ qua; các trạng thái choáng / ngã / kéo / hồi hồn không được nội suy qua cảnh trước đó.

## Đo chẩn đoán trước và sau

Chromium trên máy phát triển, giữ phím D 1,2 giây; thêm trễ WebSocket **100 ms mỗi chiều** bằng wrapper kiểm thử cho cả gửi và nhận:

| Chỉ số | Trước | Sau lần sửa đầu |
| --- | ---: | ---: |
| Từ nhấn phím tới hình ảnh bắt đầu đi | 246 ms | 12 ms |
| Khung đo / khung có thay đổi vị trí | 65 / 4 | 63 / 62 |
| Quãng đường trong lượt giữ phím | 45 | 291 |

Đây là số đo chẩn đoán tại máy này, không phải đảm bảo FPS hay độ trễ trên mọi thiết bị. Số khung còn phụ thuộc CPU/GPU, trình duyệt và tần số màn hình. Kết quả thực tế cuối được ghi vào motion-metrics.json trong output của Playwright.

## Kiểm chứng

```powershell
npm test
npm run build
npm run check:language
$env:GAME_URL='http://localhost:5173'
npx playwright test tests/browser.spec.mjs tests/mischief.spec.mjs tests/models.spec.mjs tests/settings.spec.mjs tests/motion.spec.mjs --workers=1 --reporter=line
```

- Kiểm thử thuần: xác nhận / phát lại không đi hai lần; đối chiếu mềm; đổi vùng, choáng và nối lại xóa dự đoán; nội suy và dừng người khác; đường chéo, vật cản và giới hạn thời gian.
- Kiểm thử mạng: seq chống phát lại, gói quá lớn / sai dạng bị bỏ qua, ngân sách vận tốc có hiệu lực khi dồn gói, không trộn input và move để tăng tốc, chặn đi khi choáng và gói từ vùng cũ.
- Trình duyệt: thêm 100 ms trễ mỗi chiều, yêu cầu hình ảnh phản hồi trong 100 ms, đổi vị trí trên ít nhất 60% khung đo tại máy mình; quan sát chuyển động của người khác và xác nhận hai bên về cùng tọa độ sau khi dừng. Kiểm tra phản hồi nút trước khi máy chủ trả lời.
- Kiểm tra lại đi qua cổng, rương, cảm ứng, gõ–kéo–ném–cứu, model và cài đặt.

Cách tối ưu này giảm độ trễ cảm nhận và tải đồng bộ; không loại bỏ độ trễ truyền tin thật. Chưa benchmark tải sản xuất hoặc kiểm tra trên điện thoại thật.

Kết quả cuối: **25/25** kiểm thử luật / mạng đạt; **6/6** kịch bản Playwright đạt. Build và kiểm tra ngôn ngữ thành công. Dữ liệu trước / sau và lượt hai trình duyệt cuối lưu tại [motion-results.json](performance/motion-results.json).
