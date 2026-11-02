# Kiến trúc bản MVP

## Quyền quyết định trạng thái

Trình duyệt gửi ý định qua Socket.IO. Máy chủ tạo danh tính theo kết nối, kiểm tra phòng, tọa độ, khoảng cách tương tác, đáp án và tầng tối đa. Trình duyệt không tự tăng tầng hay cấp ấn. Mỗi 50ms client gửi vị trí kế tiếp; server giới hạn tốc độ và biên thế giới. Không có vật cản / collision ở bản đầu; bản đồ là mặt phẳng điều khiển với phối cảnh minh họa.

Một Node.js process chứa nhiều phòng. Phòng chứa tối đa 16 nhân vật, trạng thái hai đèn theo tầng và 50 tin nhắn gần nhất. Người cùng tầng nhìn thấy nhau; tin nhắn đi toàn phòng để người ở tầng khác vẫn liên lạc được. Các kết nối chưa tham gia không nhận snapshot.

## Sự kiện

| Client → server | Dữ liệu | Quy tắc |
| --- | --- | --- |
| `join` | name, room, token? | Tên 1–24 ký tự, mã phòng 1–20 ký tự `[A-Z0-9-]`, kiểm tra đủ chỗ và token đang dùng |
| `move` | x, y | Số hữu hạn, giới hạn tốc độ 190 đơn vị/s với sai số nhỏ và clamp biên |
| `interact` | 0 hoặc 1 | Gần đèn <100 đơn vị, chia sẻ đèn theo phòng và tầng |
| `answer` | chỉ số lựa chọn | Gần NPC, đủ hai đèn; đúng mới lưu ấn và mở tầng |
| `travel` | tầng đích | Số nguyên 1–18, không vượt tầng mở; xuống sâu phải tới cổng |
| `chat` | chuỗi | Tối đa 240 ký tự, cách nhau ít nhất 900ms |

Server phát `joined` (token / nhân vật / mã phòng), `world` (người cùng tầng, đèn tầng đó, chat phòng), `notice` (phản hồi). Dữ liệu gói socket bị giới hạn 8KB, mỗi kết nối giới hạn 45 hành động/s. Không bật CORS tùy ý; Vite dùng proxy để giữ cùng origin.

## Lưu và khôi phục

Token 32 byte ngẫu nhiên do server cấp, lưu sessionStorage. Máy chủ chỉ dùng SHA-256 token làm khóa bản ghi; bản lưu gồm tên, tầng tối đa và các ấn đã nhận. Khi nhận ấn, ghi JSON sang file tạm rồi rename; hoạt động tuần tự trong một process. Khi kết nối lại tự tham gia từ tầng 1, giữ các tầng đã mở và các ấn. Mất token đồng nghĩa bản MVP không có cách tìm lại tài khoản.

File JSON phù hợp demo nhỏ, không thay thế cơ sở dữ liệu có transaction cho nhiều process. Lỗi file lưu không được tự xóa / ghi đè để “sửa”; nên sao lưu và kiểm tra nội dung. Nếu disk đầy hoặc file hỏng cần người vận hành xử lý. Trước public cần chuyển DB, phân quyền, quản trị chat và xử lý lỗi lưu có quan sát.

## Mở rộng có thể thực hiện tiếp

Tách quản lý kết nối khỏi UI khi thêm nhiều màn hình; dựng scene riêng từng tầng bằng engine khi cần vật lý, chiến đấu hoặc sprites; đưa nội dung vào CMS; thay lưu JSON bằng repository PostgreSQL; thêm tài khoản, reconnect vị trí và party. Để đa máy chủ cần trạng thái thế giới chung và Socket.IO Redis adapter; chỉ thêm adapter mà giữ phòng trong RAM riêng là chưa đủ.

## Model và lượt luân hồi (0.2)

`shared/mythology.ts` khai báo 19 nhân vật, 18 sân cảnh và sáu cõi. `world.ts` tham chiếu các đạo cụ từ danh mục này; không có nhập vòng. `CharacterSprite` là rig vector đầu / thân / mắt / tay / đạo cụ, dùng ba pose. `PunishmentStage` dựng riêng 18 nội dung sân cảnh. CSS chuyển động tôn trọng `prefers-reduced-motion`; nút dừng trong Đồ giám tắt class animation. Mở hộp thoại hủy lộ trình tự đi để không bị sự kiện di chuyển chen vào khi xem model.

`export-models.tsx` render cùng component bằng React server rendering thành 57 SVG nhân vật và 18 SVG cảnh độc lập, thêm thư viện HTML. Trạng thái game không nằm trong asset; cảnh minh họa không thực hiện damage lên người chơi. Click cảnh mở phần mô tả. Mặt phẳng điều khiển và tọa độ mục tiêu vẫn dùng chung để bảo toàn multiplayer.

Sự kiện `reincarnate` yêu cầu đủ 18 ấn, đứng gần cổng tầng 18. Máy chủ ghi lượt mới trước khi đổi trạng thái nhân vật, phát `reincarnated` rồi snapshot. Lượt mới đặt tầng / tầng tối đa về 1, xóa ấn cá nhân, tăng `cycles`; không xóa đèn / chat chung của phòng. Save cũ thiếu `cycles` được đọc là 0. Nút chọn cõi chỉ mở kiến thức phía client; không có phép tính nghiệp hay API cho người chơi chọn cảnh giới.

## Máy trạng thái tương tác (0.3)

`MischiefEngine` theo từng phòng sở hữu điểm phe và bẫy; mỗi player có `form: soul`, `team` và `soul`. Các trạng thái là `free`, `fallen`, `stunned`, `dragged`, `punished`. Quan hệ kéo là hai chiều `dragging` / `draggedBy`, luôn cùng tầng, được tháo khi thả, cứu, tỉnh lại, dính bẫy / đòn, hoặc ngắt kết nối. Không tăng hạn choáng khi bắt đầu kéo.

Client gửi `mischief {action,targetId?}`. Máy chủ xác thực loại chiêu, người cùng tầng, khoảng cách, trạng thái, thể lực, hồi chiêu và vùng an toàn. Mọi chuyển trạng thái chạy đồng bộ trong một process. `move` dùng tốc độ do máy trạng thái quyết định; actor bị khống chế có tốc độ 0, người kéo đi chậm. Các handler đèn / đáp án / chuyển tầng / luân hồi cũng kiểm tra máy trạng thái, nên bỏ qua UI không vượt được điều kiện.

Tick 100ms hồi thể lực, hết hạn bẫy / combo / khống chế và phát snapshot. Snapshot bổ sung thời gian máy chủ, điểm phe, bẫy ở tầng đang xem và danh sách nhóm ở mọi tầng. Client dùng thời gian máy chủ để hiển thị cooldown; kiểm tra trên UI chỉ hỗ trợ người chơi, không thay quyền quyết định của máy chủ.

Kiểm tra trượt chuối dùng đoạn từ vị trí trước tới sau, tránh lướt xuyên bẫy giữa hai bản tin. Đòn gây ngã hoặc bị phản đỡ sẽ buông người đang giữ. Cứu đồng đội chỉ cộng điểm khi khống chế do phe khác gây ra. Không có va chạm thân người hay vật lý rigid-body; các thao tác vị trí là luật của game 2D.
