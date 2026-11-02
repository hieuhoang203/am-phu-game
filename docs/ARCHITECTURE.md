# Kiến trúc 0.5

## Trách nhiệm

- `shared/exploration.ts`: tọa độ 2.800 × 1.900, 18 cấu hình vùng tất định, địa điểm, chướng ngại, kiểm tra đoạn đi và A* tám hướng. Đồ thị ba cổng mỗi vùng liên thông cả 18 vùng.
- `src/components/WorldScene.tsx`: SVG theo camera, địa hình và model, cổng, địa điểm, người chơi, dây kéo và đường đi. Không quyết định thưởng hay trạng thái game.
- `src/App.tsx`: phiên Socket.IO, HUD toàn màn hình, route, điều khiển phím / cảm ứng, atlas, chat và modal. Điều khiển gửi mỗi 50 ms; snapshot có cả sự kiện tức thời và tick 100 ms.
- `server/game.ts`: quản lý phòng, phiên token, kiểm tra vận tốc / va chạm, qua cổng theo khoảng cách, khám phá một lần và lưu tiến độ.
- `server/mischief.ts`: trạng thái làm ngã / choáng / kéo / phạt, thể lực, hồi chiêu, vùng bảo hộ, điểm hội và bẫy.

## Giao thức

`join {name,room,token?,team?,appearance?}` → `joined {player,token,room}`. `world` gửi người cùng vùng, chat cùng phòng và `social` gồm roster / điểm hội / bẫy / giờ máy chủ. Các trường `maxFloor=18`, `completed` và `lanterns` được giữ để tương thích dữ liệu cũ; không tham gia điều kiện mở vùng.

`move {x,y}` phải hữu hạn, trong biên, đoạn di chuyển không xuyên vật cản, dưới giới hạn vận tốc phụ thuộc trạng thái. Máy chủ không nhận floor từ move.

`interact id` xác minh địa điểm của vùng hiện tại và bán kính 105. Cổng gọi cùng luật với `travel destination`: đích phải là cạnh của vùng hiện tại và người chơi đứng gần đúng cổng. Không có handler `answer`. Rương / bia / trạm chỉ ghi thưởng lần đầu theo khóa `region:id` của từng người. NPC gửi `dialog`.

`mischief {action,targetId?}` kiểm tra luật trong engine; `action-result` báo kết quả cho hiệu ứng âm thanh. `appearance` kiểm tra enum, ghi và gửi `appearance-saved` hoặc `appearance-error`. `chat` giới hạn chiều dài / tần suất, React hiển thị văn bản an toàn.

`reincarnate` chỉ tại trạm Mạnh Bà vùng 18, khi hồi hồn và không kéo người. Tăng cycles, về vùng 1, giữ visited / discoveries / sparks / appearance. Không cần completed.

## Lưu trữ và tương thích

JSON ghi vào file tạm cùng thư mục rồi đổi tên. Key là SHA-256 của token ngẫu nhiên 256 bit; token do trình duyệt giữ trong sessionStorage. Các trường mới: `region`, `visited`, `discoveries`, `sparks`. Dữ liệu cũ giữ completed và appearance; visited khởi tạo từ lịch sử. maxFloor luôn 18. Không xóa hoặc viết đè snapshot cũ để chuyển đổi schema.

Ngoại hình / âm thanh / hiển thị trong localStorage. Vị trí cụ thể trong vùng không lưu, khi nối lại xuất hiện ở điểm nghỉ. Chat, điểm đội, bẫy và trạng thái khống chế là tạm thời.

## Giới hạn vận hành

Một tiến trình Node, tối đa 16 người / phòng. Chưa có database, xác thực đa thiết bị, quản trị cộng đồng, vùng streaming liền mạch hay máy chủ phân tán. Cảnh là 2D SVG, không phải mesh 3D. Tọa độ và luật server được kiểm thử; chưa có benchmark tải sản xuất. Các file kiểm chứng 0.2–0.4 mô tả phiên bản lịch sử, không phải gameplay hiện hành.
