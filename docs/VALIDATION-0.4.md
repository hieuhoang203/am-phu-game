# Kiểm chứng giao diện và Cài đặt 0.4

Ngày thực hiện: 02/11/2026.

- Build TypeScript / Vite thành công, không có cảnh báo CSS ở bản cuối.
- `npm test`: **18/18** bài kiểm tra thành công, gồm các bài cũ về trạng thái, mở tầng, lưu ấn và luân hồi.
- Các kịch bản trình duyệt về hai người khám phá, ba người quậy phá và Đồ giám tiếp tục đạt sau khi thay giao diện.
- Kịch bản Cài đặt đạt trên Chromium: bốn mục cài đặt, thay âm lượng, khôi phục qua tải lại trang, xem trước ngoại hình, người chơi khác nhìn thấy model mới, trạng thái đồng bộ và khôi phục mặc định.
- Kiểm tra trực tiếp Web Audio: context chạy sau thao tác, gain tổng / âm nền / hiệu ứng đổi theo từng slider; hiệu ứng phát thử đi qua gain hiệu ứng; blur / focus ngắt và khôi phục gain tổng khi bật tùy chọn.
- Nút nghe thử bị khóa khi tắt tiếng, âm tổng 0 hoặc hiệu ứng 0. Slider được kiểm tra qua thao tác bàn phím thật.
- Kiểm tra chế độ nút lớn bằng kích thước CSS thực, hạt sáng tắt bằng trạng thái hiển thị thực.
- Kiểm tra 390px: không tràn ngang, nội dung Cài đặt cuộn riêng, nút Xong nằm trọn trong khung nhìn và đóng được bảng.
- Máy chủ kiểm tra enum ngoại hình, từ chối giá trị lạ, phát model cho người khác và giữ nguyên sau luân hồi / kết nối lại. Tiến trình có sẵn không bị đặt lại khi cập nhật diện mạo.

Ảnh chọn bàn giao nằm tại `docs/screenshots/ui-0.4/`:

- `settings-audio-0.4.png`
- `settings-appearance-0.4.png`
- `settings-mobile-0.4.png`
- `controls-0.4.png`

Âm thanh được kiểm tra ở tầng API / graph và trạng thái trình duyệt; chưa có đánh giá chất lượng nghe bằng thiết bị âm thanh thực. Cài đặt riêng theo trình duyệt, chưa có cấu hình tài khoản xuyên thiết bị hoặc gán lại phím. Chưa kiểm tra tải nhiều phòng, Safari / Firefox hoặc tất cả độ phân giải màn hình.
