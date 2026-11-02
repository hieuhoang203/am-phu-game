# Giao diện và Cài đặt — 0.5

Mở **Cài đặt** ở góc phải của HUD. Nội dung áp dụng ngay; Xong hoặc Esc đóng bảng. Cài đặt vẫn có thể mở trước khi vào phòng.

## Hệ thống nút

- Chín chiêu trong thanh kỹ năng, có biểu tượng, phím, thể lực và thời gian hồi.
- Nút không khả dụng khi chưa chọn mục tiêu, chưa tới gần, chưa gây choáng, thiếu thể lực hoặc đang được bảo hộ. Di chuột để xem điều kiện.
- Chạm vào vong để chọn, mục tiêu có viền và bảng trạng thái. Di chuyển tới sân bằng phím, chạm cảnh hoặc bản đồ nhỏ.
- Điện thoại có cần điều khiển và thanh chiêu ba hàng; các chức năng bản đồ, hội, sổ tay, cài đặt và hướng dẫn vẫn nằm trên HUD.

## Âm thanh

| Mục | Mặc định | Tác dụng |
| --- | --- | --- |
| Âm lượng tổng | 65% | Gain chung của toàn bộ âm thanh |
| Âm nền | 35% | Gain riêng cho âm nền tổng hợp |
| Hiệu ứng | 65% | Gain cho các tiếng gõ, đẩy, ném, cứu và thao tác |
| Tắt tiếng | Bật | Lần đầu vào game không tự phát tiếng |
| Tắt khi rời cửa sổ | Bật | Ngắt âm khi đổi thẻ, cửa sổ mất focus; khôi phục theo mức cũ khi quay lại |

Nút loa ở thanh trên dùng chung trạng thái với bảng Cài đặt. **Nghe thử hiệu ứng** chỉ hoạt động khi đã bật tiếng, âm tổng và hiệu ứng lớn hơn 0. Âm thanh chạy qua Web Audio sau thao tác của người dùng; không phụ thuộc file nhạc ngoài hay dịch vụ mạng. Khi trình duyệt chặn tự phát, cần thao tác bật / nghe thử.

`GameAudio` quản lý ba gain node; các hiệu ứng ngắn đều đi qua gain hiệu ứng rồi gain tổng. Nguồn âm nền không bị slider hiệu ứng thay đổi. Thay đổi âm lượng có ramp ngắn để giảm tiếng nổ tách.

## Ngoại hình âm hồn

- 5 bảng màu: Ngọc bích, Sương lam, Đèn hổ phách, Khói tím, Sen hồng.
- 3 biểu cảm: mắt tròn, buồn ngủ, tinh nghịch.
- 5 lựa chọn phụ kiện: đầu trần, lá bùa, đèn lồng, hoa sen, sừng nhỏ.
- 4 lựa chọn hào quang: không, đốm sáng, sương, vòng tinh tú.

Model xem trước cập nhật ngay. Trong phòng, thay đổi được gửi sau 350ms không thao tác để gộp các lần chọn nhanh; máy chủ kiểm tra toàn bộ enum, lưu và phát diện mạo mới cho người cùng tầng. Trạng thái đồng bộ xuất hiện dưới model. Trước khi vào phòng, lựa chọn được gửi kèm đăng ký vong.

Đây là tùy biến mỹ thuật của vong hồn, không đổi tốc độ, hitbox, phe hoặc quyền mở tầng. Người chơi vẫn có dấu phe và thông tin trạng thái riêng. Máy chủ giữ diện mạo trong file tiến trình; nhận ấn, mở lượt mới và kết nối lại không xóa trường này.

## Hiển thị và điều khiển

- Bật / tắt hạt sáng trong cảnh và hạt trang trí hào quang.
- Giảm chuyển động: dừng hoạt cảnh trang trí / lặp; vị trí, chiêu và trạng thái thật vẫn cập nhật.
- Bật / tắt tên trên bản đồ. Bảng mục tiêu vẫn có tên và trạng thái.
- Tăng tương phản chữ / viền; tăng kích thước nút thao tác.
- Bật / tắt nhãn phím tắt. Phím vẫn dùng được khi ẩn gợi ý.
- Trang Điều khiển liệt kê WASD / mũi tên, E và các chiêu. Chưa có gán lại phím; thao tác cảm ứng dùng bảng nút. Tổ hợp Ctrl / Cmd / Alt không bị chiếm.

Thiết bị đặt `prefers-reduced-motion` vẫn được tôn trọng qua CSS.

## Lưu trữ và khôi phục

Toàn bộ cài đặt cá nhân dùng `localStorage`, khóa `am-phu.settings.v1`. Cài đặt riêng theo trình duyệt và địa chỉ game; đây chưa phải đồng bộ cấu hình tài khoản trên nhiều thiết bị. Có chuẩn hóa khi đọc: giá trị âm lượng bị chặn trong 0–100, lựa chọn lạ về mặc định, JSON hỏng không làm app ngừng chạy. Nếu lưu trình duyệt thất bại, giao diện báo chưa lưu được.

Ngoại hình còn được lưu cùng tiến trình trên máy chủ để phát cho người khác. Client gửi lựa chọn hiện tại khi vào lại phòng. **Khôi phục mặc định** chỉ đặt lại các tùy chọn này; không xóa ấn, tầng đã mở hay số vòng luân hồi.

Mã nguồn: `src/settings.ts`, `src/audio.ts`, `shared/customization.ts`, `SettingsPanel.tsx`, `interface.css`. Quy tắc quậy phá vẫn nằm riêng trong `shared/mischief.ts` và `server/mischief.ts`.
