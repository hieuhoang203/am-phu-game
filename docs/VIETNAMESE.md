# Nội dung dự án bằng tiếng Việt

Báo cáo phần Việt hóa ở phiên bản 0.4. Luật chơi hiện hành đã chuyển sang thế giới mở ở phiên bản 0.5, xem [GAMEPLAY.md](GAMEPLAY.md) và [VALIDATION-0.5.md](VALIDATION-0.5.md). Kiểm tra ngôn ngữ tiếp tục được áp dụng cho bản mới.

## Phạm vi đã thay đổi

- Xóa cột dữ liệu chữ gốc khỏi danh mục 18 tầng, 19 nhân vật và sáu cõi.
- Dùng tên tiếng Việt trên giao diện, bản đồ, cổng tầng, Đồ giám, Tàng thư và bánh xe luân hồi.
- Logo là chữ Quốc ngữ; mũ Hắc / Bạch dùng chữ viết tắt, ấn thưởng dùng chữ “ẤN”.
- Tên tác giả và tiêu đề nguồn trong tài liệu được viết lại bằng tiếng Việt; giữ các liên kết tư liệu tham khảo.
- Sửa công cụ sinh danh mục / model rồi xuất lại toàn bộ SVG, thư viện HTML và tài liệu sinh tự động.
- Thay toàn bộ 23 ảnh PNG cũ của dự án bằng ảnh chụp mới từ giao diện tiếng Việt, giữ tên file để các liên kết bàn giao vẫn dùng được.

Các tên gọi tiếng Việt như Bạt Thiệt, Ngưu Đầu, Mã Diện, Diêm La Vương, Mạnh Bà được giữ lại. Quy tắc khám phá, tương tác, phe và tiến trình không thay đổi.

## Kiểm chứng

- `npm run build`: thành công.
- `npm test`: 19 bài kiểm tra đạt, gồm kiểm tra nguồn / tài liệu / tài sản ngôn ngữ và các quy tắc game cũ.
- Bốn kịch bản Playwright đạt: khám phá hai người, quậy phá ba người, toàn bộ Đồ giám và Cài đặt; kiểm tra desktop và màn hình 390px.
- `npm run check:language`: quét nguồn, tài liệu, SVG / HTML và bản build; xử lý cả ký tự Unicode viết trực tiếp và escape trong JavaScript. Không coi mẫu Unicode của thư viện nền là nội dung ngôn ngữ của game.
- Đã xuất lại 57 SVG nhân vật, 18 SVG sân cảnh, 18 SVG biểu tượng và hai bảng tổng hợp.

Thư viện bên thứ ba và lịch sử Git không được sửa. Phần trò chuyện vẫn nhận nội dung người dùng; đây không phải bộ lọc ngôn ngữ hay quy tắc kiểm duyệt chat.
